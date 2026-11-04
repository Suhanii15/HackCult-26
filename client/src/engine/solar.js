/**
 * shared/engine/solar.js
 *
 * EcoPulse Solar Rooftop Calculator Engine.
 * Pure functions, deterministic, zero I/O, zero network calls at runtime.
 * All constants and numbers are loaded from shared/engine/config/solar.json.
 */

const defaultSolarConfig = require('./config/solar.json');
let defaultGujaratYield = null;
try {
  defaultGujaratYield = require('./data/gujarat-yield.json');
} catch (e) {
  defaultGujaratYield = null;
}

/**
 * Calculate electricity bill for given monthly units under a DISCOM's residential tariff.
 *
 * @param {number} units - Monthly kWh units consumed
 * @param {string} discomKey - DISCOM name (e.g. 'UGVCL', 'Torrent_Power')
 * @param {object} config - Solar config object (optional)
 * @returns {number} Monthly bill in INR (rounded to 2 decimal places)
 */
function calculateBill(units, discomKey, config = defaultSolarConfig) {
  const safeUnits = Math.max(0, Number(units) || 0);
  const discom =
    config.tariff.discoms[discomKey] ||
    config.tariff.discoms[config.tariff.defaultDiscom];

  const fixedCharge = discom.fixedChargePerMonth;
  let energyCharge = 0;
  let remainingUnits = safeUnits;
  let previousLimit = 0;

  for (const slab of discom.energySlabs) {
    if (remainingUnits <= 0) break;
    const slabSpan = slab.upToUnits - previousLimit;
    const unitsInSlab = Math.min(remainingUnits, slabSpan);
    energyCharge += unitsInSlab * slab.ratePerUnit;
    remainingUnits -= unitsInSlab;
    previousLimit = slab.upToUnits;
  }

  const fpppaCharge = safeUnits * discom.fpppaPerUnit;
  const subtotal = fixedCharge + energyCharge + fpppaCharge;
  const duty = subtotal * (discom.electricityDutyPercent / 100);
  const total = subtotal + duty;

  return Math.round(total * 100) / 100;
}

/**
 * Invert the monthly bill into consumption units (kWh) using bisection root-finding.
 * bill(billToUnits(x)) matches x within 0.01 INR.
 *
 * @param {number} monthlyBillInr - Total monthly electricity bill in INR
 * @param {string} discomKey - DISCOM name
 * @param {object} config - Solar config object (optional)
 * @returns {number} Monthly electricity units in kWh (rounded to 1 decimal place)
 */
function billToUnits(monthlyBillInr, discomKey, config = defaultSolarConfig) {
  const targetBill = Number(monthlyBillInr) || 0;
  const minBill = calculateBill(0, discomKey, config);
  if (targetBill <= minBill) {
    return 0;
  }

  let low = 0;
  let high = 500;
  while (calculateBill(high, discomKey, config) < targetBill && high < 200000) {
    high *= 2;
  }

  // 40 iterations provides < 0.0001 precision
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const billMid = calculateBill(mid, discomKey, config);
    if (billMid < targetBill) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const result = (low + high) / 2;
  return Math.round(result * 10) / 10;
}

/**
 * Calculate PM Surya Ghar: Muft Bijli Yojana Central Government Subsidy.
 * Slabs: ₹30,000/kW for the first 2 kW, ₹18,000 for the 3rd kW, capped at ₹78,000.
 *
 * @param {number} capacityKw - System capacity in kW
 * @param {object} pmSuryaGharConfig - Central subsidy config
 * @returns {number} Central subsidy amount in INR
 */
function calculateCentralSubsidy(capacityKw, pmSuryaGharConfig = defaultSolarConfig.pmSuryaGhar) {
  if (!capacityKw || capacityKw <= 0) return 0;

  let totalSubsidy = 0;
  let remainingKw = capacityKw;
  let prevSlabKw = 0;

  for (const slab of pmSuryaGharConfig.slabs) {
    if (remainingKw <= 0) break;
    const slabSpan = slab.upToKw - prevSlabKw;
    const kwInSlab = Math.min(remainingKw, slabSpan);
    totalSubsidy += kwInSlab * slab.subsidyPerKw;
    remainingKw -= kwInSlab;
    prevSlabKw = slab.upToKw;
  }

  return Math.min(totalSubsidy, pmSuryaGharConfig.maxSubsidyInr);
}

