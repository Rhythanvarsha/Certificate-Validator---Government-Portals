const mongoose = require('mongoose');

const certificateRequestSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  citizenEmail: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  certificateType: {
    type: String,
    enum: ['Birth', 'Income', 'Degree'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Issued', 'Rejected'],
    default: 'Pending',
  },
  reason: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('CertificateRequest', certificateRequestSchema);
