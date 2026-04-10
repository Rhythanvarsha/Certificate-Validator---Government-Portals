const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const CertificateRequest = require('../models/CertificateRequest');

// @desc    Create a certificate request
// @route   POST /api/requests
router.post('/', protect, async (req, res) => {
    try {
        const { name, certificateType, reason } = req.body;
        const request = await CertificateRequest.create({
            citizenId: req.user._id,
            citizenEmail: req.user.email,
            name,
            certificateType,
            reason
        });
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Request failed', error: error.message });
    }
});

// @desc    Get all requests (Admin) or my requests (Citizen)
// @route   GET /api/requests
router.get('/', protect, async (req, res) => {
    try {
        let requests;
        if (req.user.role === 'admin') {
            requests = await CertificateRequest.find({}).sort({ createdAt: -1 });
        } else {
            requests = await CertificateRequest.find({ citizenId: req.user._id }).sort({ createdAt: -1 });
        }
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed', error: error.message });
    }
});

// @desc    Update request status
// @route   PUT /api/requests/:id
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const request = await CertificateRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
});

module.exports = router;
