const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

/**
 * Generate PDF Certificate with QR code and hidden metadata
 */
const generateCertificatePDF = async (data) => {
    const { certificateId, name, recipientEmail, certificateType, issueDate, hash, signature } = data;
    const doc = new PDFDocument({ margin: 50 });
    const filename = `cert_${certificateId}.pdf`;
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }
    
    const filePath = path.join(uploadsDir, filename);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Embed metadata in PDF Info (accessible via pdf-parse)
    doc.info['Keywords'] = JSON.stringify({ certificateId, hash, signature });

    // HEADER
    doc.fontSize(25).text('GOVERNMENT OF INDIA', { align: 'center' });
    doc.fontSize(15).text('Digital Certificate Portal', { align: 'center' });
    doc.moveDown();
    doc.rect(50, 45, 500, 700).stroke(); // Border

    // TITLE
    doc.fontSize(30).fillColor('#2c3e50').text(certificateType.toUpperCase() + ' CERTIFICATE', {
        align: 'center',
        underline: true
    });
    doc.moveDown(2);

    // CONTENT
    doc.fontSize(18).fillColor('black').text('This is to certify that', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(24).font('Helvetica-Bold').text(name, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).font('Helvetica').text(`has been issued this ${certificateType} certificate on`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(20).font('Helvetica-Bold').text(new Date(issueDate).toDateString(), { align: 'center' });
    
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica').text(`Certificate ID: ${certificateId}`, { align: 'center' });

    // QR CODE
    const qrData = JSON.stringify({ id: certificateId, h: hash });
    const qrImage = await QRCode.toDataURL(qrData);
    doc.image(qrImage, doc.page.width / 2 - 50, 500, { width: 100 });
    
    doc.moveDown(8);
    doc.fontSize(10).font('Helvetica').text('Digital signature is embedded for verification purposes.', { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};

module.exports = { generateCertificatePDF };
