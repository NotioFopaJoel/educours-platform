// teacher.controller.js
const Course = require('../models/Course.model');
const Student = require('../models/Student.model');
const Enrollment = require('../models/Enrollment.model');
const Assignment = require('../models/Assignment.model');
const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const LiveClass = require('../models/LiveClass.model');
const Announcement = require('../models/Announcement.model');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

/*
 * @desc    Get teacher dashboard
 * @route   GET /api/teachers/dashboard
 * @access  Private/Teacher
 */
const getDashboard = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get all courses for this teacher
        const courses = await Course.find({ instructor: teacherId })
            .select('title thumbnail enrollmentCount rating totalRevenue isPublished createdAt');

        // Calculate statistics
        const totalStudents = await Enrollment.countDocuments({
            course: { $in: courses.map(c => c._id) }
        });

        const totalRevenue = courses.reduce((sum, course) => sum + (course.totalRevenue || 0), 0);
        const averageRating = courses.reduce((sum, course) => sum + (course.rating || 0), 0) / (courses.length || 1);

        // Recent enrollments
        const recentEnrollments = await Enrollment.find({
            course: { $in: courses.map(c => c._id) },
            enrolledAt: { $gte: thirtyDaysAgo }
        })
        .populate('student', 'name avatar')
        .populate('course', 'title')
        .sort({ enrolledAt: -1 })
        .limit(10);

        // Pending assignments to grade
        const pendingSubmissions = await AssignmentSubmission.countDocuments({
            assignment: { $in: await Assignment.find({ instructor: teacherId }).distinct('_id') },
            status: 'submitted'
        });

        // Upcoming live classes
        const upcomingClasses = await LiveClass.find({
            instructor: teacherId,
            startTime: { $gte: new Date() }
        })
        .populate('course', 'title')
        .sort('startTime')
        .limit(5);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalCourses: courses.length,
                    totalStudents,
                    totalRevenue,
                    averageRating: parseFloat(averageRating.toFixed(1)),
                    activeCourses: courses.filter(c => c.isPublished).length,
                    pendingSubmissions
                },
                courses: courses,
                recentEnrollments,
                upcomingClasses,
                revenueChart: await getRevenueChartData(teacherId, 30),
                enrollmentChart: await getEnrollmentChartData(teacherId, 30)
            }
        });
    } catch (error) {
        console.error('Teacher dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching dashboard',
            error: error.message
        });
    }
};

/**
 * @desc    Get teacher's courses
 * @route   GET /api/teachers/courses
 * @access  Private/Teacher
 */
const getMyCourses = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;

        const query = { instructor: teacherId };
        if (status === 'published') query.isPublished = true;
        if (status === 'draft') query.isPublished = false;

        const courses = await Course.find(query)
            .select('title description thumbnail category level price isPublished enrollmentCount rating totalRevenue createdAt')
            .populate('category', 'name')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Course.countDocuments(query);

        // Add additional statistics for each course
        const coursesWithStats = await Promise.all(courses.map(async (course) => {
            const stats = await Enrollment.aggregate([
                { $match: { course: course._id } },
                {
                    $group: {
                        _id: null,
                        averageProgress: { $avg: '$progress' },
                        completionCount: { 
                            $sum: { $cond: [{ $gte: ['$progress', 100] }, 1, 0] }
                        }
                    }
                }
            ]);

            return {
                ...course.toObject(),
                statistics: {
                    averageProgress: stats[0]?.averageProgress || 0,
                    completionCount: stats[0]?.completionCount || 0,
                    dropoutRate: course.enrollmentCount > 0 ? 
                        ((course.enrollmentCount - (stats[0]?.completionCount || 0)) / course.enrollmentCount * 100) : 0
                }
            };
        }));

        res.status(200).json({
            success: true,
            data: coursesWithStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching courses',
            error: error.message
        });
    }
};

/**
 * @desc    Create a new course
 * @route   POST /api/teachers/courses
 * @access  Private/Teacher
 */
const createCourse = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const teacherId = req.user.id;
        
        const {
            title,
            description,
            shortDescription,
            category,
            level,
            price,
            language,
            requirements,
            learningOutcomes,
            tags
        } = req.body;

        // Check if course with same title exists
        const existingCourse = await Course.findOne({ 
            title,
            instructor: teacherId 
        });

        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'A course with this title already exists'
            });
        }

        const course = new Course({
            title,
            description,
            shortDescription,
            instructor: teacherId,
            category,
            level: level || 'beginner',
            price: price || 0,
            language: language || 'English',
            requirements: requirements || [],
            learningOutcomes: learningOutcomes || [],
            tags: tags || [],
            isPublished: false,
            status: 'draft'
        });

        await course.save();

        // Create welcome section
        const welcomeSection = new Section({
            course: course._id,
            title: 'Introduction',
            description: 'Welcome to the course',
            order: 1
        });

        await welcomeSection.save();

        course.sections.push(welcomeSection._id);
        await course.save();

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course
        });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating course',
            error: error.message
        });
    }
};

