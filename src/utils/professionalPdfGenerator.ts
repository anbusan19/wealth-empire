import { pdf } from '@react-pdf/renderer';
import ComplianceReportPDF from '../components/ComplianceReportPDF';

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

export const generateProfessionalPDF = async (data: ComplianceData): Promise<void> => {
  try {
    // Generate PDF blob using @react-pdf/renderer
    const blob = await pdf(ComplianceReportPDF({ data })).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename
    const fileName = `compliance-health-report-${data.companyName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    link.download = fileName;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating professional PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

export default generateProfessionalPDF;