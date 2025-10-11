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

// Virtual for latest health check (now from separate collection)
userSchema.virtual('latestHealthCheck', {
  ref: 'HealthCheck',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
  options: { sort: { assessmentDate: -1 } }
});

// Virtual for active subscription (now from separate collection)
userSchema.virtual('activeSubscription', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
  match: { isActive: true, status: 'active' }
});

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