/**
 * @desc    Get course by ID
 * @route   GET /api/teachers/courses/:id
 * @access  Private/Teacher
 */
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;

        const course = await Course.findOne({
            _id: id,
            instructor: teacherId
        })
        .populate({
            path: 'sections',
            populate: {
                path: 'lessons',
                select: 'title type duration order isPublished'
            }
        })
        .populate('category', 'name')
        .populate('students', 'name email avatar')
        .populate('assignments', 'title deadline submissionsCount');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or access denied'
            });
        }

        // Get detailed statistics
        const enrollmentStats = await Enrollment.aggregate([
            { $match: { course: course._id } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    averageProgress: { $avg: '$progress' },
                    completed: { 
                        $sum: { $cond: [{ $gte: ['$progress', 100] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get recent reviews
        const recentReviews = await Review.find({ course: course._id })
            .populate('student', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                course,
                statistics: {
                    ...enrollmentStats[0],
                    dropoutRate: enrollmentStats[0] ? 
                        ((enrollmentStats[0].total - enrollmentStats[0].completed) / enrollmentStats[0].total * 100) : 0,
                    averageTimeToComplete: await getAverageCompletionTime(course._id)
                },
                recentReviews,
                revenueData: await getCourseRevenueData(course._id, 30)
            }
        });
    } catch (error) {
        console.error('Get course by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching course',
            error: error.message
        });
    }
};

/**
 * @desc    Update course
 * @route   PUT /api/teachers/courses/:id
 * @access  Private/Teacher
 */
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;

        // Check if course exists and belongs to teacher
        const course = await Course.findOne({
            _id: id,
            instructor: teacherId
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or access denied'
            });
        }

        // Don't allow updating if course is published and certain fields
        if (course.isPublished) {
            const restrictedFields = ['price', 'category', 'level'];
            const hasRestrictedFields = Object.keys(req.body).some(field => 
                restrictedFields.includes(field)
            );

            if (hasRestrictedFields) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot update certain fields on published courses'
                });
            }
        }

        // Update course
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                course[key] = req.body[key];
            }
        });

        course.updatedAt = new Date();
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: course
        });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating course',
            error: error.message
        });
    }
};

/**
 * @desc    Publish course
 * @route   PUT /api/teachers/courses/:id/publish
 * @access  Private/Teacher
 */
const publishCourse = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const teacherId = req.user.id;

        const course = await Course.findOne({
            _id: id,
            instructor: teacherId
        })
        .populate('sections')
        .session(session);

        if (!course) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Validation checks before publishing
        if (!course.thumbnail) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Course thumbnail is required'
            });
        }

        // Check if course has at least one section with content
        const hasContent = await checkCourseContent(course._id);
        if (!hasContent) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Course must have at least one lesson'
            });
        }

        // Update course status
        course.isPublished = true;
        course.status = 'published';
        course.publishedAt = new Date();
        
        await course.save({ session });

        // Create announcement for existing students
        if (course.students.length > 0) {
            const announcement = new Announcement({
                course: course._id,
                title: 'Course Published!',
                content: `The course "${course.title}" has been published and is now available with all content.`,
                type: 'course_published',
                instructor: teacherId
            });
            await announcement.save({ session });
        }

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: 'Course published successfully',
            data: course
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Publish course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error publishing course',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

/**
 * @desc    Get course students
 * @route   GET /api/teachers/courses/:id/students
 * @access  Private/Teacher
 */
const getCourseStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;
        const { page = 1, limit = 20, search } = req.query;

        // Verify course belongs to teacher
        const course = await Course.findOne({
            _id: id,
            instructor: teacherId
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or access denied'
            });
        }

        const query = { course: id };
        
        if (search) {
            query['student.name'] = { $regex: search, $options: 'i' };
        }

        const enrollments = await Enrollment.find(query)
            .populate({
                path: 'student',
                select: 'name email avatar enrolledAt lastActive'
            })
            .sort({ enrolledAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Enrollment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: enrollments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get course students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching students',
            error: error.message
        });
    }
};

// Helper functions
const getRevenueChartData = async (teacherId, days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: 'completed',
                'items.course.instructor': teacherId
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                revenue: { $sum: '$totalAmount' },
                transactions: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);
};

const getEnrollmentChartData = async (teacherId, days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Enrollment.aggregate([
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
            $match: {
                'course.instructor': teacherId,
                enrolledAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$enrolledAt' }
                },
                enrollments: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);
};

const checkCourseContent = async (courseId) => {
    const sections = await Section.find({ course: courseId })
        .populate('lessons');
    
    return sections.some(section => section.lessons && section.lessons.length > 0);
};

module.exports = {
    getDashboard,
    getMyCourses,
    createCourse,
    getCourseById,
    updateCourse,
    publishCourse,
    getCourseStudents
    // Note: Additional controller methods for assignments, live classes, etc.
    // would follow the same professional pattern
};