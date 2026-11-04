const mongoose = require('mongoose');

const solarEnquirySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    district: {
      type: String,
      required: [true, 'District is required for solar enquiry'],
      trim: true,
    },
    capacityKw: {
      type: Number,
      required: [true, 'Capacity in kW is required'],
      min: [0.5, 'Minimum capacity is 0.5 kW'],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'in_review', 'contacted', 'closed'],
      default: 'submitted',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SolarEnquiry', solarEnquirySchema);
