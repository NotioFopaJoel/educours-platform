// user.controller.js
const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const Enrollment = require('../models/Enrollment.model');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .select('-password -refreshToken')
            .populate({
                path: 'notifications',
                options: { sort: { createdAt: -1 }, limit: 10 }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get role-specific data
        let roleData = {};
        if (user.role === 'student') {
            const student = await Student.findOne({ user: userId })
                .populate({
                    path: 'enrollments',
                    populate: {
                        path: 'course',
                        select: 'title thumbnail instructor progress'
                    }
                })
                .select('points level completedCourses');
            
            roleData = student ? student.toObject() : {};
        } else if (user.role === 'teacher') {
            const teacher = await Teacher.findOne({ user: userId })
                .select('bio specialization totalStudents averageRating totalEarnings')
                .populate('courses', 'title thumbnail enrollmentCount');
            
            roleData = teacher ? teacher.toObject() : {};
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    ...user.toObject(),
                    ...roleData
                },
                statistics: await getUserStatistics(userId, user.role)
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile',
            error: error.message
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const userId = req.user.id;
        const updateData = req.body;

        // Remove restricted fields
        delete updateData.role;
        delete updateData.email;
        delete updateData.password;
        delete updateData.isEmailVerified;
        delete updateData.status;

        // Handle password update separately
        if (updateData.newPassword) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(updateData.currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(updateData.newPassword, salt);
            await user.save();

            delete updateData.newPassword;
            delete updateData.currentPassword;
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                ...updateData,
                updatedAt: new Date()
            },
            { 
                new: true,
                runValidators: true 
            }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update role-specific profile if needed
        if (user.role === 'student' && (updateData.bio || updateData.skills)) {
            await Student.findOneAndUpdate(
                { user: userId },
                {
                    bio: updateData.bio,
                    skills: updateData.skills
                },
                { new: true }
            );
        } else if (user.role === 'teacher' && (updateData.bio || updateData.specialization)) {
            await Teacher.findOneAndUpdate(
                { user: userId },
                {
                    bio: updateData.bio,
                    specialization: updateData.specialization
                },
                { new: true }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error updating profile',
            error: error.message
        });
    }
};

/**
 * @desc    Get user enrollments
 * @route   GET /api/users/enrollments
 * @access  Private
 */
const getEnrollments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status, sort = '-enrolledAt' } = req.query;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let enrollments;
        let total;

        if (user.role === 'student') {
            const student = await Student.findOne({ user: userId });
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student profile not found'
                });
            }

            const query = { student: student._id };
            if (status) query.status = status;

            enrollments = await Enrollment.find(query)
                .populate({
                    path: 'course',
                    select: 'title thumbnail description instructor duration level category',
                    populate: {
                        path: 'instructor',
                        select: 'name avatar'
                    }
                })
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            total = await Enrollment.countDocuments(query);
        } else if (user.role === 'teacher') {
            // For teachers, get their courses' enrollments
            const teacher = await Teacher.findOne({ user: userId });
            const courses = await Course.find({ instructor: userId }).select('_id');

            const query = { 
                course: { $in: courses.map(c => c._id) }
            };
            if (status) query.status = status;

            enrollments = await Enrollment.find(query)
                .populate({
                    path: 'course',
                    select: 'title thumbnail'
                })
                .populate({
                    path: 'student',
                    select: 'name email avatar'
                })
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            total = await Enrollment.countDocuments(query);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid user role for enrollments'
            });
        }

        // Calculate statistics
        const completed = enrollments.filter(e => e.progress >= 100).length;
        const inProgress = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
        const notStarted = enrollments.filter(e => e.progress === 0).length;

        res.status(200).json({
            success: true,
            data: {
                enrollments,
                statistics: {
                    total: enrollments.length,
                    completed,
                    inProgress,
                    notStarted,
                    completionRate: enrollments.length > 0 ? (completed / enrollments.length * 100) : 0
                }
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get enrollments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching enrollments',
            error: error.message
        });
    }
};

/**
 * @desc    Get course progress
 * @route   GET /api/users/progress/:courseId
 * @access  Private
 */
