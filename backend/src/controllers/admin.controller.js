// backend/src/controllers/admin.controller.js

const User = require('../models/User.model');
const Course = require('../models/Course.model');
const Payment = require('../models/Payment.model');
const LiveClass = require('../models/LiveClass.model');
const Material = require('../models/Material.model');
const Assignment = require('../models/Assignment.model');
const logger = require('../utils/logger');
const { sendEmail } = require('../services/email.service');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);

        const [
            totalStats,
            todayStats,
            weeklyStats,
            pendingApprovals,
            recentActivities
        ] = await Promise.all([
            // Total platform stats
            Promise.all([
                User.countDocuments({ role: 'student' }),
                User.countDocuments({ role: 'teacher' }),
                Course.countDocuments(),
                Payment.aggregate([
                    { $match: { status: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ])
            ]),

            // Today's stats
            Promise.all([
                User.countDocuments({ createdAt: { $gte: startOfDay } }),
                Course.countDocuments({ createdAt: { $gte: startOfDay } }),
                Payment.countDocuments({ 
                    createdAt: { $gte: startOfDay },
                    status: 'completed' 
                }),
                Payment.aggregate([
                    { 
                        $match: { 
                            createdAt: { $gte: startOfDay },
                            status: 'completed' 
                        } 
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ])
            ]),

            // Weekly stats
            Promise.all([
                User.countDocuments({ createdAt: { $gte: startOfWeek } }),
                Course.countDocuments({ createdAt: { $gte: startOfWeek } }),
                Payment.aggregate([
                    { 
                        $match: { 
                            createdAt: { $gte: startOfWeek },
                            status: 'completed' 
                        } 
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ])
            ]),

            // Pending approvals
            Promise.all([
                Course.countDocuments({ status: 'pending' }),
                User.countDocuments({ status: 'pending' })
            ]),

            // Recent activities
            getRecentAdminActivities()
        ]);

        const stats = {
            totals: {
                students: totalStats[0],
                teachers: totalStats[1],
                courses: totalStats[2],
                revenue: totalStats[3][0]?.total || 0
            },
            today: {
                newUsers: todayStats[0],
                newCourses: todayStats[1],
                transactions: todayStats[2],
                revenue: todayStats[3][0]?.total || 0
            },
            weekly: {
                newUsers: weeklyStats[0],
                newCourses: weeklyStats[1],
                revenue: weeklyStats[2][0]?.total || 0
            },
            pending: {
                courses: pendingApprovals[0],
                users: pendingApprovals[1]
            },
            charts: {
                userGrowth: await getUserGrowthChart(),
                revenueGrowth: await getRevenueGrowthChart(),
                courseCategories: await getCourseCategoryDistribution()
            },
            recentActivities,
            topPerformers: await getTopPerformers()
        };

        logger.info(`Admin dashboard stats fetched by ${req.user.id}`);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error(`Admin Dashboard Stats Error: ${error.message}`, {
            userId: req.user.id,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get all users with advanced filtering
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            role, 
            status, 
            search,
            verified,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            startDate,
            endDate
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (role) filter.role = role;
        if (status) filter.status = status;
        if (verified !== undefined) filter.verified = verified === 'true';
        
        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Search filter
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Sort configuration
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const users = await User.find(filter)
            .select('-password -resetPasswordToken -resetPasswordExpire')
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate({
                path: 'coursesEnrolled',
                select: 'title',
                options: { limit: 3 }
            })
            .populate({
                path: 'coursesCreated',
                select: 'title',
                options: { limit: 3 }
            })
            .lean();

        // Get total count for pagination
        const total = await User.countDocuments(filter);

        // Calculate statistics
        const stats = {
            total,
            byRole: await User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            byStatus: await User.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        };

        logger.info(`Admin fetched users list`, {
            adminId: req.user.id,
            filter,
            total
        });

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                stats
            }
        });
    } catch (error) {
        logger.error(`Get All Users Error: ${error.message}`, {
            adminId: req.user.id,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des utilisateurs'
        });
    }
};

/**
 * @desc    Get all courses for admin
 * @route   GET /api/admin/courses
 * @access  Private/Admin
 */
exports.getAllCourses = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            category,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            minPrice,
            maxPrice
        } = req.query;

        const filter = {};
        
        if (status) filter.status = status;
        if (category) filter.category = category;
        
        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const courses = await Course.find(filter)
            .populate('instructor', 'fullName email')
            .populate('students', 'fullName email')
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Course.countDocuments(filter);

        // Get course statistics
        const courseStats = await Course.aggregate([
            { $group: {
                _id: null,
                totalRevenue: {
                    $sum: { $multiply: ['$price', { $size: '$students' }] }
                },
                avgRating: { $avg: '$rating' },
                totalEnrollments: { $sum: { $size: '$students' } }
            }}
        ]);

        res.status(200).json({
            success: true,
            data: {
                courses,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                stats: {
                    totalCourses: total,
                    totalRevenue: courseStats[0]?.totalRevenue || 0,
                    avgRating: courseStats[0]?.avgRating || 0,
                    totalEnrollments: courseStats[0]?.totalEnrollments || 0
                }
            }
        });
    } catch (error) {
        logger.error(`Get All Courses Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

/**
 * @desc    Get all payments
 * @route   GET /api/admin/payments
 * @access  Private/Admin
 */
exports.getAllPayments = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            paymentMethod,
            search,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = {};
        
        if (status) filter.status = status;
        if (paymentMethod) filter.paymentMethod = paymentMethod;
        
        // Date range
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        
        if (search) {
            filter.$or = [
                { 'user.email': { $regex: search, $options: 'i' } },
                { 'user.fullName': { $regex: search, $options: 'i' } },
                { transactionId: { $regex: search, $options: 'i' } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const payments = await Payment.find(filter)
            .populate('user', 'fullName email')
            .populate('course', 'title price')
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Payment.countDocuments(filter);

        // Payment statistics
        const paymentStats = await Payment.aggregate([
            { $match: filter },
            { $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                completedAmount: { 
                    $sum: { 
                        $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] 
                    }
                },
                pendingAmount: { 
                    $sum: { 
                        $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] 
                    }
                },
                failedAmount: { 
                    $sum: { 
                        $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0] 
                    }
                }
            }}
        ]);

        // Payment method distribution
        const methodDistribution = await Payment.aggregate([
            { $match: filter },
            { $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 },
                amount: { $sum: '$amount' }
            }}
        ]);

        res.status(200).json({
            success: true,
            data: {
                payments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                stats: {
                    totalAmount: paymentStats[0]?.totalAmount || 0,
                    completedAmount: paymentStats[0]?.completedAmount || 0,
                    pendingAmount: paymentStats[0]?.pendingAmount || 0,
                    failedAmount: paymentStats[0]?.failedAmount || 0,
                    methodDistribution
                }
            }
        });
    } catch (error) {
        logger.error(`Get All Payments Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Rôle invalide. Doit être: student, teacher ou admin'
            });
        }

        // Prevent self-demotion
        if (id === req.user.id && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Vous ne pouvez pas modifier votre propre rôle admin'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const oldRole = user.role;
        user.role = role;
        user.updatedAt = Date.now();
        await user.save();

        // Log role change
        logger.info(`User role updated`, {
            adminId: req.user.id,
            userId: id,
            oldRole,
            newRole: role
        });

        // Send notification to user
        await sendEmail({
            to: user.email,
            subject: 'Mise à jour de votre rôle sur EDUCOURS',
            html: `
                <h2>Changement de rôle</h2>
                <p>Bonjour ${user.fullName},</p>
                <p>Votre rôle sur EDUCOURS a été mis à jour de <strong>${oldRole}</strong> à <strong>${role}</strong>.</p>
                <p>Cette modification peut affecter vos permissions sur la plateforme.</p>
                <br>
                <p>Cordialement,<br>L'équipe d'administration EDUCOURS</p>
            `
        });

        res.status(200).json({
            success: true,
            message: `Rôle de l'utilisateur mis à jour avec succès (${oldRole} → ${role})`,
            data: {
                userId: user._id,
                fullName: user.fullName,
                email: user.email,
                oldRole,
                newRole: role
            }
        });
    } catch (error) {
        logger.error(`Update User Role Error: ${error.message}`, {
            adminId: req.user.id,
            userId: req.params.id
        });
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du rôle'
        });
    }
};

