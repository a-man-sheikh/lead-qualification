/**
 * Scoring Service - Implements rule-based scoring logic for lead qualification
 */

/**
 * Calculate rule-based score for a lead (max 50 points)
 */
const calculateRuleScore = (lead, offer) => {
  let score = 0;
  let reasoning = [];

  // Role relevance scoring (max 20 points)
  const roleScore = getRoleScore(lead.role);
  score += roleScore.score;
  if (roleScore.score > 0) {
    reasoning.push(roleScore.reasoning);
  }

  // Industry match scoring (max 20 points)
  const industryScore = getIndustryScore(lead.industry, offer.ideal_use_cases);
  score += industryScore.score;
  if (industryScore.score > 0) {
    reasoning.push(industryScore.reasoning);
  }

  // Data completeness scoring (max 10 points)
  const completenessScore = getDataCompletenessScore(lead);
  score += completenessScore.score;
  if (completenessScore.score > 0) {
    reasoning.push(completenessScore.reasoning);
  }

  return {
    score: Math.min(score, 50), // Cap at 50 points
    reasoning: reasoning.join('; ')
  };
};

/**
 * Calculate role relevance score
 */
const getRoleScore = (role) => {
  const roleLower = role.toLowerCase();
  
  // Decision maker roles (+20 points)
  const decisionMakerRoles = [
    'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cpo', 'vp', 'vice president',
    'director', 'head of', 'founder', 'president', 'owner', 'managing director',
    'chief', 'executive', 'lead', 'principal'
  ];
  
  // Influencer roles (+10 points)
  const influencerRoles = [
    'manager', 'senior', 'lead', 'specialist', 'analyst', 'coordinator',
    'supervisor', 'team lead', 'project manager', 'product manager',
    'marketing manager', 'sales manager', 'operations manager'
  ];

  for (const keyword of decisionMakerRoles) {
    if (roleLower.includes(keyword)) {
      return {
        score: 20,
        reasoning: `Role "${role}" is a decision maker (+20 points)`
      };
    }
  }

  for (const keyword of influencerRoles) {
    if (roleLower.includes(keyword)) {
      return {
        score: 10,
        reasoning: `Role "${role}" is an influencer (+10 points)`
      };
    }
  }

  return {
    score: 0,
    reasoning: `Role "${role}" has no specific relevance (0 points)`
  };
};

/**
 * Calculate industry match score
 */
const getIndustryScore = (industry, idealUseCases) => {
  const industryLower = industry.toLowerCase();
  
  // Check for exact ICP match
  for (const useCase of idealUseCases) {
    const useCaseLower = useCase.toLowerCase();
    
    // Extract industry keywords from use case
    const industryKeywords = extractIndustryKeywords(useCaseLower);
    
    for (const keyword of industryKeywords) {
      if (industryLower.includes(keyword)) {
        return {
          score: 20,
          reasoning: `Industry "${industry}" matches ideal use case "${useCase}" (+20 points)`
        };
      }
    }
  }

  // Check for adjacent industries
  const adjacentIndustries = getAdjacentIndustries(industryLower);
  for (const useCase of idealUseCases) {
    const useCaseLower = useCase.toLowerCase();
    const useCaseKeywords = extractIndustryKeywords(useCaseLower);
    
    for (const keyword of useCaseKeywords) {
      if (adjacentIndustries.some(adj => adj.includes(keyword))) {
        return {
          score: 10,
          reasoning: `Industry "${industry}" is adjacent to ideal use case "${useCase}" (+10 points)`
        };
      }
    }
  }

  return {
    score: 0,
    reasoning: `Industry "${industry}" doesn't match ideal use cases (0 points)`
  };
};

/**
 * Extract industry keywords from use case text
 */
const extractIndustryKeywords = (useCase) => {
  const keywords = [];
  
  // Common industry terms
  const industryTerms = [
    'saas', 'software', 'tech', 'technology', 'fintech', 'healthtech',
    'ecommerce', 'retail', 'manufacturing', 'healthcare', 'finance',
    'banking', 'insurance', 'real estate', 'education', 'media',
    'entertainment', 'gaming', 'automotive', 'aerospace', 'energy',
    'telecommunications', 'consulting', 'legal', 'marketing', 'advertising'
  ];

  for (const term of industryTerms) {
    if (useCase.includes(term)) {
      keywords.push(term);
    }
  }

  return keywords;
};

/**
 * Get adjacent industries for a given industry
 */
const getAdjacentIndustries = (industry) => {
  const adjacentMap = {
    'saas': ['software', 'tech', 'technology'],
    'software': ['saas', 'tech', 'technology'],
    'tech': ['saas', 'software', 'technology', 'fintech', 'healthtech'],
    'fintech': ['finance', 'banking', 'tech', 'software'],
    'healthtech': ['healthcare', 'medical', 'tech', 'software'],
    'ecommerce': ['retail', 'online', 'marketplace'],
    'retail': ['ecommerce', 'consumer', 'shopping']
  };

  return adjacentMap[industry] || [];
};

/**
 * Calculate data completeness score
 */
const getDataCompletenessScore = (lead) => {
  const requiredFields = ['name', 'role', 'company', 'industry', 'location'];
  const optionalFields = ['linkedin_bio'];
  
  let completedFields = 0;
  let totalFields = requiredFields.length + optionalFields.length;

  // Check required fields
  for (const field of requiredFields) {
    if (lead[field] && lead[field].trim().length > 0) {
      completedFields++;
    }
  }

  // Check optional fields
  for (const field of optionalFields) {
    if (lead[field] && lead[field].trim().length > 0) {
      completedFields++;
    }
  }

  const completenessPercentage = (completedFields / totalFields) * 100;
  
  if (completenessPercentage === 100) {
    return {
      score: 10,
      reasoning: `All fields completed (+10 points)`
    };
  } else if (completenessPercentage >= 80) {
    return {
      score: 7,
      reasoning: `Most fields completed (${completenessPercentage.toFixed(0)}%) (+7 points)`
    };
  } else if (completenessPercentage >= 60) {
    return {
      score: 5,
      reasoning: `Some fields missing (${completenessPercentage.toFixed(0)}%) (+5 points)`
    };
  } else {
    return {
      score: 0,
      reasoning: `Many fields missing (${completenessPercentage.toFixed(0)}%) (0 points)`
    };
  }
};

module.exports = {
  calculateRuleScore
};