/**
 * Calculate State Top-up Subsidy (e.g. GEDA for Gujarat).
 *
 * @param {number} capacityKw - System capacity in kW
 * @param {object} stateSubsidyConfig - State subsidy config
 * @param {string} state - Indian state name
 * @returns {number} State subsidy amount in INR
 */
function calculateStateSubsidy(capacityKw, stateSubsidyConfig = defaultSolarConfig.stateSubsidy, state = 'Gujarat') {
  if (!capacityKw || capacityKw <= 0) return 0;
  const isGujarat = String(state).trim().toLowerCase() === 'gujarat';
  if (!isGujarat) return 0;

  let subsidy = capacityKw * (stateSubsidyConfig.topUpPerKw || 0);
  if (stateSubsidyConfig.maxTopUpInr && stateSubsidyConfig.maxTopUpInr > 0) {
    subsidy = Math.min(subsidy, stateSubsidyConfig.maxTopUpInr);
  }
  return subsidy;
}

/**
 * Resolve solar yield (kWh/kWp/year) for a given district and state.
 *
 * @param {string} district - District name
 * @param {string} state - State name
 * @param {object} yieldData - Gujarat yield dataset
 * @param {object} config - Solar config
 * @returns {{ yieldKwhPerKwp: number, verified: boolean, isDefault: boolean, source: string, label?: string }}
 */
function resolveSolarYield(district, state, yieldData = defaultGujaratYield, config = defaultSolarConfig) {
  const isGujarat = !state || String(state).trim().toLowerCase() === 'gujarat';

  if (isGujarat && yieldData?.districts) {
    const normalizedDistrict = district
      ? Object.keys(yieldData.districts).find((k) => k.toLowerCase() === district.trim().toLowerCase())
      : null;

    if (normalizedDistrict && yieldData.districts[normalizedDistrict]?.kwhPerKwpPerYear) {
      return {
        yieldKwhPerKwp: yieldData.districts[normalizedDistrict].kwhPerKwpPerYear,
        verified: true,
        isDefault: false,
        source: yieldData.source,
      };
    }

    // Gujarat district fallback to Gujarat average yield
    return {
      yieldKwhPerKwp: yieldData.defaultYieldKwhPerKwp || config.yield.defaultYieldKwhPerKwp,
      verified: true,
      isDefault: true,
      source: yieldData.source || config.yield.source,
      label: 'Gujarat state average',
    };
  }

  // Non-Gujarat fallback
  const fallback = config.yield.approximateFallback;
  return {
    yieldKwhPerKwp: fallback.value,
    verified: fallback.verified,
    isDefault: true,
    source: fallback.source,
    label: fallback.label,
  };
}

/**
 * Lookup capital cost per kW from size bands.
 *
 * @param {number} capacityKw
 * @param {object} costConfig
 * @returns {number} Cost per kW in INR
 */
function getCostPerKw(capacityKw, costConfig = defaultSolarConfig.cost) {
  for (const band of costConfig.sizeBands) {
    if (capacityKw <= band.maxKw) {
      return band.costPerKw;
    }
  }
  // Return last band if capacity exceeds maximum size band
  return costConfig.sizeBands[costConfig.sizeBands.length - 1].costPerKw;
}

/**
 * Calculate 25-year lifetime metrics (generation, financial savings, and avoided CO2 emissions).
 *
 * @param {number} annualGeneration - Year 1 generation in kWh
 * @param {number} year1Savings - Year 1 financial savings in INR
 * @param {number} netInvestment - Net capital expenditure in INR
 * @param {object} systemConfig - System config
 * @param {object} emissionsConfig - Emissions config
 * @returns {{ lifetimeGrossSavings: number, lifetimeNetSavings: number, lifetimeCo2AvoidedTonnes: number, totalLifetimeGenKwh: number }}
 */
