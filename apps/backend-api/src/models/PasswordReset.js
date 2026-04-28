const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['email', 'whatsapp'],
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Used', 'Expired'],
      default: 'Pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

passwordResetSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);

