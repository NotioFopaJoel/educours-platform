const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  
  // Course and Teacher
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Scheduling
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  timezone: {
    type: String,
    default: 'Africa/Douala'
  },
  
  // Recurring classes
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    daysOfWeek: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date,
    occurrences: Number
  },
  
  // Meeting Details
  meetingId: {
    type: String,
    required: true,
    unique: true
  },
  meetingPassword: String,
  meetingUrl: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['agora', 'zoom', 'google_meet', 'custom'],
    default: 'agora'
  },
  platformConfig: {
    appId: String,
    channel: String,
    token: String,
    uid: Number,
    role: {
      type: String,
      enum: ['host', 'audience'],
      default: 'host'
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  startedAt: Date,
  endedAt: Date,
  
  // Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date,
    duration: Number, // in minutes
    role: {
      type: String,
      enum: ['host', 'co-host', 'participant'],
      default: 'participant'
    },
    videoEnabled: {
      type: Boolean,
      default: false
    },
    audioEnabled: {
      type: Boolean,
      default: false
    },
    handRaised: {
      type: Boolean,
      default: false
    },
    isMuted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Attendance
  totalParticipants: {
    type: Number,
    default: 0
  },
  averageAttendanceTime: {
    type: Number,
    default: 0
  },
  
  // Recording
  isRecorded: {
    type: Boolean,
    default: false
  },
  recordingUrl: String,
  recordingDuration: Number,
  recordingSize: Number,
  recordingAvailableAt: Date,
  
  // Chat Messages
  chatMessages: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: Date,
    type: {
      type: String,
      enum: ['text', 'question', 'answer', 'announcement'],
      default: 'text'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: String,
      timestamp: Date
    }]
  }],
  
  // Whiteboard/Shared Content
  whiteboardSessions: [{
    title: String,
    content: mongoose.Schema.Types.Mixed,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date,
    updatedAt: Date
  }],
  
  // Shared Files
  sharedFiles: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: Date
  }],
  
  // Polls/Quizzes
  polls: [{
    question: String,
    options: [{
      text: String,
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: Date
      }]
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date,
    totalVotes: {
      type: Number,
      default: 0
    }
  }],
  
  // Settings
  allowRecording: {
    type: Boolean,
    default: true
  },
  allowChat: {
    type: Boolean,
    default: true
  },
  allowScreenShare: {
    type: Boolean,
    default: true
  },
  allowRaiseHand: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  
  // Notifications
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  
  // Metadata
  tags: [String],
  topic: String,
  objectives: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current status
liveClassSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  
  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'ended') return 'ended';
  
  if (now < this.startTime) return 'upcoming';
  if (now >= this.startTime && now <= this.endTime) return 'live';
  if (now > this.endTime && this.status === 'scheduled') return 'missed';
  
  return this.status;
});

// Virtual for time until start
liveClassSchema.virtual('timeUntilStart').get(function() {
  const now = new Date();
  const start = new Date(this.startTime);
  const diffMs = start - now;
  
  if (diffMs <= 0) return { started: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return {
    started: false,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(diffMs / 1000)
  };
});

// Virtual for duration in progress
liveClassSchema.virtual('elapsedTime').get(function() {
  if (this.status !== 'live' || !this.startedAt) return 0;
  
  const now = new Date();
  const started = new Date(this.startedAt);
  return Math.floor((now - started) / 1000); // seconds
});

// Indexes
liveClassSchema.index({ course: 1, startTime: -1 });
liveClassSchema.index({ teacher: 1 });
liveClassSchema.index({ status: 1 });
liveClassSchema.index({ startTime: 1 });
liveClassSchema.index({ 'participants.user': 1 });

// Pre-save middleware
liveClassSchema.pre('save', function(next) {
  // Generate meeting ID if not provided
  if (!this.meetingId) {
    this.meetingId = `LC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Calculate duration if not provided
  if (!this.duration && this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  
  next();
});

// Method to join class
liveClassSchema.methods.joinClass = async function(userId, role = 'participant') {
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    // Participant rejoining
    existingParticipant.joinedAt = new Date();
    existingParticipant.leftAt = null;
  } else {
    // New participant
    this.participants.push({
      user: userId,
      joinedAt: new Date(),
      role: role,
      videoEnabled: false,
      audioEnabled: true,
      handRaised: false,
      isMuted: false
    });
    
    this.totalParticipants += 1;
  }
  
  // Update status to live if this is the first participant (other than teacher)
  if (this.status === 'scheduled' && this.participants.length >= 1) {
    this.status = 'live';
    this.startedAt = new Date();
  }
  
  await this.save();
  
  return this.participants[this.participants.length - 1];
};

// Method to leave class
liveClassSchema.methods.leaveClass = async function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString() && !p.leftAt
  );
  
  if (participant) {
    participant.leftAt = new Date();
    
    // Calculate duration in minutes
    const joinedAt = new Date(participant.joinedAt);
    const leftAt = new Date(participant.leftAt);
    participant.duration = Math.round((leftAt - joinedAt) / (1000 * 60));
    
    // Update average attendance time
    const activeParticipants = this.participants.filter(p => p.duration);
    if (activeParticipants.length > 0) {
      this.averageAttendanceTime = activeParticipants.reduce((sum, p) => 
        sum + p.duration, 0) / activeParticipants.length;
    }
  }
  
  // End class if no participants left (except teacher)
  const activeParticipants = this.participants.filter(p => !p.leftAt);
  if (activeParticipants.length === 0 && this.status === 'live') {
    this.status = 'ended';
    this.endedAt = new Date();
  }
  
  await this.save();
  
  return participant;
};

// Method to add chat message
liveClassSchema.methods.addChatMessage = async function(userId, message, type = 'text') {
  const chatMessage = {
    user: userId,
    message: message,
    timestamp: new Date(),
    type: type
  };
  
  this.chatMessages.push(chatMessage);
  await this.save();
  
  return chatMessage;
};

// Method to create poll
liveClassSchema.methods.createPoll = async function(userId, question, options) {
  const poll = {
    question: question,
    options: options.map(option => ({
      text: option,
      votes: []
    })),
    createdBy: userId,
    createdAt: new Date(),
    isActive: true
  };
  
  this.polls.push(poll);
  await this.save();
  
  return poll;
};

// Method to vote on poll
liveClassSchema.methods.voteOnPoll = async function(pollIndex, optionIndex, userId) {
  if (pollIndex >= this.polls.length) {
    throw new Error('Poll not found');
  }
  
  const poll = this.polls[pollIndex];
  
  // Check if user already voted
  const hasVoted = poll.options.some(option => 
    option.votes.some(vote => vote.user.toString() === userId.toString())
  );
  
  if (hasVoted) {
    throw new Error('Already voted on this poll');
  }
  
  if (optionIndex >= poll.options.length) {
    throw new Error('Invalid option');
  }
  
  // Add vote
  poll.options[optionIndex].votes.push({
    user: userId,
    votedAt: new Date()
  });
  
  poll.totalVotes += 1;
  
  await this.save();
  
  return poll;
};

// Static method to generate Agora token
liveClassSchema.statics.generateAgoraToken = function(channelName, uid, role = 'host') {
  const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
  
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const expirationTimeInSeconds = 3600; // 1 hour
  
  if (!appID || !appCertificate) {
    throw new Error('Agora credentials not configured');
  }
  
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  
  const rtcRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  
  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    rtcRole,
    privilegeExpiredTs
  );
  
  return token;
};

const LiveClass = mongoose.model('LiveClass', liveClassSchema);

module.exports = LiveClass;