function calculateLifetimeMetrics(
  annualGeneration,
  year1Savings,
  netInvestment,
  systemConfig = defaultSolarConfig.system,
  emissionsConfig = defaultSolarConfig.emissions
) {
  const lifetimeYears = systemConfig.lifetimeYears;
  const degradation = systemConfig.degradationPerYear;
  const escalation = systemConfig.tariffEscalation;
  const gridFactor = emissionsConfig.gridKgPerKwh;

  let totalLifetimeGenKwh = 0;
  let totalLifetimeSavingsInr = 0;

  for (let t = 0; t < lifetimeYears; t++) {
    const degMultiplier = Math.pow(1 - degradation, t);
    const escMultiplier = Math.pow(1 + escalation, t);

    totalLifetimeGenKwh += annualGeneration * degMultiplier;
    totalLifetimeSavingsInr += year1Savings * degMultiplier * escMultiplier;
  }

  const lifetimeGrossSavings = Math.round(totalLifetimeSavingsInr);
  const lifetimeNetSavings = Math.round(totalLifetimeSavingsInr - netInvestment);
  const lifetimeCo2AvoidedTonnes = Math.round(((totalLifetimeGenKwh * gridFactor) / 1000) * 10) / 10;

  return {
    lifetimeGrossSavings,
    lifetimeNetSavings,
    lifetimeCo2AvoidedTonnes,
    totalLifetimeGenKwh: Math.round(totalLifetimeGenKwh),
  };
}

/**
 * Main Solar Rooftop Potential Calculation.
 * Pure function: receives inputs and optional configs, produces complete deterministic assessment.
 *
 * @param {object} inputs
 * @param {number} inputs.roofAreaSqft - Usable rooftop area in sq.ft
 * @param {number} inputs.monthlyBillInr - Average monthly electricity bill in INR
 * @param {string} [inputs.district] - District name (e.g. 'Ahmedabad', 'Rajkot')
 * @param {string} [inputs.state='Gujarat'] - State name
 * @param {string} [inputs.homeType='independent'] - 'independent' | 'apartment' | 'society'
 * @param {object} [options]
 * @param {object} [options.config] - Override solar config
 * @param {object} [options.yieldData] - Override yield dataset
 * @returns {object} Complete solar assessment
 */
