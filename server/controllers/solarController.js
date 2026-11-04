const { calculateSolarPotential } = require('../../shared/engine/solar');
const SolarEstimate = require('../models/SolarEstimate');
const SolarEnquiry = require('../models/SolarEnquiry');
const Vendor = require('../models/Vendor');

/**
 * @desc    Calculate solar rooftop potential and financial/environmental assessment
 * @route   POST /api/v1/solar/calculate
 * @access  Public / Optional Auth
 */
exports.calculateSolar = async (req, res, next) => {
  try {
    const { roofAreaSqft, monthlyBillInr, district, state, homeType } = req.body;

    // Input Validation
    if (roofAreaSqft === undefined || roofAreaSqft === null || isNaN(Number(roofAreaSqft))) {
      return res.status(400).json({
        success: false,
        message: 'roofAreaSqft is required and must be a valid number',
      });
    }

    if (monthlyBillInr === undefined || monthlyBillInr === null || isNaN(Number(monthlyBillInr))) {
      return res.status(400).json({
        success: false,
        message: 'monthlyBillInr is required and must be a valid number',
      });
    }

    const numRoofArea = Number(roofAreaSqft);
    const numMonthlyBill = Number(monthlyBillInr);

    if (numRoofArea <= 0) {
      return res.status(400).json({
        success: false,
        message: 'roofAreaSqft must be greater than zero',
      });
    }

    if (numMonthlyBill <= 0) {
      return res.status(400).json({
        success: false,
        message: 'monthlyBillInr must be greater than zero',
      });
    }

    // Run deterministic calculation engine
    const assessment = calculateSolarPotential({
      roofAreaSqft: numRoofArea,
      monthlyBillInr: numMonthlyBill,
      district: district || 'Ahmedabad',
      state: state || 'Gujarat',
      homeType: homeType || 'independent',
    });

    let savedEstimateId = null;

    // If authenticated user, persist SolarEstimate history
    if (req.user && req.user._id) {
      const estimateRecord = await SolarEstimate.create({
        userId: req.user._id,
        inputs: assessment.inputs,
        feasible: assessment.feasible,
        reason: assessment.reason || null,
        limitingFactor: assessment.limitingFactor || null,
        capacityKw: assessment.capacityKw || 0,
        discom: assessment.discom,
        estimatedMonthlyUnits: assessment.estimatedMonthlyUnits,
        annualGenerationKwh: assessment.annualGenerationKwh || 0,
        financials: assessment.financials || null,
        environmental: assessment.environmental || null,
        estimatedFlags: assessment.estimatedFlags || {},
        assumptions: assessment.assumptions || [],
        configVersion: assessment.configVersion,
      });
      savedEstimateId = estimateRecord._id;
    }

    return res.status(200).json({
      success: true,
      data: assessment,
      estimateId: savedEstimateId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit rooftop solar enquiry / lead for installer CTA
 * @route   POST /api/v1/solar/enquiry
 * @access  Private
 */
exports.createSolarEnquiry = async (req, res, next) => {
  try {
    const { district, capacityKw, vendorId, contactPhone, notes } = req.body;

    if (!district || typeof district !== 'string' || !district.trim()) {
      return res.status(400).json({
        success: false,
        message: 'district is required',
      });
    }

    if (capacityKw === undefined || capacityKw === null || isNaN(Number(capacityKw))) {
      return res.status(400).json({
        success: false,
        message: 'capacityKw is required and must be a valid number',
      });
    }

    const numCapacity = Number(capacityKw);
    if (numCapacity < 0.5) {
      return res.status(400).json({
        success: false,
        message: 'Minimum solar capacity for enquiry is 0.5 kW',
      });
    }

    const enquiry = await SolarEnquiry.create({
      userId: req.user._id,
      district: district.trim(),
      capacityKw: numCapacity,
      vendorId: vendorId || null,
      contactPhone: contactPhone ? String(contactPhone).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
      status: 'submitted',
    });

    return res.status(201).json({
      success: true,
      message: 'Solar installation enquiry submitted successfully',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vendors filtered by category and optional district
 * @route   GET /api/v1/vendors
 * @access  Public
 */
exports.getVendors = async (req, res, next) => {
  try {
    const { category = 'solar_installer', district } = req.query;

    const filter = { category };
    if (district && typeof district === 'string' && district.trim()) {
      filter.districts = {
        $in: [new RegExp(`^${district.trim()}$`, 'i')],
      };
    }

    let vendors = await Vendor.find(filter).sort({ rating: -1, reviewCount: -1 });

    // Fallback: if district filter returned no vendors, return all vendors in that category
    if (vendors.length === 0 && district) {
      vendors = await Vendor.find({ category }).sort({ rating: -1, reviewCount: -1 });
    }

    return res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    next(error);
  }
};
