const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // Reference to user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  firebaseUid: {
    type: String,
    required: true,
    index: true
  },
  
  // Subscription Details
  type: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free',
    required: true
  },
  
  // Subscription Period
  startDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  endDate: {
    type: Date,
    index: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'suspended'],
    default: 'active'
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'bank_transfer', 'wallet', 'free'],
    default: 'free'
  },
  amount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // External Payment References
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'manual'],
    default: 'razorpay'
  },
  transactionId: String,
  paymentId: String,
  orderId: String,
  
  // Features and Limits
  features: {
    healthChecksPerMonth: {
      type: Number,
      default: 1
    },
    detailedReports: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    customRecommendations: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    }
  },
  
  // Usage Tracking
  usage: {
    healthChecksUsed: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Billing Information
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'lifetime'],
    default: 'monthly'
  },
  nextBillingDate: Date,
  autoRenew: {
    type: Boolean,
    default: true
  },
  
  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  
  // Trial Information
  isTrialPeriod: {
    type: Boolean,
    default: false
  },
  trialEndDate: Date
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
subscriptionSchema.index({ userId: 1, isActive: 1 });
subscriptionSchema.index({ firebaseUid: 1, isActive: 1 });
subscriptionSchema.index({ endDate: 1, isActive: 1 });
subscriptionSchema.index({ nextBillingDate: 1, autoRenew: 1 });
subscriptionSchema.index({ status: 1 });

// Virtual for days remaining
subscriptionSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for subscription health
subscriptionSchema.virtual('subscriptionHealth').get(function() {
  const daysRemaining = this.daysRemaining;
  if (!daysRemaining) return 'unlimited';
  if (daysRemaining > 30) return 'healthy';
  if (daysRemaining > 7) return 'expiring_soon';
  if (daysRemaining > 0) return 'critical';
  return 'expired';
});

// Method to check if feature is available
subscriptionSchema.methods.hasFeature = function(featureName) {
  return this.features[featureName] === true;
};

// Method to check usage limits
subscriptionSchema.methods.canUseHealthCheck = function() {
  if (this.type === 'free') {
    return this.usage.healthChecksUsed < this.features.healthChecksPerMonth;
  }
  return true; // Premium and enterprise have unlimited
};

// Method to increment usage
subscriptionSchema.methods.incrementUsage = function(feature) {
  if (feature === 'healthCheck') {
    this.usage.healthChecksUsed += 1;
  }
  return this.save();
};

// Method to reset monthly usage
subscriptionSchema.methods.resetMonthlyUsage = function() {
  this.usage.healthChecksUsed = 0;
  this.usage.lastResetDate = new Date();
  return this.save();
};

// Static method to get active subscription for user
subscriptionSchema.statics.getActiveForUser = function(userId) {
  return this.findOne({ 
    userId, 
    isActive: true,
    status: 'active'
  }).populate('userId', 'startupName email');
};

// Static method to find expiring subscriptions
subscriptionSchema.statics.findExpiring = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    endDate: { $lte: futureDate, $gte: new Date() },
    isActive: true,
    status: 'active'
  }).populate('userId', 'startupName email');
};

module.exports = mongoose.model('Subscription', subscriptionSchema);