function calculateSolarPotential(inputs, options = {}) {
  const config = options.config || defaultSolarConfig;
  const yieldData = options.yieldData || defaultGujaratYield;

  const roofAreaSqft = Number(inputs?.roofAreaSqft) || 0;
  const monthlyBillInr = Number(inputs?.monthlyBillInr) || 0;
  const district = inputs?.district ? String(inputs.district).trim() : 'Ahmedabad';
  const state = inputs?.state ? String(inputs.state).trim() : 'Gujarat';
  const homeType = inputs?.homeType ? String(inputs.homeType).trim().toLowerCase() : 'independent';

  const isGujarat = state.toLowerCase() === 'gujarat';

  // Determine DISCOM
  const discomKey = isGujarat
    ? config.tariff.districtToDiscom[district] || config.tariff.defaultDiscom
    : config.tariff.defaultDiscom;

  // Invert monthly bill to consumption units (kWh)
  const monthlyUnits = Number(inputs?.monthlyKwh || inputs?.monthlyUnits) > 0 ? Number(inputs.monthlyKwh || inputs.monthlyUnits) : billToUnits(monthlyBillInr, discomKey, config);

  // Resolve solar yield
  const yieldInfo = resolveSolarYield(district, state, yieldData, config);
  const derating = Number(inputs?.deratingFactor) > 0 ? Number(inputs.deratingFactor) : 1.0;
  const yearlyYield = yieldInfo.yieldKwhPerKwp * derating;

  // Capacity calculations
  const sqftPerKw = config.system.sqftPerKw;
  const minKw = config.system.minKw;
  const maxKw = config.system.maxKw;
  const roundingStep = config.system.roundingStep;
  const offsetFraction = config.system.offsetFraction;

  const requiredKw = (monthlyUnits * 12 * offsetFraction) / yearlyYield;
  const roofKw = roofAreaSqft / sqftPerKw;

  // Determine limiting factor
  let limitingFactor = 'max';
  if (roofKw <= requiredKw && roofKw <= maxKw) {
    limitingFactor = 'roof';
  } else if (requiredKw <= roofKw && requiredKw <= maxKw) {
    limitingFactor = 'consumption';
  } else {
    limitingFactor = 'max';
  }

  const rawCapacity = Math.min(requiredKw, roofKw, maxKw);
  // Round down to system step (0.5 kW)
  const capacityKw = Math.floor(rawCapacity / roundingStep) * roundingStep;

  // Feasibility check
  if (capacityKw < minKw) {
    let reason = '';
    if (roofKw < minKw) {
      reason = `Roof area (${roofAreaSqft} sq.ft) is too small for a viable ${minKw} kW solar system (requires at least ${minKw * sqftPerKw} sq.ft).`;
    } else if (requiredKw < minKw) {
      reason = `Monthly electricity consumption (${Math.round(monthlyUnits)} kWh) is too low to justify the minimum ${minKw} kW solar system.`;
    } else {
      reason = `Calculated solar capacity is below the minimum viable size of ${minKw} kW.`;
    }

    return {
      feasible: false,
      reason,
      limitingFactor,
      discom: discomKey,
      configVersion: config.configVersion,
      inputs: {
        roofAreaSqft,
        monthlyBillInr,
        district,
        state,
        homeType,
      },
      estimatedMonthlyUnits: monthlyUnits,
      assumptions: buildAssumptions({
        config,
        yieldInfo,
        discomKey,
        state,
        homeType,
        capacityKw: 0,
      }),
      estimatedFlags: {
        cost: !config.cost.verified,
        stateSubsidy: !config.stateSubsidy.verified,
        yield: !yieldInfo.verified,
      },
    };
  }

  // Capital Costs & Subsidies
  const costPerKw = getCostPerKw(capacityKw, config.cost);
  const grossCost = capacityKw * costPerKw;
  const centralSubsidy = inputs?.applySubsidy === false ? 0 : calculateCentralSubsidy(capacityKw, config.pmSuryaGhar);
  const stateSubsidy = calculateStateSubsidy(capacityKw, config.stateSubsidy, state);
  const netInvestment = Math.max(0, grossCost - centralSubsidy - stateSubsidy);

  // Generation & Savings
  const annualGeneration = Math.round(capacityKw * yearlyYield);
  const monthlyGeneration = annualGeneration / 12;

  const currentBill = calculateBill(monthlyUnits, discomKey, config);
  const residualUnits = Math.max(0, monthlyUnits - monthlyGeneration);
  const solarBill = calculateBill(residualUnits, discomKey, config);

  const monthlySavings = currentBill - solarBill;
  const year1Savings = Math.round(12 * monthlySavings);

  // Payback
  let paybackYears = null;
  let verdict = 'not_recommended';

  if (year1Savings > 0) {
    const rawPayback = Math.round((netInvestment / year1Savings) * 10) / 10;
    if (rawPayback <= config.system.lifetimeYears) {
      paybackYears = rawPayback;
      verdict = paybackYears <= 5.0 ? 'highly_recommended' : 'recommended';
    }
  }

  // Lifetime metrics
  const lifetime = calculateLifetimeMetrics(
    annualGeneration,
    year1Savings,
    netInvestment,
    config.system,
    config.emissions
  );

  const assumptions = buildAssumptions({
    config,
    yieldInfo,
    discomKey,
    state,
    homeType,
    capacityKw,
    costPerKw,
  });

  return {
    feasible: true,
    inputs: {
      roofAreaSqft,
      monthlyBillInr,
      district,
      state,
      homeType,
    },
    discom: discomKey,
    configVersion: config.configVersion,
    limitingFactor,
    capacityKw,
    estimatedMonthlyUnits: monthlyUnits,
    annualGenerationKwh: annualGeneration,
    financials: {
      costPerKw,
      grossCostInr: grossCost,
      centralSubsidyInr: centralSubsidy,
      stateSubsidyInr: stateSubsidy,
      totalSubsidyInr: centralSubsidy + stateSubsidy,
      netInvestmentInr: netInvestment,
      year1SavingsInr: year1Savings,
      monthlySavingsInr: Math.round(monthlySavings),
      paybackYears,
      verdict,
      lifetimeGrossSavingsInr: lifetime.lifetimeGrossSavings,
      lifetimeNetSavingsInr: lifetime.lifetimeNetSavings,
    },
    environmental: {
      annualCo2AvoidedTonnes: Math.round(((annualGeneration * config.emissions.gridKgPerKwh) / 1000) * 10) / 10,
      lifetimeCo2AvoidedTonnes: lifetime.lifetimeCo2AvoidedTonnes,
      totalLifetimeGenerationKwh: lifetime.totalLifetimeGenKwh,
      gridEmissionFactor: config.emissions.gridKgPerKwh,
      emissionsUnit: config.emissions.unit,
    },
    estimatedFlags: {
      cost: !config.cost.verified,
      stateSubsidy: !config.stateSubsidy.verified,
      yield: !yieldInfo.verified,
    },
    assumptions,
  };
}