const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let enrollment;
        
        if (user.role === 'student') {
            const student = await Student.findOne({ user: userId });
            enrollment = await Enrollment.findOne({
                student: student._id,
                course: courseId
            })
            .populate({
                path: 'course',
                select: 'title sections duration instructor',
                populate: {
                    path: 'sections',
                    select: 'title lessons order',
                    populate: {
                        path: 'lessons',
                        select: 'title duration type isCompleted'
                    }
                }
            });
        } else if (user.role === 'teacher') {
            // For teachers, get average progress for their course
            enrollment = await Enrollment.aggregate([
                {
                    $match: { course: mongoose.Types.ObjectId(courseId) }
                },
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
                    $match: { 'course.instructor': mongoose.Types.ObjectId(userId) }
                },
                {
                    $group: {
                        _id: '$course',
                        averageProgress: { $avg: '$progress' },
                        totalStudents: { $sum: 1 },
                        completedStudents: {
                            $sum: { $cond: [{ $gte: ['$progress', 100] }, 1, 0] }
                        }
                    }
                }
            ]);

            if (enrollment.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found or access denied'
                });
            }
        }

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                enrollment,
                analytics: user.role === 'teacher' ? 
                    await getCourseAnalytics(courseId) : null
            }
        });
    } catch (error) {
        console.error('Get course progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching progress',
            error: error.message
        });
    }
};

/**
 * @desc    Get public profile
 * @route   GET /api/users/public/profile/:id
 * @access  Public
 */
const getPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id)
            .select('name username avatar bio role createdAt')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Add role-specific public data
        if (user.role === 'teacher') {
            const teacher = await Teacher.findOne({ user: id })
                .select('specialization totalStudents averageRating courses')
                .populate('courses', 'title thumbnail enrollmentCount rating')
                .lean();
            
            user.teacherProfile = teacher;
        } else if (user.role === 'student') {
            // For students, only show limited public info
            const student = await Student.findOne({ user: id })
                .select('level points completedCourses')
                .lean();
            
            user.studentProfile = student;
        }

        // Remove sensitive data
        delete user.email;
        delete user.phone;

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching public profile',
            error: error.message
        });
    }
};

// Helper functions
const getUserStatistics = async (userId, role) => {
    const statistics = {};

    if (role === 'student') {
        const student = await Student.findOne({ user: userId });
        if (student) {
            statistics.points = student.points || 0;
            statistics.level = student.level || 1;
            statistics.completedCourses = student.completedCourses?.length || 0;
            statistics.totalEnrollments = student.enrollments?.length || 0;
            
            // Calculate average grade
            const grades = await Grade.find({ student: student._id });
            statistics.averageGrade = grades.length > 0 ? 
                grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length : 0;
        }
    } else if (role === 'teacher') {
        const teacher = await Teacher.findOne({ user: userId });
        if (teacher) {
            statistics.totalStudents = teacher.totalStudents || 0;
            statistics.averageRating = teacher.averageRating || 0;
            statistics.totalCourses = teacher.courses?.length || 0;
            statistics.totalEarnings = teacher.totalEarnings || 0;
            
            // Recent reviews
            const recentReviews = await Review.find({ 
                course: { $in: teacher.courses } 
            })
            .sort({ createdAt: -1 })
            .limit(5);
            
            statistics.recentReviews = recentReviews;
        }
    }

    // Common statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    statistics.lastActive = await getLastActivity(userId);
    statistics.accountAge = Math.floor((new Date() - new Date(await User.findById(userId).select('createdAt'))) / (1000 * 60 * 60 * 24));

    return statistics;
};

const getLastActivity = async (userId) => {
    const lastLogin = await LoginHistory.findOne({ user: userId })
        .sort({ loginAt: -1 })
        .select('loginAt');
    
    return lastLogin ? lastLogin.loginAt : null;
};

const getCourseAnalytics = async (courseId) => {
    return await Enrollment.aggregate([
        { $match: { course: mongoose.Types.ObjectId(courseId) } },
        {
            $group: {
                _id: null,
                averageProgress: { $avg: '$progress' },
                totalStudents: { $sum: 1 },
                completed: { $sum: { $cond: [{ $gte: ['$progress', 100] }, 1, 0] } },
                averageTimeSpent: { $avg: '$timeSpent' }
            }
        }
    ]);
};

module.exports = {
    getProfile,
    updateProfile,
    getEnrollments,
    getCourseProgress,
    getPublicProfile
};