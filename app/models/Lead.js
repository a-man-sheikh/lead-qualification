const mongoose = require('mongoose');

/**
 * Lead Schema - Stores individual lead information and scoring results
 */
const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Lead role is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  linkedin_bio: {
    type: String,
    trim: true
  },
  // Scoring fields
  ruleScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  aiScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  intent: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Low'
  },
  reasoning: {
    type: String,
    trim: true
  },
  // Metadata
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  scoredAt: {
    type: Date
  }
});

// Calculate total score before saving
leadSchema.pre('save', function(next) {
  this.totalScore = this.ruleScore + this.aiScore;
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