/**
 * Build structured assumptions array for UI transparency and auditing.
 */
function buildAssumptions({ config, yieldInfo, discomKey, state, homeType, capacityKw, costPerKw }) {
  const assumptions = [
    {
      label: 'PM Surya Ghar Central Subsidy',
      value: '₹30,000/kW for first 2 kW, ₹18,000 for 3rd kW (Cap ₹78,000)',
      unit: 'INR',
      source: config.pmSuryaGhar.source,
      asOf: config.pmSuryaGhar.asOf,
      verified: config.pmSuryaGhar.verified,
    },
    {
      label: 'State Subsidy Top-up',
      value: config.stateSubsidy.topUpPerKw,
      unit: 'INR/kW',
      source: config.stateSubsidy.source,
      asOf: config.stateSubsidy.asOf,
      verified: config.stateSubsidy.verified,
      note: config.stateSubsidy.note,
    },
    {
      label: `Residential Tariff (${discomKey})`,
      value: `Fixed ₹${config.tariff.discoms[discomKey]?.fixedChargePerMonth}/mo, FPPPA ₹${config.tariff.discoms[discomKey]?.fpppaPerUnit}/unit, Duty ${config.tariff.discoms[discomKey]?.electricityDutyPercent}%`,
      unit: 'INR/kWh',
      source: config.tariff.source,
      asOf: config.tariff.asOf,
      verified: config.tariff.verified,
    },
    {
      label: 'Solar Capital Cost',
      value: costPerKw || '₹50,000 - ₹60,000/kW',
      unit: 'INR/kW',
      source: config.cost.source,
      asOf: config.cost.asOf,
      verified: config.cost.verified,
      note: config.cost.note,
    },
    {
      label: 'Annual Solar Yield',
      value: yieldInfo.yieldKwhPerKwp,
      unit: 'kWh/kWp/year',
      source: yieldInfo.source,
      asOf: config.yield.asOf,
      verified: yieldInfo.verified,
      labelNote: yieldInfo.label || 'District specific yield',
    },
    {
      label: 'Rooftop Space Requirement',
      value: config.system.sqftPerKw,
      unit: 'sq.ft/kW',
      source: config.system.source,
      asOf: config.system.asOf,
      verified: config.system.verified,
    },
    {
      label: 'Annual Panel Degradation',
      value: config.system.degradationPerYear * 100,
      unit: '% per year',
      source: config.system.source,
      asOf: config.system.asOf,
      verified: config.system.verified,
    },
    {
      label: 'System Lifetime',
      value: config.system.lifetimeYears,
      unit: 'years',
      source: config.system.source,
      asOf: config.system.asOf,
      verified: config.system.verified,
    },
    {
      label: 'Grid CO2 Emission Factor',
      value: config.emissions.gridKgPerKwh,
      unit: config.emissions.unit,
      source: config.emissions.source,
      asOf: config.emissions.asOf,
      verified: config.emissions.verified,
    },
  ];

  if (homeType === 'apartment' || homeType === 'society') {
    assumptions.push({
      label: 'Apartment Rooftop Access',
      value: 'Requires Society / RWA NOC',
      unit: 'compliance',
      source: 'Residential Apartment By-laws / GEDA Rooftop Guidelines',
      asOf: '2024-01-01',
      verified: true,
      note: 'Apartment solar installation requires common roof rights and No Objection Certificate (NOC) from the Resident Welfare Association (RWA) or society committee.',
    });
  }

  if (String(state).toLowerCase() !== 'gujarat') {
    assumptions.push({
      label: 'Non-Gujarat Location Notice',
      value: `${state} (Out-of-state)`,
      unit: 'jurisdiction',
      source: 'State Solar Policy Framework',
      asOf: '2024-01-01',
      verified: false,
      note: 'Central PM Surya Ghar subsidy applies nationwide, but state top-up and local DISCOM tariffs are calibrated for Gujarat. National average solar yield was applied.',
    });
  }

  return assumptions;
}

module.exports = {
  calculateBill,
  billToUnits,
  calculateCentralSubsidy,
  calculateStateSubsidy,
  resolveSolarYield,
  getCostPerKw,
  calculateLifetimeMetrics,
  calculateSolarPotential,
  defaultSolarConfig,
};
