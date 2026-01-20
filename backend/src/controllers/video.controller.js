
const Video = require('../models/Video.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto-js');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class VideoController {
  // Upload video for course
  async uploadVideo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { courseId, title, description, chapter, duration } = req.body;
      const userId = req.user.id;

      // Check if user is the teacher of this course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.teacher.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to upload videos for this course' });
      }

      // Check if file was uploaded
      if (!req.files || !req.files.video) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      const videoFile = req.files.video;

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/mkv', 'video/avi', 'video/mov', 'video/wmv'];
      if (!allowedTypes.includes(videoFile.mimetype)) {
        return res.status(400).json({ error: 'Invalid video format. Allowed: MP4, MKV, AVI, MOV, WMV' });
      }

      // Validate file size (max 2GB)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB in bytes
      if (videoFile.size > maxSize) {
        return res.status(400).json({ error: 'Video file too large. Maximum size is 2GB' });
      }

      // Generate unique filename
      const fileExtension = path.extname(videoFile.name);
      const uniqueFilename = `video_${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
      const tempPath = videoFile.tempFilePath;

      // Upload to Cloudinary with video optimization
      const uploadResult = await cloudinary.uploader.upload(tempPath, {
        resource_type: 'video',
        public_id: `educours/videos/${uniqueFilename.split('.')[0]}`,
        folder: 'educours/videos',
        chunk_size: 6000000, // 6MB chunks for large files
        eager: [
          { width: 1280, height: 720, crop: 'scale', format: 'mp4' }, // HD version
          { width: 854, height: 480, crop: 'scale', format: 'mp4' },  // SD version
          { width: 640, height: 360, crop: 'scale', format: 'mp4' }   // Mobile version
        ],
        eager_async: true,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      // Create video record
      const video = new Video({
        title,
        description,
        course: courseId,
        teacher: userId,
        chapter,
        duration: parseInt(duration) || 0,
        cloudinary: {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          duration: uploadResult.duration,
          bytes: uploadResult.bytes,
          eager: uploadResult.eager // Multiple quality versions
        },
        thumbnail: this.generateThumbnailUrl(uploadResult.public_id),
        status: 'processing'
      });

      await video.save();

      // Add video to course
      course.videos.push(video._id);
      await course.save();

      // Process video for subtitles and chapters
      this.processVideo(video._id);

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully. Processing in progress.',
        data: {
          video: {
            id: video._id,
            title: video.title,
            url: video.cloudinary.url,
            thumbnail: video.thumbnail,
            duration: video.duration,
            status: video.status
          }
        }
      });

    } catch (error) {
      console.error('Video Upload Error:', error);
      
      // Clean up temp file if it exists
      if (req.files?.video?.tempFilePath && fs.existsSync(req.files.video.tempFilePath)) {
        fs.unlinkSync(req.files.video.tempFilePath);
      }
      
      res.status(500).json({
        error: 'Video upload failed',
        details: error.message
      });
    }
  }

  // Generate thumbnail URL from Cloudinary public_id
  generateThumbnailUrl(publicId) {
    return cloudinary.url(publicId, {
      transformation: [
        { width: 1280, height: 720, crop: 'fill' },
        { quality: 'auto' }
      ]
    });
  }

  // Process video (subtitles, chapters, etc.)
  async processVideo(videoId) {
    try {
      const video = await Video.findById(videoId);
      if (!video) return;

      // Simulate video processing
      // In production, this would:
      // 1. Generate subtitles using speech-to-text
      // 2. Extract chapters from timestamps
      // 3. Create video preview
      // 4. Optimize for different bandwidths

      setTimeout(async () => {
        video.status = 'processed';
        video.processedAt = new Date();
        
        // Generate sample chapters if none provided
        if (!video.chapters || video.chapters.length === 0) {
          video.chapters = this.generateSampleChapters(video.duration);
        }
        
        await video.save();
        
        console.log(`Video ${videoId} processing completed`);
      }, 10000); // Simulate 10 second processing time

    } catch (error) {
      console.error('Video Processing Error:', error);
    }
  }

  // Generate sample chapters based on duration
  generateSampleChapters(duration) {
    const chapters = [];
    const chapterCount = Math.ceil(duration / 600); // Chapter every 10 minutes
    
    for (let i = 0; i < chapterCount; i++) {
      const startTime = i * 600;
      const endTime = Math.min((i + 1) * 600, duration);
      
      chapters.push({
        title: `Chapter ${i + 1}`,
        description: `Chapter ${i + 1} of the video`,
        startTime,
        endTime,
        thumbnailTime: startTime + 60 // Thumbnail at 1 minute into chapter
      });
    }
    
    return chapters;
  }

  // Get video by ID
  async getVideo(req, res) {
    try {
      const { videoId } = req.params;
      const userId = req.user.id;

      const video = await Video.findById(videoId)
        .populate('course', 'title thumbnail')
        .populate('teacher', 'firstName lastName avatar');
      
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Check if user has access to this video
      const hasAccess = await this.checkVideoAccess(userId, video.course._id);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied. Please enroll in the course first.' });
      }

      // Track video view
      await this.trackVideoView(videoId, userId);

      // Get video progress for this user
      const progress = await this.getVideoProgress(videoId, userId);

      // Generate secure streaming URL (with token for limited time)
      const streamingUrl = this.generateSecureStreamingUrl(video.cloudinary.public_id);

      res.status(200).json({
        success: true,
        data: {
          video: {
            ...video.toObject(),
            streamingUrl,
            progress,
            nextVideo: await this.getNextVideo(videoId, video.course._id)
          }
        }
      });

    } catch (error) {
      console.error('Get Video Error:', error);
      res.status(500).json({ error: 'Failed to get video' });
    }
  }

  // Check if user has access to video
  async checkVideoAccess(userId, courseId) {
    try {
      const user = await User.findById(userId);
      
      // Admin and course teacher always have access
      if (user.role === 'admin') return true;
      
      // Check if user is the teacher of this course
      const course = await Course.findById(courseId);
      if (course.teacher.toString() === userId) return true;
      
      // Check if student is enrolled in the course
      return user.enrolledCourses.includes(courseId);
      
    } catch (error) {
      console.error('Check Video Access Error:', error);
      return false;
    }
  }

  // Track video view
  async trackVideoView(videoId, userId) {
    try {
      const video = await Video.findById(videoId);
      
      // Check if user already viewed this video today
      const today = new Date().toISOString().split('T')[0];
      const existingView = video.views.find(
        view => view.user.toString() === userId && 
        view.date.toISOString().split('T')[0] === today
      );
      
      if (!existingView) {
        video.views.push({
          user: userId,
          date: new Date(),
          duration: 0 // Will be updated when user finishes watching
        });
        
        video.viewCount += 1;
        await video.save();
      }
      
    } catch (error) {
      console.error('Track Video View Error:', error);
    }
  }

  // Update video progress
  async updateProgress(req, res) {
    try {
      const { videoId } = req.params;
      const { currentTime, duration, isCompleted } = req.body;
      const userId = req.user.id;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Find user's view
      const viewIndex = video.views.findIndex(
        view => view.user.toString() === userId
      );

      if (viewIndex !== -1) {
        // Update existing view
        video.views[viewIndex].currentTime = currentTime;
        video.views[viewIndex].duration = duration;
        video.views[viewIndex].lastWatched = new Date();
        
        if (isCompleted && !video.views[viewIndex].completedAt) {
          video.views[viewIndex].completedAt = new Date();
          video.completedCount += 1;
        }
      } else {
        // Create new view
        video.views.push({
          user: userId,
          currentTime,
          duration,
          lastWatched: new Date(),
          completedAt: isCompleted ? new Date() : null
        });
        
        video.viewCount += 1;
        if (isCompleted) video.completedCount += 1;
      }

      await video.save();

      // Update user's course progress
      await this.updateCourseProgress(userId, video.course);

      res.status(200).json({
        success: true,
        message: 'Progress updated'
      });

    } catch (error) {
      console.error('Update Video Progress Error:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  }

  // Get video progress for user
  async getVideoProgress(videoId, userId) {
    try {
      const video = await Video.findById(videoId);
      
      const userView = video.views.find(
        view => view.user.toString() === userId
      );
      
      if (!userView) {
        return {
          currentTime: 0,
          duration: video.duration,
          percentage: 0,
          isCompleted: false,
          lastWatched: null
        };
      }
      
      const percentage = video.duration > 0 ? 
        (userView.currentTime / video.duration) * 100 : 0;
      
      return {
        currentTime: userView.currentTime,
        duration: video.duration,
        percentage: Math.min(percentage, 100),
        isCompleted: !!userView.completedAt,
        lastWatched: userView.lastWatched
      };
      
    } catch (error) {
      console.error('Get Video Progress Error:', error);
      return {
        currentTime: 0,
        duration: 0,
        percentage: 0,
        isCompleted: false,
        lastWatched: null
      };
    }
  }

  // Update course progress based on video completion
  async updateCourseProgress(userId, courseId) {
    try {
      const course = await Course.findById(courseId).populate('videos');
      const user = await User.findById(userId);
      
      // Calculate progress based on completed videos
      const totalVideos = course.videos.length;
      const completedVideos = course.videos.filter(video => {
        return video.views.some(view => 
          view.user.toString() === userId && 
          view.completedAt
        );
      }).length;
      
      const progress = totalVideos > 0 ? 
        (completedVideos / totalVideos) * 100 : 0;
      
      // Update user's course progress (stored separately in a progress model)
      // This is a simplified version
      console.log(`User ${userId} progress in course ${courseId}: ${progress}%`);
      
    } catch (error) {
      console.error('Update Course Progress Error:', error);
    }
  }

  // Get next video in course
  async getNextVideo(currentVideoId, courseId) {
    try {
      const course = await Course.findById(courseId).populate('videos');
      
      const videos = course.videos.sort((a, b) => a.order - b.order);
      const currentIndex = videos.findIndex(v => v._id.toString() === currentVideoId);
      
      if (currentIndex < videos.length - 1) {
        const nextVideo = videos[currentIndex + 1];
        return {
          id: nextVideo._id,
          title: nextVideo.title,
          thumbnail: nextVideo.thumbnail,
          duration: nextVideo.duration
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Get Next Video Error:', error);
      return null;
    }
  }

  // Generate secure streaming URL
  generateSecureStreamingUrl(publicId) {
    // Generate token for secure streaming (valid for 2 hours)
    const token = crypto.createHmac('sha256', process.env.STREAMING_SECRET)
      .update(`${publicId}:${Math.floor(Date.now() / (2 * 60 * 60 * 1000))}`) // 2-hour window
      .digest('hex');
    
    return cloudinary.url(publicId, {
      resource_type: 'video',
      type: 'upload',
      secure: true,
      sign_url: true,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
  }

  // Get course videos
  async getCourseVideos(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Check access
      const hasAccess = await this.checkVideoAccess(userId, courseId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const videos = await Video.find({ course: courseId })
        .select('title description thumbnail duration chapters viewCount status order')
        .sort('order')
        .lean();

      // Add progress for each video
      const videosWithProgress = await Promise.all(
        videos.map(async (video) => {
          const progress = await this.getVideoProgress(video._id, userId);
          return {
            ...video,
            progress
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          videos: videosWithProgress,
          total: videos.length
        }
      });

    } catch (error) {
      console.error('Get Course Videos Error:', error);
      res.status(500).json({ error: 'Failed to get course videos' });
    }
  }

  // Update video details
  async updateVideo(req, res) {
    try {
      const { videoId } = req.params;
      const { title, description, chapter, order, isPublished } = req.body;
      const userId = req.user.id;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Check if user is the teacher or admin
      if (video.teacher.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this video' });
      }

      // Update fields
      if (title) video.title = title;
      if (description) video.description = description;
      if (chapter) video.chapter = chapter;
      if (order !== undefined) video.order = order;
      if (isPublished !== undefined) video.isPublished = isPublished;

      await video.save();

      res.status(200).json({
        success: true,
        message: 'Video updated successfully',
        data: video
      });

    } catch (error) {
      console.error('Update Video Error:', error);
      res.status(500).json({ error: 'Failed to update video' });
    }
  }

  // Delete video
  async deleteVideo(req, res) {
    try {
      const { videoId } = req.params;
      const userId = req.user.id;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Check if user is the teacher or admin
      if (video.teacher.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this video' });
      }

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(video.cloudinary.public_id, {
        resource_type: 'video'
      });

      // Delete from database
      await video.deleteOne();

      // Remove from course videos array
      await Course.findByIdAndUpdate(video.course, {
        $pull: { videos: videoId }
      });

      res.status(200).json({
        success: true,
        message: 'Video deleted successfully'
      });

    } catch (error) {
      console.error('Delete Video Error:', error);
      res.status(500).json({ error: 'Failed to delete video' });
    }
  }

  // Generate video subtitles
  async generateSubtitles(req, res) {
    try {
      const { videoId } = req.params;
      const { language } = req.body;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Check if user is the teacher or admin
      if (video.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // In production, this would call a speech-to-text service
      // For demo, we'll simulate subtitle generation
      const subtitles = this.simulateSubtitleGeneration(video.duration);

      video.subtitles.push({
        language: language || 'en',
        content: subtitles,
        generatedAt: new Date(),
        generatedBy: req.user.id
      });

      await video.save();

      res.status(200).json({
        success: true,
        message: 'Subtitles generated successfully',
        data: {
          videoId: video._id,
          language: language || 'en',
          subtitleCount: subtitles.length
        }
      });

    } catch (error) {
      console.error('Generate Subtitles Error:', error);
      res.status(500).json({ error: 'Failed to generate subtitles' });
    }
  }

  // Simulate subtitle generation
  simulateSubtitleGeneration(duration) {
    const subtitles = [];
    const segmentDuration = 5; // seconds per subtitle segment
    const segmentCount = Math.ceil(duration / segmentDuration);
    
    for (let i = 0; i < segmentCount; i++) {
      const startTime = i * segmentDuration;
      const endTime = Math.min((i + 1) * segmentDuration, duration);
      
      subtitles.push({
        id: i + 1,
        startTime,
        endTime,
        text: `Subtitle text for segment ${i + 1}. This is sample text for demonstration.`
      });
    }
    
    return subtitles;
  }

  // Get video analytics
  async getVideoAnalytics(req, res) {
    try {
      const { videoId } = req.params;
      const userId = req.user.id;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Check if user is the teacher or admin
      if (video.teacher.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view analytics' });
      }

      // Calculate analytics
      const totalViews = video.viewCount;
      const totalCompletions = video.completedCount;
      const completionRate = totalViews > 0 ? 
        (totalCompletions / totalViews) * 100 : 0;
      
      // Get view distribution over time
      const viewsByDate = this.groupViewsByDate(video.views);
      
      // Get average watch time
      const averageWatchTime = this.calculateAverageWatchTime(video.views);
      
      // Get drop-off points
      const dropOffPoints = this.calculateDropOffPoints(video.views, video.duration);

      res.status(200).json({
        success: true,
        data: {
          basicStats: {
            totalViews,
            totalCompletions,
            completionRate: completionRate.toFixed(2),
            averageWatchTime: averageWatchTime.toFixed(2),
            duration: video.duration
          },
          viewsOverTime: viewsByDate,
          dropOffAnalysis: dropOffPoints,
          recentViews: video.views.slice(-10).reverse()
        }
      });

    } catch (error) {
      console.error('Get Video Analytics Error:', error);
      res.status(500).json({ error: 'Failed to get video analytics' });
    }
  }

  // Group views by date
  groupViewsByDate(views) {
    const viewsByDate = {};
    
    views.forEach(view => {
      const date = view.date.toISOString().split('T')[0];
      if (!viewsByDate[date]) {
        viewsByDate[date] = 0;
      }
      viewsByDate[date]++;
    });
    
    return Object.entries(viewsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Calculate average watch time
  calculateAverageWatchTime(views) {
    if (views.length === 0) return 0;
    
    const totalWatchTime = views.reduce((sum, view) => {
      return sum + (view.currentTime || 0);
    }, 0);
    
    return totalWatchTime / views.length;
  }

  // Calculate drop-off points
  calculateDropOffPoints(views, duration) {
    const segments = 10; // Divide video into 10 segments
    const segmentDuration = duration / segments;
    
    const dropOffs = Array(segments).fill(0);
    
    views.forEach(view => {
      const segment = Math.floor((view.currentTime || 0) / segmentDuration);
      if (segment < segments) {
        dropOffs[segment]++;
      }
    });
    
    return dropOffs.map((count, index) => ({
      segment: index + 1,
      timeRange: `${(index * segmentDuration).toFixed(0)}s - ${((index + 1) * segmentDuration).toFixed(0)}s`,
      dropOffCount: count,
      percentage: views.length > 0 ? (count / views.length) * 100 : 0
    }));
  }

  // Get video streaming token
  async getStreamingToken(req, res) {
    try {
      const { videoId } = req.params;
      
      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      // Generate token valid for 2 hours
      const token = crypto.createHmac('sha256', process.env.STREAMING_SECRET)
        .update(`${video.cloudinary.public_id}:${Math.floor(Date.now() / (2 * 60 * 60 * 1000))}`)
        .digest('hex');
      
      res.status(200).json({
        success: true,
        data: {
          token,
          expiresIn: 7200, // 2 hours in seconds
          publicId: video.cloudinary.public_id
        }
      });
      
    } catch (error) {
      console.error('Get Streaming Token Error:', error);
      res.status(500).json({ error: 'Failed to generate streaming token' });
    }
  }
}

module.exports = new VideoController();