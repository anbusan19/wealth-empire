import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// For @react-pdf/renderer, we need to use a public URL or base64 encoded image
// Since we're in a Vite project, we'll use the public folder approach

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#1f2937',
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  reportInfo: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  reportValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  
  // Executive Summary Section
  executiveSummary: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 20,
  },
  scoreCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '35%',
  },
  scoreLabel: {
    fontSize: 9,
    color: '#d1d5db',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  scoreSubtext: {
    fontSize: 12,
    color: '#d1d5db',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  // Category Breakdown
  categorySection: {
    width: '65%',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  categoryScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryInsight: {
    fontSize: 7,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  
  // Three Column Section
  threeColumnSection: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 15,
  },
  column: {
    flex: 1,
    borderRadius: 8,
    padding: 15,
  },
  strengthsColumn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  redFlagsColumn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  risksColumn: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  columnTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthsTitle: {
    color: '#166534',
  },
  redFlagsTitle: {
    color: '#991b1b',
  },
  risksTitle: {
    color: '#ea580c',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    marginRight: 6,
    marginTop: 1,
  },
  listText: {
    fontSize: 8,
    lineHeight: 1.4,
    flex: 1,
  },
  strengthsText: {
    color: '#166534',
  },
  redFlagsText: {
    color: '#991b1b',
  },
  risksText: {
    color: '#ea580c',
  },
  
  // Risk Cards
  riskCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  riskTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 6,
    fontWeight: 'bold',
  },
  riskPenalty: {
    fontSize: 7,
    color: '#6b7280',
  },
  
  // Recommendations Section
  recommendationsSection: {
    marginBottom: 25,
  },
  recommendationsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  recommendationCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  highPriorityCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  mediumPriorityCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  recommendationTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  highPriorityTitle: {
    color: '#1e40af',
  },
  mediumPriorityTitle: {
    color: '#92400e',
  },
  recommendationList: {
    fontSize: 8,
    lineHeight: 1.4,
  },
  highPriorityText: {
    color: '#1e40af',
  },
  mediumPriorityText: {
    color: '#92400e',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  footerLeft: {
    alignItems: 'flex-start',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerCompany: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  footerSubtitle: {
    fontSize: 8,
    color: '#6b7280',
  },
  footerContact: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  confidentialText: {
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 1.3,
  },
});

interface ComplianceData {
  companyName: string;
  reportDate: string;
  overallScore: number;
  categoryScores: Array<{
    category: string;
    score: number;
    insights: string;
    status: string;
  }>;
  strengths: string[];
  redFlags: string[];
  riskForecast: {
    period: string;
    risks: Array<{
      type: string;
      penalty: string;
      probability: string;
    }>;
  };
}

interface ComplianceReportPDFProps {
  data: ComplianceData;
}

const ComplianceReportPDF: React.FC<ComplianceReportPDFProps> = ({ data }) => {
  const getStatusBadgeStyle = (score: number) => {
    if (score >= 80) {
      return { ...styles.statusBadge, backgroundColor: '#dcfce7', color: '#166534' };
    } else if (score >= 60) {
      return { ...styles.statusBadge, backgroundColor: '#fef3c7', color: '#92400e' };
    } else {
      return { ...styles.statusBadge, backgroundColor: '#fee2e2', color: '#991b1b' };
    }
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    return 'NEEDS IMPROVEMENT';
  };

  const getRiskBadgeStyle = (probability: string) => {
    switch (probability) {
      case 'high':
        return { ...styles.riskBadge, backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'medium':
        return { ...styles.riskBadge, backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return { ...styles.riskBadge, backgroundColor: '#dcfce7', color: '#166534' };
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 50,
              height: 50,
              backgroundColor: '#1f2937',
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Image 
              style={styles.logo} 
              src="/welogo.png"
            />
            </View>
            <View>
              <Text style={styles.companyName}>WEALTH EMPIRE</Text>
              <Text style={styles.reportTitle}>Compliance Health Report</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportInfo}>Report Date</Text>
            <Text style={styles.reportValue}>{data.reportDate}</Text>
            <Text style={[styles.reportInfo, { marginTop: 8 }]}>Company</Text>
            <Text style={styles.reportValue}>{data.companyName}</Text>
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.executiveSummary}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Overall Compliance Score</Text>
            <Text style={styles.scoreValue}>{data.overallScore}</Text>
            <Text style={styles.scoreSubtext}>out of 100</Text>
            <View style={getStatusBadgeStyle(data.overallScore)}>
              <Text>{getStatusText(data.overallScore)}</Text>
            </View>
          </View>

          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <View style={styles.categoryGrid}>
              {data.categoryScores.map((category, index) => (
                <View key={index} style={styles.categoryCard}>
                  <Text style={styles.categoryName}>{category.category}</Text>
                  <Text style={styles.categoryScore}>{category.score}</Text>
                  <Text style={styles.categoryInsight}>{category.insights}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Three Column Section */}
        <View style={styles.threeColumnSection}>
          {/* Strengths */}
          <View style={[styles.column, styles.strengthsColumn]}>
            <Text style={[styles.columnTitle, styles.strengthsTitle]}>✓ Strengths</Text>
            {data.strengths.slice(0, 4).map((strength, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={[styles.bullet, styles.strengthsText]}>✓</Text>
                <Text style={[styles.listText, styles.strengthsText]}>{strength}</Text>
              </View>
            ))}
          </View>

          {/* Red Flags */}
          <View style={[styles.column, styles.redFlagsColumn]}>
            <Text style={[styles.columnTitle, styles.redFlagsTitle]}>⚠ Red Flags</Text>
            {data.redFlags.slice(0, 4).map((flag, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={[styles.bullet, styles.redFlagsText]}>⚠</Text>
                <Text style={[styles.listText, styles.redFlagsText]}>{flag}</Text>
              </View>
            ))}
          </View>

          {/* Risk Forecast */}
          <View style={[styles.column, styles.risksColumn]}>
            <Text style={[styles.columnTitle, styles.risksTitle]}>📈 6-Month Risks</Text>
            {data.riskForecast.risks.map((risk, index) => (
              <View key={index} style={styles.riskCard}>
                <View style={styles.riskHeader}>
                  <Text style={styles.riskTitle}>{risk.type}</Text>
                  <View style={getRiskBadgeStyle(risk.probability)}>
                    <Text>{risk.probability.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.riskPenalty}>{risk.penalty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          <View style={styles.recommendationsGrid}>
            <View style={[styles.recommendationCard, styles.highPriorityCard]}>
              <Text style={[styles.recommendationTitle, styles.highPriorityTitle]}>
                High Priority Actions
              </Text>
              <Text style={[styles.recommendationList, styles.highPriorityText]}>
                • File trademark application to protect brand identity{'\n'}
                • Complete missing industry certifications{'\n'}
                • Update director KYC documentation
              </Text>
            </View>
            <View style={[styles.recommendationCard, styles.mediumPriorityCard]}>
              <Text style={[styles.recommendationTitle, styles.mediumPriorityTitle]}>
                Medium Priority Actions
              </Text>
              <Text style={[styles.recommendationList, styles.mediumPriorityText]}>
                • Obtain ISO 9001 certification for quality management{'\n'}
                • Implement comprehensive compliance monitoring{'\n'}
                • Review and update corporate governance policies
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerCompany}>Wealth Empire</Text>
              <Text style={styles.footerSubtitle}>Compliance & Legal Services</Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.footerSubtitle}>For support contact:</Text>
              <Text style={styles.footerContact}>support@wealthempire.com</Text>
            </View>
          </View>
          <Text style={styles.confidentialText}>
            This report is confidential and intended solely for {data.companyName}.{'\n'}
            Generated on {data.reportDate} by Wealth Empire Compliance Platform.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ComplianceReportPDF;