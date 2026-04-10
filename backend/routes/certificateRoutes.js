const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const { protect, admin } = require('../middlewares/authMiddleware');
const Certificate = require('../models/Certificate');
const CertificateRequest = require('../models/CertificateRequest');
const { generateHash, signData, verifySignature } = require('../utils/cryptoUtils');
const { generateCertificatePDF } = require('../utils/pdfGenerator');

// Multer config for file uploads
const upload = multer({ dest: 'uploads/' });

/**
 * Helper to generate canonical string for signing/verifying
 */
const getCanonicalString = (certificateId, name, recipientEmail, certificateType, issueDate) => {
    // Normalize date to YYYY-MM-DD
    const normalizedDate = new Date(issueDate).toISOString().split('T')[0];
    return `${certificateId}|${name}|${recipientEmail}|${certificateType}|${normalizedDate}`;
};

// @desc    Create a new certificate
// @route   POST /api/certificates/create
router.post('/create', protect, admin, async (req, res) => {
    try {
        const { name, recipientEmail, certificateType, issueDate, requestId } = req.body;
        const certificateId = uuidv4();

        // 1. Create Canonical Data String
        const dataString = getCanonicalString(certificateId, name, recipientEmail, certificateType, issueDate);

        // 2. Generate Hash and Signature
        const hash = generateHash(dataString);
        const signature = signData(dataString);

        // 3. Generate PDF
        const pdfPath = await generateCertificatePDF({
            certificateId,
            name,
            recipientEmail,
            certificateType,
            issueDate,
            hash,
            signature
        });

        const relativePdfPath = path.basename(pdfPath);

        // 4. Save to MongoDB
        const certificate = await Certificate.create({
            certificateId,
            name,
            recipientEmail,
            certificateType,
            issueDate,
            hash,
            signature,
            qrData: JSON.stringify({ id: certificateId, h: hash }),
            pdfPath: relativePdfPath,
            createdBy: req.user._id
        });

        // 5. If linked to a request, mark it as Issued
        if (requestId) {
            await CertificateRequest.findByIdAndUpdate(requestId, { status: 'Issued' });
        }

        res.status(201).json(certificate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Certificate creation failed', error: error.message });
    }
});

// @desc    Get all certificates (Admin)
// @route   GET /api/certificates
router.get('/', protect, admin, async (req, res) => {
    const certificates = await Certificate.find({}).sort({ createdAt: -1 });
    res.json(certificates);
});

// @desc    Get user's own certificates
// @route   GET /api/certificates/my
router.get('/my', protect, async (req, res) => {
    try {
        const certificates = await Certificate.find({ recipientEmail: req.user.email }).sort({ createdAt: -1 });
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed', error: error.message });
    }
});

// @desc    Download certificate PDF
// @route   GET /api/certificates/download/:id
router.get('/download/:id', async (req, res) => {
    const cert = await Certificate.findOne({ certificateId: req.params.id });
    if (cert) {
        const filePath = path.join(__dirname, '..', 'uploads', cert.pdfPath);
        res.download(filePath);
    } else {
        res.status(404).json({ message: 'Certificate not found' });
    }
});

// @desc    Verify via QR scan
// @route   POST /api/certificates/verify-qr
router.post('/verify-qr', async (req, res) => {
    const { certificateId, hash } = req.body;
    const cert = await Certificate.findOne({ certificateId });

    if (!cert) return res.json({ valid: false, message: 'ID not found.' });

    if (cert.hash === hash) {
        res.json({ valid: true, data: cert });
    } else {
        res.json({ valid: false, message: 'Tampered QR Code!' });
    }
});

// @desc    Verify via PDF upload
router.post('/verify-upload', upload.single('certificate'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file' });

        const dataBuffer = fs.readFileSync(req.file.path);
        const parser = new PDFParse({ data: dataBuffer });
        const pdfData = await parser.getText();
        
        const idMatch = pdfData.text.match(/Certificate ID: ([a-f0-9-]+)/);
        if (!idMatch) {
            fs.unlinkSync(req.file.path);
            return res.json({ valid: false, message: 'Invalid format (No ID)' });
        }

        const certificateId = idMatch[1];
        const cert = await Certificate.findOne({ certificateId });

        if (!cert) {
            fs.unlinkSync(req.file.path);
            return res.json({ valid: false, message: 'Record not found.' });
        }

        // Re-verify using Canonical String
        const dataString = getCanonicalString(
            cert.certificateId,
            cert.name,
            cert.recipientEmail,
            cert.certificateType,
            cert.issueDate
        );

        const isValid = verifySignature(dataString, cert.signature);
        fs.unlinkSync(req.file.path);

        if (isValid) {
            res.json({ valid: true, data: cert });
        } else {
            res.json({ valid: false, message: 'Digital signature verification failed!' });
        }
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

module.exports = router;
