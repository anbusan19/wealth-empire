const mongoose = require('mongoose');

const healthCheckSchema = new mongoose.Schema({
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
  
  // Assessment Data
  assessmentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Answers to health check questions
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Follow-up answers for detailed questions
  followUpAnswers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  // Assessment Results
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  
  // Categorized recommendations
  recommendations: [{
    type: String,
    category: {
      type: String,
      enum: ['strength', 'red_flag', 'risk', 'improvement'],
      default: 'improvement'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    estimatedCost: String,
    description: String
  }],
  
  // Legacy fields for backward compatibility
  strengths: [String],
  redFlags: [String],
  risks: [String],
  
  // Assessment metadata
  version: {
    type: String,
    default: '1.0'
  },
  completionTime: Number, // in seconds
  
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'completed', 'reviewed'],
    default: 'completed'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
healthCheckSchema.index({ userId: 1, assessmentDate: -1 });
healthCheckSchema.index({ firebaseUid: 1, assessmentDate: -1 });
healthCheckSchema.index({ score: 1 });
healthCheckSchema.index({ status: 1 });

// Virtual for risk level based on score
healthCheckSchema.virtual('riskLevel').get(function() {
  if (this.score >= 80) return 'low';
  if (this.score >= 60) return 'medium';
  if (this.score >= 40) return 'high';
  return 'critical';
});

// Virtual for recommendations by category
healthCheckSchema.virtual('recommendationsByCategory').get(function() {
  const categorized = {
    strengths: [],
    red_flags: [],
    risks: [],
    improvements: []
  };
  
  this.recommendations.forEach(rec => {
    if (typeof rec === 'string') {
      // Handle legacy string recommendations
      if (rec.toLowerCase().includes('strength')) {
        categorized.strengths.push(rec);
      } else if (rec.toLowerCase().includes('red flag')) {
        categorized.red_flags.push(rec);
      } else if (rec.toLowerCase().includes('risk')) {
        categorized.risks.push(rec);
      } else {
        categorized.improvements.push(rec);
      }
    } else {
      categorized[rec.category + 's'] = categorized[rec.category + 's'] || [];
      categorized[rec.category + 's'].push(rec);
    }
  });
  
  return categorized;
});

// Static method to get latest health check for user
healthCheckSchema.statics.getLatestForUser = function(userId) {
  return this.findOne({ userId })
    .sort({ assessmentDate: -1 })
    .populate('userId', 'startupName email');
};

// Static method to get health check history for user
healthCheckSchema.statics.getHistoryForUser = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ assessmentDate: -1 })
    .limit(limit)
    .populate('userId', 'startupName email');
};

// Method to calculate improvement from previous assessment
healthCheckSchema.methods.getImprovement = async function() {
  const previousCheck = await this.constructor.findOne({
    userId: this.userId,
    assessmentDate: { $lt: this.assessmentDate }
  }).sort({ assessmentDate: -1 });
  
  if (!previousCheck) return null;
  
  return {
    scoreChange: this.score - previousCheck.score,
    previousScore: previousCheck.score,
    currentScore: this.score,
    daysBetween: Math.ceil((this.assessmentDate - previousCheck.assessmentDate) / (1000 * 60 * 60 * 24))
  };
};

module.exports = mongoose.model('HealthCheck', healthCheckSchema);