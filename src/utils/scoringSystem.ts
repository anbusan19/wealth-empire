interface Answer {
  questionId: number;
  answer: string;
  followUpAnswer?: string;
}

interface CategoryScore {
  category: string;
  score: number;
  color: string;
  bgColor: string;
  insights: string;
  status: 'excellent' | 'good' | 'needs-attention' | 'critical';
}

interface ComplianceResults {
  overallScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  redFlags: string[];
  riskForecast: {
    period: string;
    risks: Array<{
      type: string;
      penalty: string;
      probability: 'high' | 'medium' | 'low';
    }>;
  };
}

// Question categories mapping
const questionCategories = {
  'Company & Legal Structure': [1, 2, 3],
  'Taxation & GST': [4, 5, 6],
  'Intellectual Property (IP)': [7, 8, 9],
  'Certifications & Industry Licenses': [10, 11],
  'Financial Health & Risk': [12, 13, 14, 15]
};

// Scoring weights for each question
const questionWeights = {
  1: 25, // Company incorporation (critical)
  2: 20, // MCA returns (important)
  3: 15, // DIN KYC (important)
  4: 20, // GST registration (important)
  5: 25, // GST returns (critical)
  6: 20, // ITR filing (important)
  7: 30, // Trademark (very important)
  8: 25, // Patents (important)
  9: 15, // Copyright (moderate)
  10: 25, // ISO certification (important)
  11: 30, // Industry licenses (critical)
  12: 20, // Bookkeeping (important)
  13: 25, // Outstanding liabilities (critical)
  14: 15, // Tax planning (moderate)
  15: 20  // Compliance officer (important)
};

