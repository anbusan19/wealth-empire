const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Firebase Auth Data
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // User Profile Data
  startupName: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true,
    default: null
  },
  founderName: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  // System Data
  isOnboardingComplete: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Health Check Results
  healthCheckResults: [{
    assessmentDate: {
      type: Date,
      default: Date.now
    },
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    recommendations: [String],
    followUpAnswers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  
  // Metadata
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  profileCompletedAt: Date,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ startupName: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for latest health check
userSchema.virtual('latestHealthCheck').get(function() {
  if (this.healthCheckResults && this.healthCheckResults.length > 0) {
    return this.healthCheckResults[this.healthCheckResults.length - 1];
  }
  return null;
});

// Method to add health check result
userSchema.methods.addHealthCheckResult = function(resultData) {
  this.healthCheckResults.push(resultData);
  return this.save();
};

// Method to complete onboarding
userSchema.methods.completeOnboarding = function() {
  this.isOnboardingComplete = true;
  this.profileCompletedAt = new Date();
  return this.save();
};

// Static method to find by Firebase UID
userSchema.statics.findByFirebaseUid = function(firebaseUid) {
  return this.findOne({ firebaseUid });
};

module.exports = mongoose.model('User', userSchema);