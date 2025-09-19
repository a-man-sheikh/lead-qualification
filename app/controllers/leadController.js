const Lead = require("../models/Lead");
const Offer = require("../models/Offer")
const { processCSVFile, validateCSVStructure, cleanupTempFile,generateCSVFromLeads} = require("../utils/csvProcessor");
const {calculateRuleScore} =require("../services/scoringService")
const aiService = require("../services/aiService")

/**
 * Upload CSV file with leads
*/
const uploadLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No CSV file uploaded" });
    }

    const filePath = req.file.path;

    await validateCSVStructure(filePath);
    const leads = await processCSVFile(filePath);

    await Lead.deleteMany({});
    const savedLeads = await Lead.insertMany(leads);

    cleanupTempFile(filePath);

    res.status(200).json({
      success: true,
      message: `Uploaded ${savedLeads.length} leads`,
      data: { count: savedLeads.length, leads: savedLeads }
    });
  } catch (error) {
    if (req.file) cleanupTempFile(req.file.path);
    res.status(400).json({ success: false, message: error.message });
  }
};


/**
 * Score all uploaded leads
 */
const scoreLeads = async (req, res) => {
  try {
    // Check if offer exists
    const offer = await Offer.findOne().sort({ createdAt: -1 });
    if (!offer) {
      return res.status(400).json({
        success: false,
        message: 'No offer found. Please create an offer first.'
      });
    }

    // Get all unscored leads
    const leads = await Lead.find({ scoredAt: { $exists: false } });
    
    if (leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No leads found to score. Please upload leads first.'
      });
    }

    const scoredLeads = [];

    // Process each lead
    for (const lead of leads) {
      try {
        // Calculate rule-based score
        const ruleResult = calculateRuleScore(lead, offer);
        
        // Get AI score
        const aiResult = await aiService.classifyIntent(lead, offer);
        
        // Update lead with scores
        lead.ruleScore = ruleResult.score;
        lead.aiScore = aiResult.score;
        lead.intent = aiResult.intent;
        lead.reasoning = `${ruleResult.reasoning}; AI: ${aiResult.reasoning}`;
        lead.scoredAt = new Date();
        
        await lead.save();
        scoredLeads.push(lead);
      } catch (error) {
        console.error(`Error scoring lead ${lead.name}:`, error);
        // Continue with other leads even if one fails
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully scored ${scoredLeads.length} leads`,
      data: {
        count: scoredLeads.length,
        leads: scoredLeads
      }
    });
  } catch (error) {
    console.error('Error scoring leads:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all scored leads
 */
const getResults = async (req, res) => {
  try {
    const { intent, minScore, maxScore, sortBy = 'totalScore', sortOrder = 'desc' } = req.query;
    
    // Build filter query
    const filter = {};
    
    if (intent) {
      filter.intent = intent;
    }
    
    if (minScore || maxScore) {
      filter.totalScore = {};
      if (minScore) filter.totalScore.$gte = parseInt(minScore);
      if (maxScore) filter.totalScore.$lte = parseInt(maxScore);
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const leads = await Lead.find(filter)
      .sort(sort)
      .select('name role company industry location linkedin_bio intent totalScore reasoning scoredAt');

    res.status(200).json({
      success: true,
      message: 'Results retrieved successfully',
      data: leads
    });
  } catch (error) {
    console.error('Error retrieving results:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Export results as CSV
 */
const exportResults = async (req, res) => {
  try {
    const { generateCSVFromLeads } = require('../utils/csvProcessor');
    
    const leads = await Lead.find({ scoredAt: { $exists: true } })
      .select('name role company industry location linkedin_bio intent totalScore reasoning')
      .sort({ totalScore: -1 });

    if (leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No scored leads found to export'
      });
    }

    const csvContent = generateCSVFromLeads(leads);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="lead-results.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting results:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


module.exports = {
  uploadLeads,
  scoreLeads,
  getResults,
  exportResults,

};

