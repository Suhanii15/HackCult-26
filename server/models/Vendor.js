const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['solar_installer', 'waste_recycler', 'energy_auditor'],
      default: 'solar_installer',
      index: true,
    },
    districts: {
      type: [String],
      required: true,
      index: true,
    },
    state: {
      type: String,
      default: 'Gujarat',
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isEmpanelled: {
      type: Boolean,
      default: true,
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      default: '+91-79-XXXX-XXXX',
    },
    email: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vendor', vendorSchema);
