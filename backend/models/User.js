const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Firebase Auth ID
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  
  // Basic Auth Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  displayName: {
    type: String,
    trim: true
  },
  
  // Profile completion status
  isOnboarded: {
    type: Boolean,
    default: false
  },
  
  // Onboarding Data
  startupName: {
    type: String,
    trim: true
  },
  
  city: {
    type: String,
    trim: true
  },
  
  state: {
    type: String,
    trim: true
  },
  
  country: {
    type: String,
    trim: true,
    default: 'India'
  },
  
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  
  founderName: {
    type: String,
    trim: true
  },
  
  contactNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please enter a valid contact number'
    }
  },
  
  // Health Check History
  healthCheckResults: [{
    completedAt: {
      type: Date,
      default: Date.now
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    categoryScores: [{
      category: String,
      score: Number,
      status: {
        type: String,
        enum: ['excellent', 'good', 'needs-attention', 'critical']
      }
    }],
    answers: {
      type: Map,
      of: String
    },
    followUpAnswers: {
      type: Map,
      of: String
    },
    strengths: [String],
    redFlags: [String],
    risks: [{
      type: String,
      penalty: String,
      probability: {
        type: String,
        enum: ['high', 'medium', 'low']
      }
    }]
  }],
  
  // Subscription & Plan Info
  subscriptionPlan: {
    type: String,
    enum: ['free', 'essentials', 'elite', 'white-label'],
    default: 'free'
  },
  
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'trial', 'expired'],
    default: 'active'
  },
  
  // Metadata
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Additional indexes for better performance (email and firebaseUid already indexed via unique: true)
userSchema.index({ startupName: 1 });
userSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to check if user has completed onboarding
userSchema.methods.hasCompletedOnboarding = function() {
  return this.isOnboarded && 
         this.startupName && 
         this.city && 
         this.state && 
         this.founderName && 
         this.contactNumber;
};

// Instance method to get latest health check result
userSchema.methods.getLatestHealthCheck = function() {
  if (this.healthCheckResults.length === 0) return null;
  return this.healthCheckResults[this.healthCheckResults.length - 1];
};

// Static method to find user by Firebase UID
userSchema.statics.findByFirebaseUid = function(firebaseUid) {
  return this.findOne({ firebaseUid });
};

module.exports = mongoose.model('User', userSchema);