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
      <div style="width: 210mm; height: 297mm; padding: 15mm; font-family: Arial, sans-serif; background: white; font-size: 12px; line-height: 1.4; display: flex; flex-direction: column;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #1f2937;">
          <div style="display: flex; align-items: center;">
            <img src="welogo.png" alt="Wealth Empire Logo" style="width: 50px; height: 50px; margin-right: 12px;" />
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">
                WEALTH EMPIRE
              </div>
              <div style="font-size: 16px; font-weight: 600; color: #374151;">
                Compliance Health Report
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Report Date</div>
            <div style="font-weight: 600; margin-bottom: 8px;">${data.reportDate}</div>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Company</div>
            <div style="font-weight: 600; font-size: 14px;">${data.companyName}</div>
          </div>
        </div>

        <!-- Executive Summary & Category Scores -->
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
          <!-- Overall Score -->
          <div style="flex: 1; background: #1f2937; color: white; border-radius: 12px; padding: 20px; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; opacity: 0.8;">
              OVERALL COMPLIANCE SCORE
            </div>
            <div style="font-size: 48px; font-weight: bold; margin-bottom: 5px;">
              ${data.overallScore}
            </div>
            <div style="font-size: 14px; opacity: 0.8;">out of 100</div>
            <div style="margin-top: 15px; padding: 8px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; ${data.overallScore >= 80 ? 'background: #dcfce7; color: #166534;' :
        data.overallScore >= 60 ? 'background: #fef3c7; color: #92400e;' :
          'background: #fee2e2; color: #991b1b;'
      }">
              ${data.overallScore >= 80 ? 'EXCELLENT' : data.overallScore >= 60 ? 'GOOD' : 'NEEDS IMPROVEMENT'}
            </div>
          </div>

          <!-- Category Breakdown -->
          <div style="flex: 2;">
            <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 12px; color: #1f2937;">
              Category Breakdown
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              ${data.categoryScores.map(category => `
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; background: #f9fafb;">
                  <div style="font-size: 10px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px;">
                    ${category.category}
                  </div>
                  <div style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 4px;">
                    ${category.score}
                  </div>
                  <div style="font-size: 9px; color: #6b7280; line-height: 1.3;">
                    ${category.insights}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>



        <!-- Strengths, Red Flags, and Risk Forecast -->
        <div style="display: flex; gap: 15px; margin-bottom: 20px; flex: 1;">
          <!-- Strengths -->
          <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px;">
            <h3 style="font-size: 13px; font-weight: bold; color: #166534; margin-bottom: 10px; display: flex; align-items: center; gap: 5px;">
              ✓ Strengths
            </h3>
            <div style="font-size: 10px; line-height: 1.4;">
              ${data.strengths.slice(0, 4).map(strength => `
                <div style="display: flex; align-items: flex-start; gap: 5px; margin-bottom: 4px;">
                  <span style="color: #16a34a; margin-top: 1px;">✓</span>
                  <span style="color: #166534;">${strength}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Red Flags -->
          <div style="flex: 1; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px;">
            <h3 style="font-size: 13px; font-weight: bold; color: #991b1b; margin-bottom: 10px; display: flex; align-items: center; gap: 5px;">
              ⚠ Red Flags
            </h3>
            <div style="font-size: 10px; line-height: 1.4;">
              ${data.redFlags.slice(0, 4).map(flag => `
                <div style="display: flex; align-items: flex-start; gap: 5px; margin-bottom: 4px;">
                  <span style="color: #dc2626; margin-top: 1px;">⚠</span>
                  <span style="color: #991b1b;">${flag}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Risk Forecast -->
          <div style="flex: 1; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 15px;">
            <h3 style="font-size: 13px; font-weight: bold; color: #ea580c; margin-bottom: 10px;">
              📈 6-Month Risks
            </h3>
            <div style="font-size: 10px; line-height: 1.4;">
              ${data.riskForecast.risks.map(risk => `
                <div style="background: white; border: 1px solid #fed7aa; border-radius: 6px; padding: 8px; margin-bottom: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3px;">
                    <div style="font-weight: 600; color: #1f2937; font-size: 10px;">${risk.type}</div>
                    <span style="padding: 2px 6px; border-radius: 8px; font-size: 8px; font-weight: 600; ${risk.probability === 'high' ? 'background: #fee2e2; color: #991b1b;' :
          risk.probability === 'medium' ? 'background: #fef3c7; color: #92400e;' :
            'background: #dcfce7; color: #166534;'
        }">
                      ${risk.probability.toUpperCase()}
                    </span>
                  </div>
                  <div style="color: #6b7280; font-size: 9px;">${risk.penalty}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 12px; color: #1f2937;">
            Recommended Actions
          </h3>
          <div style="display: flex; gap: 15px;">
            <div style="flex: 1; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; background: #eff6ff;">
              <h4 style="font-weight: 600; color: #1e40af; margin-bottom: 6px; font-size: 11px;">
                High Priority Actions
              </h4>
              <ul style="font-size: 10px; color: #1e40af; margin: 0; padding-left: 15px; line-height: 1.4;">
                <li>File trademark application</li>
                <li>Complete industry certifications</li>
                <li>Update director KYC</li>
              </ul>
            </div>
            <div style="flex: 1; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; background: #fffbeb;">
              <h4 style="font-weight: 600; color: #92400e; margin-bottom: 6px; font-size: 11px;">
                Medium Priority Actions
              </h4>
              <ul style="font-size: 10px; color: #92400e; margin: 0; padding-left: 15px; line-height: 1.4;">
                <li>Obtain ISO 9001 certification</li>
                <li>Implement compliance monitoring</li>
                <li>Review governance policies</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600; color: #1f2937; font-size: 12px;">Wealth Empire</div>
            <div style="font-size: 10px; color: #6b7280;">Compliance & Legal Services</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; color: #6b7280;">For support contact:</div>
            <div style="font-weight: 600; color: #1f2937; font-size: 11px;">support@wealthempire.com</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 10px; font-size: 9px; color: #9ca3af; line-height: 1.3;">
          This report is confidential and intended solely for ${data.companyName}. 
          Generated on ${data.reportDate} by Wealth Empire Compliance Platform.
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