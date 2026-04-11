// utils/certificateGenerator.js
import PDFDocument from "pdfkit";

export const generateCertificatePDF = async (certificateData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      doc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      
      doc.on('error', (err) => {
        console.error('PDF generation error:', err);
        reject(err);
      });

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const centerX = pageWidth / 2;

      // Background
      doc.rect(0, 0, pageWidth, pageHeight).fill('#F8FBFC');
      
      // Outer border with gradient effect
      const borderMargin = 30;
      const borderMargin2 = 40;
      const borderMargin3 = 45;
      
      // Outer decorative border
      doc.rect(borderMargin, borderMargin, pageWidth - (borderMargin * 2), pageHeight - (borderMargin * 2))
         .lineWidth(2)
         .stroke('#0097B2');
      
      // Middle border
      doc.rect(borderMargin2, borderMargin2, pageWidth - (borderMargin2 * 2), pageHeight - (borderMargin2 * 2))
         .lineWidth(1)
         .stroke('#00B2A9');
      
      // Inner border
      doc.rect(borderMargin3, borderMargin3, pageWidth - (borderMargin3 * 2), pageHeight - (borderMargin3 * 2))
         .lineWidth(3)
         .stroke('#0097B2');

      // Corner decorations (elegant L-shapes)
      const cornerSize = 40;
      const cornerOffset = 55;
      const cornerThickness = 4;
      
      // Top-left corner
      doc.moveTo(cornerOffset, cornerOffset + cornerSize)
         .lineTo(cornerOffset, cornerOffset)
         .lineTo(cornerOffset + cornerSize, cornerOffset)
         .lineWidth(cornerThickness)
         .stroke('#00B2A9');
      
      // Top-right corner
      doc.moveTo(pageWidth - cornerOffset - cornerSize, cornerOffset)
         .lineTo(pageWidth - cornerOffset, cornerOffset)
         .lineTo(pageWidth - cornerOffset, cornerOffset + cornerSize)
         .lineWidth(cornerThickness)
         .stroke('#00B2A9');
      
      // Bottom-left corner
      doc.moveTo(cornerOffset, pageHeight - cornerOffset - cornerSize)
         .lineTo(cornerOffset, pageHeight - cornerOffset)
         .lineTo(cornerOffset + cornerSize, pageHeight - cornerOffset)
         .lineWidth(cornerThickness)
         .stroke('#00B2A9');
      
      // Bottom-right corner
      doc.moveTo(pageWidth - cornerOffset - cornerSize, pageHeight - cornerOffset)
         .lineTo(pageWidth - cornerOffset, pageHeight - cornerOffset)
         .lineTo(pageWidth - cornerOffset, pageHeight - cornerOffset - cornerSize)
         .lineWidth(cornerThickness)
         .stroke('#00B2A9');

      // MorrowGen Logo (Stylized M in circle)
      const logoY = 110;
      const logoRadius = 45;
      
      // Logo circle background
      doc.circle(centerX, logoY, logoRadius)
         .fillAndStroke('#0097B2', '#00B2A9');
      
      doc.circle(centerX, logoY, logoRadius - 3)
         .fill('#FFFFFF');
      
      // Draw stylized "M" letter
      doc.save();
      doc.translate(centerX, logoY);
      
      // M letter paths
      const mWidth = 45;
      const mHeight = 40;
      
      doc.moveTo(-mWidth/2, mHeight/2)
         .lineTo(-mWidth/2, -mHeight/2)
         .lineTo(-mWidth/6, mHeight/6)
         .lineTo(mWidth/6, -mHeight/2)
         .lineTo(mWidth/2, -mHeight/2)
         .lineTo(mWidth/2, mHeight/2)
         .lineWidth(6)
         .stroke('#0097B2');
      
      doc.restore();

      // MorrowGen Brand Name
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#0097B2')
         .text('MorrowGen', 100, 175, { 
           align: 'center',
           width: pageWidth - 200
         });

      // Decorative line under logo
      const lineY = 205;
      const lineWidth = 120;
      doc.moveTo(centerX - lineWidth/2, lineY)
         .lineTo(centerX + lineWidth/2, lineY)
         .lineWidth(2)
         .stroke('#00B2A9');

      // Certificate content
      let currentY = 240;

      // Title
      doc.fontSize(42)
         .font('Helvetica-Bold')
         .fillColor('#2C3E50')
         .text('Certificate of Completion', 100, currentY, { 
           align: 'center',
           width: pageWidth - 200
         });

      currentY += 65;

      // "This certifies that"
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#5A6C7D')
         .text('This is to certify that', 100, currentY, { 
           align: 'center',
           width: pageWidth - 200
         });

      currentY += 40;

      // Student name (highlighted with background)
      const nameBoxY = currentY - 8;
      const nameBoxHeight = 50;
      
      doc.rect(150, nameBoxY, pageWidth - 300, nameBoxHeight)
         .fill('#E8F4F8');
      
      doc.fontSize(36)
         .font('Helvetica-Bold')
         .fillColor('#0097B2')
         .text(certificateData.studentName || 'Student Name', 100, currentY, { 
           align: 'center',
           width: pageWidth - 200
         });

      currentY += 60;

      // "has successfully completed"
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#5A6C7D')
         .text('has successfully completed the course', 100, currentY, { 
           align: 'center',
           width: pageWidth - 200
         });

      currentY += 40;

      // Course name
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#2C3E50')
         .text(certificateData.courseName || 'Course Name', 100, currentY, { 
           align: 'center',
           width: pageWidth - 200
         });

      // Signature section with enhanced design
      const signatureY = pageHeight - 150;
      const signatureWidth = 180;
      const leftSignatureX = centerX - 240;
      const rightSignatureX = centerX + 60;

      // Left signature box
      doc.rect(leftSignatureX - 10, signatureY - 15, signatureWidth + 20, 80)
         .fillAndStroke('#FFFFFF', '#E0E0E0');

      doc.moveTo(leftSignatureX, signatureY)
         .lineTo(leftSignatureX + signatureWidth, signatureY)
         .lineWidth(2)
         .stroke('#0097B2');

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#2C3E50')
         .text('Instructor Signature', leftSignatureX, signatureY + 12, { 
           width: signatureWidth,
           align: 'center'
         });

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#5A6C7D')
         .text(certificateData.instructorName || 'Instructor Name', leftSignatureX, signatureY + 32, { 
           width: signatureWidth,
           align: 'center'
         });

      // Right signature box
      doc.rect(rightSignatureX - 10, signatureY - 15, signatureWidth + 20, 80)
         .fillAndStroke('#FFFFFF', '#E0E0E0');

      doc.moveTo(rightSignatureX, signatureY)
         .lineTo(rightSignatureX + signatureWidth, signatureY)
         .lineWidth(2)
         .stroke('#0097B2');

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#2C3E50')
         .text('Date of Completion', rightSignatureX, signatureY + 12, { 
           width: signatureWidth,
           align: 'center'
         });

      const completionDate = certificateData.completionDate 
        ? new Date(certificateData.completionDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#5A6C7D')
         .text(completionDate, rightSignatureX, signatureY + 32, { 
           width: signatureWidth,
           align: 'center'
         });

      // Footer section
      const footerY = pageHeight - 50;
      
      // Certificate ID
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#95A5A6')
         .text(`Certificate ID: ${certificateData.certificateId || 'N/A'}`, 60, footerY, { 
           align: 'left'
         });

      // Verification URL (if provided)
      if (certificateData.verificationUrl) {
        doc.fontSize(8)
           .fillColor('#0097B2')
           .text(`Verify: ${certificateData.verificationUrl}`, 100, footerY + 15, { 
             align: 'center',
             width: pageWidth - 200,
             link: certificateData.verificationUrl
           });
      }

      // Decorative footer line
      doc.moveTo(60, footerY - 10)
         .lineTo(pageWidth - 60, footerY - 10)
         .lineWidth(1)
         .stroke('#E0E0E0');

      // Finish the PDF
      doc.end();

    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};