// student.controller.js
const Course = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const Student = require('../models/Student.model');
const { validationResult } = require('express-validator');

/**
 * @desc    Get student dashboard
 * @route   GET /api/students/dashboard
 * @access  Private/Student
 */
const getDashboard = async (req, res) => {
    try {
        const studentId = req.user.id;
        
        // Get student with populated data
        const student = await Student.findOne({ user: studentId })
            .populate({
                path: 'enrollments',
                populate: {
                    path: 'course',
                    select: 'title description thumbnail instructor progress'
                }
            })
            .populate('completedCourses')
            .populate('pendingAssignments');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        // Calculate statistics
        const totalCourses = student.enrollments.length;
        const completedCourses = student.completedCourses.length;
        const inProgressCourses = totalCourses - completedCourses;
        const averageGrade = student.averageGrade || 0;
        const totalStudyTime = student.totalStudyTime || 0;

        // Recent activities
        const recentActivities = await Enrollment.find({ student: student._id })
            .sort({ lastAccessed: -1 })
            .limit(5)
            .populate('course', 'title');

        res.status(200).json({
            success: true,
            data: {
                profile: {
                    name: student.name,
                    email: student.email,
                    avatar: student.avatar,
                    level: student.level,
                    points: student.points
                },
                statistics: {
                    totalCourses,
                    completedCourses,
                    inProgressCourses,
                    averageGrade,
                    totalStudyTime,
                    completionRate: totalCourses > 0 ? (completedCourses / totalCourses * 100) : 0
                },
                enrollments: student.enrollments,
                recentActivities,
                pendingAssignments: student.pendingAssignments,
                upcomingDeadlines: await getUpcomingDeadlines(student._id)
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching dashboard',
            error: error.message
        });
    }
};

/**
 * @desc    Get enrolled courses
 * @route   GET /api/students/enrolled-courses
 * @access  Private/Student
 */
const getEnrolledCourses = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;
        
        const student = await Student.findOne({ user: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const query = { student: student._id };
        if (status) query.status = status;

        const enrollments = await Enrollment.find(query)
            .populate({
                path: 'course',
                select: 'title description thumbnail instructor duration category level',
                populate: {
                    path: 'instructor',
                    select: 'name avatar'
                }
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
        console.error('Enrolled courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching enrolled courses',
            error: error.message
        });
    }
};

/**
 * @desc    Enroll in a course
 * @route   POST /api/students/enroll/:courseId
 * @access  Private/Student
 */
const enrollInCourse = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { courseId } = req.params;
        const studentId = req.user.id;

        // Check if course exists and is published
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (!course.isPublished) {
            return res.status(400).json({
                success: false,
                message: 'Course is not published'
            });
        }

        // Get student
        const student = await Student.findOne({ user: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: student._id,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this course'
            });
        }

        // Create enrollment
        const enrollment = new Enrollment({
            student: student._id,
            course: courseId,
            enrolledAt: new Date(),
            status: 'active',
            progress: 0,
            lastAccessed: new Date()
        });

        await enrollment.save({ session });

        // Update student's enrollments
        student.enrollments.push(enrollment._id);
        await student.save({ session });

        // Update course enrollment count
        course.enrollmentCount += 1;
        await course.save({ session });

        await session.commitTransaction();

        // Populate response data
        const populatedEnrollment = await Enrollment.findById(enrollment._id)
            .populate({
                path: 'course',
                select: 'title description thumbnail instructor'
            });

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course',
            data: populatedEnrollment
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Enrollment error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this course'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during enrollment',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

/**
 * @desc    Get course progress
 * @route   GET /api/students/progress/:courseId
 * @access  Private/Student
 */
const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;

        const student = await Student.findOne({ user: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const enrollment = await Enrollment.findOne({
            student: student._id,
            course: courseId
        }).populate({
            path: 'course',
            select: 'title sections duration',
            populate: {
                path: 'sections',
                select: 'title lessons order',
                populate: {
                    path: 'lessons',
                    select: 'title duration type isCompleted'
                }
            }
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        // Calculate progress
        const totalLessons = enrollment.course.sections.reduce((total, section) => {
            return total + section.lessons.length;
        }, 0);

        const completedLessons = enrollment.course.sections.reduce((total, section) => {
            return total + section.lessons.filter(lesson => lesson.isCompleted).length;
        }, 0);

        const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons * 100) : 0;

        // Get next lesson
        const nextLesson = findNextLesson(enrollment.course.sections);

        res.status(200).json({
            success: true,
            data: {
                enrollment,
                progress: {
                    percentage: progressPercentage,
                    completedLessons,
                    totalLessons,
                    completedSections: enrollment.course.sections.filter(section => 
                        section.lessons.every(lesson => lesson.isCompleted)
                    ).length,
                    totalSections: enrollment.course.sections.length
                },
                nextLesson,
                timeSpent: enrollment.timeSpent || 0,
                lastAccessed: enrollment.lastAccessed
            }
        });
    } catch (error) {
        console.error('Progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching progress',
            error: error.message
        });
    }
};

/**
 * @desc    Submit assignment
 * @route   POST /api/students/assignments/:id/submit
 * @access  Private/Student
 */
const submitAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id;
        const { submission, notes } = req.body;
        const files = req.files; // Assuming multer middleware

        if (!submission && (!files || files.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'Submission content or file is required'
            });
        }

        // Get assignment
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Check deadline
        if (assignment.deadline && new Date() > assignment.deadline) {
            return res.status(400).json({
                success: false,
                message: 'Assignment deadline has passed'
            });
        }

        const student = await Student.findOne({ user: studentId });
        
        // Check if already submitted
        const existingSubmission = await AssignmentSubmission.findOne({
            assignment: id,
            student: student._id
        });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                message: 'Already submitted this assignment'
            });
        }

        // Create submission
        const assignmentSubmission = new AssignmentSubmission({
            assignment: id,
            student: student._id,
            submission,
            notes,
            files: files ? files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype
            })) : [],
            submittedAt: new Date(),
            status: 'submitted'
        });

        await assignmentSubmission.save();

        // Remove from pending assignments
        await Student.findByIdAndUpdate(student._id, {
            $pull: { pendingAssignments: id }
        });

        res.status(201).json({
            success: true,
            message: 'Assignment submitted successfully',
            data: assignmentSubmission
        });
    } catch (error) {
        console.error('Assignment submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error submitting assignment',
            error: error.message
        });
    }
};