/**
 * @desc    Delete a course
 * @route   DELETE /api/admin/courses/:id
 * @access  Private/Admin
 */
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Cours non trouvé'
            });
        }

        // Check if course has enrolled students
        if (course.students.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de supprimer un cours avec des étudiants inscrits'
            });
        }

        // Store course info for logging
        const courseInfo = {
            title: course.title,
            instructor: course.instructor,
            price: course.price,
            studentsCount: course.students.length
        };

        // Delete associated materials
        await Material.deleteMany({ course: id });
        
        // Delete assignments
        await Assignment.deleteMany({ course: id });
        
        // Delete live classes
        await LiveClass.deleteMany({ course: id });

        // Delete the course
        await course.deleteOne();

        logger.info(`Course deleted by admin`, {
            adminId: req.user.id,
            courseId: id,
            courseInfo
        });

        res.status(200).json({
            success: true,
            message: 'Cours supprimé avec succès',
            data: {
                courseId: id,
                ...courseInfo
            }
        });
    } catch (error) {
        logger.error(`Delete Course Error: ${error.message}`, {
            adminId: req.user.id,
            courseId: req.params.id
        });
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du cours'
        });
    }
};

/**
 * @desc    Get revenue analytics
 * @route   GET /api/admin/analytics/revenue
 * @access  Private/Admin
 */
