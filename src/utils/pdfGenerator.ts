import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

export const generatePDF = async (data: ComplianceData): Promise<void> => {
  try {
    // Create a temporary container for the PDF template
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm';
    tempContainer.style.backgroundColor = 'white';
    
    // Create the HTML content for PDF
    tempContainer.innerHTML = `
      <div style="width: 210mm; min-height: 297mm; padding: 20mm; font-family: Arial, sans-serif; background: white;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb;">
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 8px;">
              Wealth Empire
            </div>
            <h1 style="font-size: 28px; font-weight: bold; color: #111827; margin: 0;">
              Compliance Health Report
            </h1>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; color: #6b7280;">Report Date</div>
            <div style="font-weight: 600; margin-bottom: 8px;">${data.reportDate}</div>
            <div style="font-size: 14px; color: #6b7280;">Company</div>
            <div style="font-weight: 600;">${data.companyName}</div>
          </div>
        </div>

        <!-- Executive Summary -->
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #111827; margin-bottom: 16px;">Executive Summary</h2>
          <div style="background: #f9fafb; border-radius: 8px; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Overall Compliance Score</div>
                <div style="font-size: 48px; font-weight: bold; color: #111827;">${data.overallScore}/100</div>
              </div>
              <div style="padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; ${
                data.overallScore >= 80 ? 'background: #dcfce7; color: #166534;' :
                data.overallScore >= 60 ? 'background: #fef3c7; color: #92400e;' :
                'background: #fee2e2; color: #991b1b;'
              }">
                ${data.overallScore >= 80 ? 'EXCELLENT' :
                  data.overallScore >= 60 ? 'GOOD' : 'NEEDS IMPROVEMENT'}
              </div>
            </div>
          </div>
        </div>

        <!-- Category Breakdown -->
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #111827; margin-bottom: 16px;">Category Breakdown</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${data.categoryScores.map(category => `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <h3 style="font-weight: 600; color: #111827; margin: 0;">${category.category}</h3>
                  <span style="font-size: 24px; font-weight: bold; color: #111827;">${category.score}</span>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">${category.insights}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Strengths and Red Flags -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
          <!-- Strengths -->
          <div>
            <h2 style="font-size: 20px; font-weight: bold; color: #166534; margin-bottom: 16px;">
              ✓ Strengths
            </h2>
            <div style="space-y: 8px;">
              ${data.strengths.map(strength => `
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                  <span style="color: #16a34a; margin-top: 2px;">✓</span>
                  <span style="font-size: 14px; color: #374151;">${strength}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Red Flags -->
          <div>
            <h2 style="font-size: 20px; font-weight: bold; color: #991b1b; margin-bottom: 16px;">
              ⚠ Red Flags
            </h2>
            <div style="space-y: 8px;">
              ${data.redFlags.map(flag => `
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                  <span style="color: #dc2626; margin-top: 2px;">⚠</span>
                  <span style="font-size: 14px; color: #374151;">${flag}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Risk Forecast -->
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #ea580c; margin-bottom: 16px;">
            📈 ${data.riskForecast.period}
          </h2>
          <div style="space-y: 12px;">
            ${data.riskForecast.risks.map(risk => `
              <div style="border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; background: #fff7ed;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h3 style="font-weight: 600; color: #111827; margin: 0 0 4px 0;">${risk.type}</h3>
                    <p style="font-size: 14px; color: #6b7280; margin: 0;">${risk.penalty}</p>
                  </div>
                  <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; ${
                    risk.probability === 'high' ? 'background: #fee2e2; color: #991b1b;' :
                    risk.probability === 'medium' ? 'background: #fef3c7; color: #92400e;' :
                    'background: #dcfce7; color: #166534;'
                  }">
                    ${risk.probability.toUpperCase()} RISK
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recommendations -->
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #111827; margin-bottom: 16px;">Recommended Actions</h2>
          <div style="space-y: 16px;">
            <div style="border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; background: #eff6ff;">
              <h3 style="font-weight: 600; color: #1e40af; margin: 0 0 8px 0;">Immediate Actions (High Priority)</h3>
              <ul style="font-size: 14px; color: #1e40af; margin: 0; padding-left: 20px;">
                <li>File trademark application to protect brand identity</li>
                <li>Complete missing industry certifications</li>
                <li>Update director KYC documentation</li>
              </ul>
            </div>
            <div style="border: 1px solid #fde68a; border-radius: 8px; padding: 16px; background: #fffbeb;">
              <h3 style="font-weight: 600; color: #92400e; margin: 0 0 8px 0;">Medium Priority Actions</h3>
              <ul style="font-size: 14px; color: #92400e; margin: 0; padding-left: 20px;">
                <li>Obtain ISO 9001 certification for quality management</li>
                <li>Implement comprehensive compliance monitoring</li>
                <li>Review and update corporate governance policies</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 2px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: #111827;">Wealth Empire</div>
              <div style="font-size: 14px; color: #6b7280;">Compliance & Legal Services</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px; color: #6b7280;">For support contact:</div>
              <div style="font-weight: 600; color: #111827;">support@wealthempire.com</div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #9ca3af;">
            This report is confidential and intended solely for the use of ${data.companyName}. 
            Generated on ${data.reportDate} by Wealth Empire Compliance Platform.
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(tempContainer);

    // Generate canvas from HTML
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    const fileName = `compliance-health-report-${data.companyName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

export default generatePDF;