export function calculateScores(answers: Record<number, string>, followUpAnswers: Record<number, string>): ComplianceResults {
  const categoryScores: Record<string, { total: number; max: number; details: string[] }> = {};
  const strengths: string[] = [];
  const redFlags: string[] = [];
  const risks: Array<{ type: string; penalty: string; probability: 'high' | 'medium' | 'low' }> = [];

  // Initialize category scores
  Object.keys(questionCategories).forEach(category => {
    categoryScores[category] = { total: 0, max: 0, details: [] };
  });

  // Calculate scores for each question
  Object.entries(answers).forEach(([questionIdStr, answer]) => {
    const questionId = parseInt(questionIdStr);
    const weight = questionWeights[questionId as keyof typeof questionWeights] || 10;
    const category = Object.keys(questionCategories).find(cat => 
      questionCategories[cat as keyof typeof questionCategories].includes(questionId)
    );

    if (!category) return;

    categoryScores[category].max += weight;

    // Score based on answer
    let score = 0;
    let insight = '';

    switch (questionId) {
      case 1: // Company incorporation
        if (answer === 'Yes') {
          score = weight;
          strengths.push('Company is legally incorporated');
          insight = 'Legally incorporated with proper registration';
        } else if (answer === 'No') {
          redFlags.push('Company not legally incorporated');
          risks.push({
            type: 'Legal Structure Risk',
            penalty: 'Personal liability exposure + ₹1-10 Lakhs penalty',
            probability: 'high'
          });
          insight = 'Critical: Company not incorporated';
        } else {
          score = weight * 0.3;
          insight = 'Incorporation status unclear';
        }
        break;

      case 2: // MCA returns
        if (answer === 'Yes') {
          score = weight;
          strengths.push('MCA annual returns filed on time');
          insight = 'MCA compliance up to date';
        } else if (answer === 'No') {
          redFlags.push('MCA annual returns not filed');
          risks.push({
            type: 'MCA Non-compliance',
            penalty: '₹50,000-5 Lakhs + Strike-off risk',
            probability: 'high'
          });
          insight = 'MCA returns overdue - immediate action needed';
        } else {
          score = weight * 0.5;
          insight = 'MCA filing status uncertain';
        }
        break;

      case 3: // DIN KYC
        if (answer === 'Yes') {
          score = weight;
          strengths.push('Director KYC compliance maintained');
          insight = 'All director KYC updated';
        } else if (answer === 'No') {
          const directorCount = parseInt(followUpAnswers[questionId]) || 1;
          redFlags.push(`DIN KYC pending for ${directorCount} director(s)`);
          risks.push({
            type: 'Director KYC Penalty',
            penalty: `₹5,000 per director (₹${5000 * directorCount} total)`,
            probability: 'medium'
          });
          insight = `KYC pending for ${directorCount} director(s)`;
        } else {
          score = weight * 0.6;
          insight = 'Director KYC status unclear';
        }
        break;

      case 4: // GST registration
        if (answer === 'Yes') {
          score = weight;
          strengths.push('GST registration active');
          insight = 'GST registered and active';
        } else if (answer === 'No') {
          redFlags.push('GST registration missing');
          risks.push({
            type: 'GST Non-registration',
            penalty: '₹10,000 + 18% tax on turnover',
            probability: 'high'
          });
          insight = 'GST registration required';
        } else {
          score = weight * 0.4;
          insight = 'GST registration status unclear';
        }
        break;

      case 5: // GST returns
        if (answer === 'Yes') {
          score = weight;
          strengths.push('GST returns filed on time');
          insight = 'GST compliance current';
        } else if (answer === 'No') {
          const missedMonths = parseInt(followUpAnswers[questionId]) || 1;
          redFlags.push(`GST returns missed for ${missedMonths} month(s)`);
          risks.push({
            type: 'GST Late Filing Penalty',
            penalty: `₹${200 * missedMonths}/month + interest`,
            probability: 'high'
          });
          insight = `${missedMonths} months GST returns overdue`;
        } else {
          score = weight * 0.5;
          insight = 'GST filing status uncertain';
        }
        break;

      case 6: // ITR filing
        if (answer === 'Yes') {
          score = weight;
          strengths.push('Income Tax Returns filed');
          insight = 'ITR compliance maintained';
        } else if (answer === 'No') {
          const missedYears = parseInt(followUpAnswers[questionId]) || 1;
          redFlags.push(`ITR not filed for ${missedYears} year(s)`);
          risks.push({
            type: 'Income Tax Penalty',
            penalty: `₹5,000-1 Lakh per year (₹${Math.min(100000, 5000 * missedYears)} estimated)`,
            probability: 'high'
          });
          insight = `ITR overdue for ${missedYears} year(s)`;
        } else {
          score = weight * 0.6;
          insight = 'ITR filing status unclear';
        }
        break;

      case 7: // Trademark
        if (answer === 'Yes') {
          score = weight;
          strengths.push('Trademark protection secured');
          insight = 'Brand legally protected';
        } else if (answer === 'No') {
          redFlags.push('Trademark not filed');
          risks.push({
            type: 'Brand Protection Risk',
            penalty: '₹2-5 Lakhs + legal costs',
            probability: 'high'
          });
          insight = 'Brand vulnerable to infringement';
        } else {
          score = weight * 0.3;
          insight = 'Trademark status unclear';
        }
        break;

      case 8: // Patents
        if (answer === 'Yes, filed patents') {
          score = weight;
          strengths.push('Patent protection secured');
          insight = 'Innovation legally protected';
        } else if (answer === 'No, but have unique products/technology') {
          score = weight * 0.3;
          redFlags.push('Unique technology not patent-protected');
          risks.push({
            type: 'IP Theft Risk',
            penalty: 'Loss of competitive advantage',
            probability: 'medium'
          });
          insight = 'Technology needs patent protection';
        } else if (answer === 'No unique products/technology') {
          score = weight * 0.8;
          insight = 'No patentable technology identified';
        } else {
          score = weight * 0.9;
          insight = 'Patent assessment not applicable';
        }
        break;

      case 9: // Copyright
        if (answer === 'Yes') {
          score = weight;
          strengths.push('Copyright registrations maintained');
          insight = 'Creative works protected';
        } else {
          score = weight * 0.7;
          insight = 'Consider copyright for creative works';
        }
        break;

      case 10: // ISO certification
        if (answer === 'Yes') {
          score = weight;
          strengths.push('ISO certification obtained');
          insight = 'Quality standards certified';
        } else if (answer === 'No') {
          redFlags.push('ISO certification missing');
          risks.push({
            type: 'Market Access Risk',
            penalty: 'Lost business opportunities',
            probability: 'medium'
          });
          insight = 'ISO certification recommended';
        } else {
          score = weight * 0.5;
          insight = 'ISO certification status unclear';
        }
        break;

      case 11: // Industry licenses
        if (answer === 'Yes, all required licenses') {
          score = weight;
          strengths.push('All industry licenses obtained');
          insight = 'Fully licensed for operations';
        } else if (answer === 'Some licenses missing') {
          score = weight * 0.4;
          redFlags.push('Some industry licenses missing');
          risks.push({
            type: 'Regulatory Compliance Risk',
            penalty: '₹1-10 Lakhs + operational shutdown',
            probability: 'high'
          });
          insight = 'Critical licenses missing';
        } else if (answer === 'Not sure what licenses needed') {
          score = weight * 0.2;
          redFlags.push('License requirements not assessed');
          insight = 'License audit required';
        } else {
          score = weight * 0.9;
          insight = 'No special licenses required';
        }
        break;

      case 12: // Bookkeeping
        if (answer === 'Yes') {
          score = weight;
          strengths.push('Proper financial record maintenance');
          insight = 'Financial compliance maintained';
        } else {
          redFlags.push('Inadequate bookkeeping practices');
          risks.push({
            type: 'Audit Risk',
            penalty: '₹25,000-2 Lakhs penalty',
            probability: 'medium'
          });
          insight = 'Bookkeeping needs improvement';
        }
        break;

      case 13: // Outstanding liabilities
        if (answer === 'No') {
          score = weight;
          strengths.push('No overdue liabilities');
          insight = 'Financial obligations current';
        } else if (answer === 'Yes') {
          redFlags.push('Outstanding overdue liabilities');
          risks.push({
            type: 'Financial Distress Risk',
            penalty: 'Credit rating impact + legal action',
            probability: 'high'
          });
          insight = 'Overdue payments need attention';
        } else {
          score = weight * 0.6;
          insight = 'Liability status needs review';
        }
        break;

      case 14: // Tax planning
        if (answer === 'Yes') {
          score = weight;
          strengths.push('Tax planning implemented');
          insight = 'Tax optimization in place';
        } else {
          score = weight * 0.6;
          insight = 'Tax planning opportunity exists';
        }
        break;

      case 15: // Compliance officer
        if (answer === 'Yes') {
          score = weight;
          strengths.push('External compliance monitoring');
          insight = 'Professional compliance oversight';
        } else {
          score = weight * 0.7;
          insight = 'Consider compliance officer engagement';
        }
        break;

      default:
        score = weight * 0.5;
        insight = 'Response recorded';
    }

    categoryScores[category].total += score;
    categoryScores[category].details.push(insight);
  });

  // Calculate category scores and overall score
  const finalCategoryScores: CategoryScore[] = [];
  let totalScore = 0;
  let maxScore = 0;

  Object.entries(categoryScores).forEach(([category, data]) => {
    const percentage = data.max > 0 ? Math.round((data.total / data.max) * 100) : 0;
    
    let status: 'excellent' | 'good' | 'needs-attention' | 'critical';
    let color: string;
    let bgColor: string;

    if (percentage >= 85) {
      status = 'excellent';
      color = 'text-green-700';
      bgColor = 'bg-gradient-to-br from-green-100 to-green-200';
    } else if (percentage >= 70) {
      status = 'good';
      color = 'text-blue-700';
      bgColor = 'bg-gradient-to-br from-blue-100 to-blue-200';
    } else if (percentage >= 50) {
      status = 'needs-attention';
      color = 'text-orange-700';
      bgColor = 'bg-gradient-to-br from-orange-100 to-orange-200';
    } else {
      status = 'critical';
      color = 'text-red-700';
      bgColor = 'bg-gradient-to-br from-red-100 to-red-200';
    }

    finalCategoryScores.push({
      category: category.replace(' (IP)', '').replace('Certifications & Industry Licenses', 'Certification'),
      score: percentage,
      color,
      bgColor,
      insights: data.details[0] || 'Assessment completed',
      status
    });

    totalScore += data.total;
    maxScore += data.max;
  });

  const overallScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    overallScore,
    categoryScores: finalCategoryScores,
    strengths: strengths.slice(0, 8), // Limit to top strengths
    redFlags: redFlags.slice(0, 8), // Limit to top red flags
    riskForecast: {
      period: '6-Month Risk Forecast',
      risks: risks.slice(0, 6) // Limit to top risks
    }
  };
}