exports.getRevenueAnalytics = async (req, res) => {
    try {
        const { period = 'monthly', year, compareYear } = req.query;

        let matchStage = { status: 'completed' };
        let groupFormat = '%Y-%m';
        let compareMatchStage = { status: 'completed' };

        // Configure time period
        if (period === 'daily') {
            groupFormat = '%Y-%m-%d';
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            matchStage.createdAt = { $gte: startDate };
            
            if (compareYear) {
                const compareStartDate = new Date(compareYear);
                compareStartDate.setDate(compareStartDate.getDate() - 30);
                compareMatchStage.createdAt = { $gte: compareStartDate };
            }
        } else if (period === 'monthly' && year) {
            matchStage.createdAt = {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            };
            
            if (compareYear) {
                compareMatchStage.createdAt = {
                    $gte: new Date(`${compareYear}-01-01`),
                    $lte: new Date(`${compareYear}-12-31`)
                };
            }
        } else if (period === 'yearly') {
            groupFormat = '%Y';
        }

        // Get current period data
        const revenueData = await Payment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        $dateToString: { format: groupFormat, date: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    transactions: { $sum: 1 },
                    averageTicket: { $avg: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get comparison data if requested
        let comparisonData = [];
        if (compareYear) {
            comparisonData = await Payment.aggregate([
                { $match: compareMatchStage },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: groupFormat, date: '$createdAt' }
                        },
                        revenue: { $sum: '$amount' },
                        transactions: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        }

        // Get top revenue courses
        const topCourses = await Payment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$course',
                    revenue: { $sum: '$amount' },
                    enrollments: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: '$course' },
            {
                $project: {
                    courseId: '$_id',
                    courseTitle: '$course.title',
                    revenue: 1,
                    enrollments: 1,
                    instructor: '$course.instructor'
                }
            }
        ]);

        // Get payment method distribution
        const paymentMethods = await Payment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$paymentMethod',
                    revenue: { $sum: '$amount' },
                    transactions: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // Calculate summary statistics
        const summary = await Payment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalTransactions: { $sum: 1 },
                    avgTransaction: { $avg: '$amount' },
                    maxTransaction: { $max: '$amount' },
                    minTransaction: { $min: '$amount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                period,
                revenueData,
                comparisonData,
                topCourses,
                paymentMethods,
                summary: summary[0] || {},
                growthRate: await calculateRevenueGrowthRate(matchStage)
            }
        });
    } catch (error) {
        logger.error(`Revenue Analytics Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'analyse des revenus'
        });
    }
};

// Helper Functions
async function getRecentAdminActivities() {
    const activities = [];

    // Recent user registrations
    const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName email role createdAt')
        .lean();
    
    recentUsers.forEach(user => {
        activities.push({
            type: 'user_registration',
            user: user.fullName,
            role: user.role,
            email: user.email,
            timestamp: user.createdAt,
            message: `${user.fullName} s'est inscrit en tant que ${user.role}`
        });
    });

    // Recent course creations
    const recentCourses = await Course.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('instructor', 'fullName')
        .select('title instructor price createdAt')
        .lean();
    
    recentCourses.forEach(course => {
        activities.push({
            type: 'course_created',
            course: course.title,
            instructor: course.instructor.fullName,
            price: course.price,
            timestamp: course.createdAt,
            message: `Nouveau cours "${course.title}" créé par ${course.instructor.fullName}`
        });
    });

    // Recent payments
    const recentPayments = await Payment.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'fullName')
        .populate('course', 'title')
        .select('amount user course createdAt')
        .lean();
    
    recentPayments.forEach(payment => {
        activities.push({
            type: 'payment_completed',
            amount: payment.amount,
            student: payment.user.fullName,
            course: payment.course.title,
            timestamp: payment.createdAt,
            message: `${payment.user.fullName} a payé ${payment.amount}€ pour "${payment.course.title}"`
        });
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp);
}