/**
 * @desc    Get student grades
 * @route   GET /api/students/grades
 * @access  Private/Student
 */
const getGrades = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { courseId, page = 1, limit = 20 } = req.query;

        const student = await Student.findOne({ user: studentId });
        
        const query = { student: student._id };
        if (courseId) query.course = courseId;

        const grades = await Grade.find(query)
            .populate({
                path: 'assignment',
                select: 'title course maxScore weight',
                populate: {
                    path: 'course',
                    select: 'title'
                }
            })
            .populate('course', 'title')
            .sort({ gradedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Calculate statistics
        const totalGrades = await Grade.countDocuments(query);
        const averageGrade = await Grade.aggregate([
            { $match: query },
            { $group: { _id: null, average: { $avg: '$score' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                grades,
                statistics: {
                    total: totalGrades,
                    average: averageGrade[0]?.average || 0,
                    highest: Math.max(...grades.map(g => g.score)),
                    lowest: Math.min(...grades.map(g => g.score))
                }
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalGrades,
                pages: Math.ceil(totalGrades / limit)
            }
        });
    } catch (error) {
        console.error('Grades error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching grades',
            error: error.message
        });
    }
};

// Helper function
const findNextLesson = (sections) => {
    for (const section of sections) {
        for (const lesson of section.lessons) {
            if (!lesson.isCompleted) {
                return {
                    section: section.title,
                    lesson: lesson.title,
                    order: lesson.order,
                    type: lesson.type
                };
            }
        }
    }
    return null;
};

// Helper function for deadlines
const getUpcomingDeadlines = async (studentId) => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return await Assignment.find({
        course: { $in: await Enrollment.find({ student: studentId }).distinct('course') },
        deadline: { $lte: sevenDaysFromNow, $gte: new Date() }
    })
    .select('title course deadline')
    .populate('course', 'title')
    .sort('deadline')
    .limit(10);
};

module.exports = {
    getDashboard,
    getEnrolledCourses,
    enrollInCourse,
    getCourseProgress,
    submitAssignment,
    getGrades,
    getUpcomingDeadlines
};