const config = require('./config.json');

/**
 * Convert electricity bill in INR to estimated kWh using Gujarat residential slab tariffs
 * @param {number} billInINR
 * @returns {{ kwh: number, assumption: string }}
 */
function billInrToKwh(billInINR) {
  if (!billInINR || billInINR <= 0) return { kwh: 0, assumption: '' };
  // Using effective average rate per kWh (energy charge + FPPPA + fixed distribution amortized)
  const effectiveRate = config.tariffs.effectiveAverageRatePerKwh || 6.80;
  const estimatedKwh = Math.round((billInINR / effectiveRate) * 10) / 10;
  return {
    kwh: estimatedKwh,
    assumption: `Estimated from ₹${billInINR} using Gujarat average domestic tariff of ₹${effectiveRate}/kWh`
  };
}

/**
 * Estimate electricity kWh from appliance list
 * @param {Array<{ key: string, count: number, hoursPerDay: number, watts?: number }>} appliances
 * @param {number} roomShareCount - default 1
 * @returns {number} monthly kWh
 */
function estimateApplianceKwh(appliances = [], roomShareCount = 1) {
  if (!Array.isArray(appliances) || appliances.length === 0) return 0;
  const divisor = Math.max(1, roomShareCount || 1);

  let totalMonthlyKwh = 0;
  for (const app of appliances) {
    const appDef = config.appliances[app.key];
    if (!appDef) continue;

    const count = app.count || 1;
    const hours = typeof app.hoursPerDay === 'number' ? app.hoursPerDay : (appDef.defaultHours || 0);

    let dailyKwh = 0;
    if (appDef.kwhPerDay) {
      dailyKwh = appDef.kwhPerDay * count;
    } else {
      const watts = app.watts || appDef.watts || 0;
      dailyKwh = (watts * hours * count) / 1000;
    }

    // Shared appliances (fan, AC, lights) divided by room share
    const isShared = ['ceiling_fan', 'ac', 'led_lights'].includes(app.key);
    const itemDailyKwh = isShared ? (dailyKwh / divisor) : dailyKwh;
    totalMonthlyKwh += itemDailyKwh * 30;
  }

  return Math.round(totalMonthlyKwh * 10) / 10;
}

/**
 * Pure footprint calculation function
 * @param {Object} input
 * @returns {Object} Footprint output conforming to Section 9
 */