async function getUserGrowthChart() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return await User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' }
                },
                students: {
                    $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
                },
                teachers: {
                    $sum: { $cond: [{ $eq: ['$role', 'teacher'] }, 1, 0] }
                },
                total: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                period: {
                    $concat: [
                        { $toString: '$_id.year' },
                        '-',
                        { $toString: '$_id.month' }
                    ]
                },
                students: 1,
                teachers: 1,
                total: 1
            }
        },
        { $sort: { period: 1 } }
    ]);
}

async function getRevenueGrowthChart() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return await Payment.aggregate([
        { 
            $match: { 
                createdAt: { $gte: sixMonthsAgo },
                status: 'completed'
            } 
        },
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' }
                },
                revenue: { $sum: '$amount' },
                transactions: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                period: {
                    $concat: [
                        { $toString: '$_id.year' },
                        '-',
                        { $toString: '$_id.month' }
                    ]
                },
                revenue: 1,
                transactions: 1,
                average: { $divide: ['$revenue', '$transactions'] }
            }
        },
        { $sort: { period: 1 } }
    ]);
}

async function getCourseCategoryDistribution() {
    return await Course.aggregate([
        { $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalEnrollments: { $sum: { $size: '$students' } },
            avgPrice: { $avg: '$price' },
            avgRating: { $avg: '$rating' }
        }},
        { $sort: { count: -1 } }
    ]);
}

async function getTopPerformers() {
    // Top instructors by revenue
    const topInstructors = await Payment.aggregate([
        { $match: { status: 'completed' } },
        {
            $lookup: {
                from: 'courses',
                localField: 'course',
                foreignField: '_id',
                as: 'course'
            }
        },
        { $unwind: '$course' },
        {
            $group: {
                _id: '$course.instructor',
                revenue: { $sum: '$amount' },
                courses: { $addToSet: '$course._id' },
                enrollments: { $sum: 1 }
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'instructor'
            }
        },
        { $unwind: '$instructor' },
        {
            $project: {
                instructor: '$instructor.fullName',
                email: '$instructor.email',
                avatar: '$instructor.avatar',
                revenue: 1,
                coursesCount: { $size: '$courses' },
                enrollments: 1
            }
        }
    ]);

    // Top courses by enrollment
    const topCourses = await Course.aggregate([
        {
            $project: {
                title: 1,
                instructor: 1,
                price: 1,
                rating: 1,
                enrollments: { $size: '$students' },
                revenue: { $multiply: ['$price', { $size: '$students' }] }
            }
        },
        { $sort: { enrollments: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'users',
                localField: 'instructor',
                foreignField: '_id',
                as: 'instructor'
            }
        },
        { $unwind: '$instructor' },
        {
            $project: {
                title: 1,
                instructor: '$instructor.fullName',
                price: 1,
                rating: 1,
                enrollments: 1,
                revenue: 1
            }
        }
    ]);

    return {
        topInstructors,
        topCourses
    };
}

async function calculateRevenueGrowthRate(matchStage) {
    const currentMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const currentMatch = { ...matchStage, createdAt: { $gte: currentMonth } };
    const lastMatch = { ...matchStage, createdAt: { $gte: lastMonth, $lt: currentMonth } };

    const [currentRevenue, lastRevenue] = await Promise.all([
        Payment.aggregate([
            { $match: currentMatch },
            { $group: { _id: null, revenue: { $sum: '$amount' } } }
        ]),
        Payment.aggregate([
            { $match: lastMatch },
            { $group: { _id: null, revenue: { $sum: '$amount' } } }
        ])
    ]);

    const current = currentRevenue[0]?.revenue || 0;
    const last = lastRevenue[0]?.revenue || 0;

    if (last === 0) return current > 0 ? 100 : 0;
    
    return ((current - last) / last) * 100;
}