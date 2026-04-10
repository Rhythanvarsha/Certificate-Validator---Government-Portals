const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  recipientEmail: {
    type: String,
    required: true,
  },
  certificateType: {
    type: String,
    enum: ['Birth', 'Income', 'Degree'],
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
  qrData: {
    type: String,
    required: true,
  },
  pdfPath: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