function calculateFootprint(input = {}) {
  const mode = input.mode || 'household'; // 'household' | 'individual'
  const members = mode === 'individual' ? 1 : Math.max(1, input.members || 1);
  const factorVersion = config.factorVersion;
  const computedAt = new Date().toISOString();

  const categories = {
    electricity: { kg: null, status: 'unavailable', assumptions: [] },
    cooking: { kg: null, status: 'unavailable', assumptions: [] },
    transport: { kg: null, status: 'unavailable', assumptions: [] }
  };

  // 1. ELECTRICITY
  const elec = input.electricity;
  if (elec) {
    let gridKwh = null;
    let status = 'unavailable';
    const assumptions = [];

    if (elec.sourceType === 'kwh' && typeof elec.kwh === 'number') {
      gridKwh = elec.kwh;
      status = 'measured';
    } else if (elec.sourceType === 'amount' && typeof elec.amountInINR === 'number') {
      const res = billInrToKwh(elec.amountInINR);
      gridKwh = res.kwh;
      status = 'estimated';
      assumptions.push(res.assumption);
    } else if (elec.sourceType === 'appliances' || elec.sourceType === 'not_sure') {
      if (Array.isArray(elec.appliances) && elec.appliances.length > 0) {
        gridKwh = estimateApplianceKwh(elec.appliances, input.roomShareCount || 1);
        status = 'estimated';
        assumptions.push(`Calculated from reported appliance daily usage divided by ${input.roomShareCount || 1} room share`);
      }
    }

    if (typeof gridKwh === 'number') {
      // Deduct rooftop solar export if given
      let netGridKwh = gridKwh;
      if (elec.solar && elec.solar.hasSolar) {
        const exportedKwh = elec.solar.exportedKwh || 0;
        netGridKwh = Math.max(0, gridKwh - exportedKwh);
        if (exportedKwh > 0) {
          assumptions.push(`Offset by ${exportedKwh} kWh exported rooftop solar`);
        }
      }

      const kg = Math.round(netGridKwh * config.electricity.gridKgPerKwh * 10) / 10;
      categories.electricity = { kg, status, assumptions, kwh: netGridKwh };
    }
  }

  // 2. COOKING
  const cooking = input.cooking;
  if (cooking) {
    if (cooking.noCookingFuel) {
      categories.cooking = { kg: 0, status: 'reported', assumptions: ['Explicitly reported no cooking fuel used'] };
    } else if (Array.isArray(cooking.fuels) && cooking.fuels.length > 0) {
      let totalCookingKg = 0;
      let hasReported = false;
      const assumptions = [];

      for (const fuel of cooking.fuels) {
        if (fuel.type === 'lpg') {
          const cylinderSizeKg = fuel.cylinderSizeKg || config.cooking.standardCylinderKg;
          let cylindersPerMonth = 0;

          if (typeof fuel.weeksPerCylinder === 'number' && fuel.weeksPerCylinder > 0) {
            cylindersPerMonth = 30 / (fuel.weeksPerCylinder * 7);
            assumptions.push(`1 cylinder every ${fuel.weeksPerCylinder} weeks (${cylindersPerMonth.toFixed(2)} cylinders/mo)`);
          } else if (typeof fuel.cylindersPerMonth === 'number') {
            cylindersPerMonth = fuel.cylindersPerMonth;
          }

          const lpgKg = cylindersPerMonth * cylinderSizeKg * config.cooking.lpgKgCo2PerKg;
          totalCookingKg += lpgKg;
          hasReported = true;
        } else if (fuel.type === 'png') {
          const scm = fuel.scmPerMonth || 0;
          const pngKg = scm * config.cooking.pngKgCo2PerScm;
          totalCookingKg += pngKg;
          assumptions.push(`${scm} SCM PNG piped gas/month`);
          hasReported = true;
        } else if (fuel.type === 'induction') {
          // Rule: Electric cooking is never added separately (already in electricity bill)
          assumptions.push('Electric/Induction cooking accounted for in electricity bill (0 additional CO₂e)');
          hasReported = true;
        } else if (fuel.type === 'other') {
          assumptions.push('Other cooking fuel not included in footprint baseline');
        }
      }

      if (hasReported) {
        categories.cooking = {
          kg: Math.round(totalCookingKg * 10) / 10,
          status: 'reported',
          assumptions
        };
      }
    }
  }

  // 3. TRANSPORT
  const transport = input.transport;
  if (transport) {
    if (transport.noRegularTravel) {
      categories.transport = { kg: 0, status: 'reported', assumptions: ['Explicitly reported no regular travel'] };
    } else if (Array.isArray(transport.trips) && transport.trips.length > 0) {
      let totalTransportKg = 0;
      const assumptions = [];

      for (const trip of transport.trips) {
        const factor = config.transport.perKm[trip.mode] !== undefined ? config.transport.perKm[trip.mode] : 0.05;
        const kmPerDay = trip.kmPerDay || (trip.oneWayKm ? trip.oneWayKm * 2 : 0);
        const daysPerMonth = trip.daysPerMonth || (trip.daysPerWeek ? trip.daysPerWeek * 4.3 : 22);

        const tripKg = kmPerDay * daysPerMonth * factor;
        totalTransportKg += tripKg;
      }

      if (transport.walkAlso) assumptions.push('Includes walking (0 emissions)');
      if (transport.cycleAlso) assumptions.push('Includes cycling (0 emissions)');

      categories.transport = {
        kg: Math.round(totalTransportKg * 10) / 10,
        status: 'reported',
        assumptions
      };
    }
  }

  // Determine coverage and partial state
  const isPartial =
    categories.electricity.kg === null ||
    categories.cooking.kg === null ||
    categories.transport.kg === null;

  let totalKg = 0;
  if (categories.electricity.kg !== null) totalKg += categories.electricity.kg;
  if (categories.cooking.kg !== null) totalKg += categories.cooking.kg;
  if (categories.transport.kg !== null) totalKg += categories.transport.kg;

  totalKg = Math.round(totalKg * 10) / 10;
  const perPerson = Math.round((totalKg / members) * 10) / 10;

  return {
    total: totalKg,
    perPerson,
    partial: isPartial,
    categories,
    factorVersion,
    computedAt
  };
}

module.exports = {
  calculateFootprint,
  billInrToKwh,
  estimateApplianceKwh,
  config
};
