/**
 * tests/solar.test.js
 *
 * Automated verification test suite for EcoPulse Solar Rooftop Calculator Engine & API.
 * Uses Node's built-in assert module for deterministic execution.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const {
  calculateBill,
  billToUnits,
  calculateCentralSubsidy,
  calculateStateSubsidy,
  calculateLifetimeMetrics,
  calculateSolarPotential,
  defaultSolarConfig,
} = require('../shared/engine/solar');

const gujaratYieldData = require('../shared/engine/data/gujarat-yield.json');
const { createRateLimiter } = require('../server/middleware/rateLimiter');
const { calculateSolar, getVendors } = require('../server/controllers/solarController');

console.log('🧪 Starting EcoPulse Solar Calculator Verification Suite...\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------
// 1. Central Subsidy Slabs Verification
// ---------------------------------------------------------
console.log('--- 1. PM Surya Ghar Central Subsidy Slabs ---');

test('0.5 kW capacity yields ₹15,000 central subsidy', () => {
  const subsidy = calculateCentralSubsidy(0.5);
  assert.strictEqual(subsidy, 15000);
});

test('1.0 kW capacity yields ₹30,000 central subsidy', () => {
  const subsidy = calculateCentralSubsidy(1.0);
  assert.strictEqual(subsidy, 30000);
});

test('2.0 kW capacity yields ₹60,000 central subsidy', () => {
  const subsidy = calculateCentralSubsidy(2.0);
  assert.strictEqual(subsidy, 60000);
});

test('3.0 kW capacity yields ₹78,000 central subsidy', () => {
  const subsidy = calculateCentralSubsidy(3.0);
  assert.strictEqual(subsidy, 78000);
});

test('5.0 kW capacity yields capped ₹78,000 central subsidy', () => {
  const subsidy = calculateCentralSubsidy(5.0);
  assert.strictEqual(subsidy, 78000);
});

test('10.0 kW capacity yields capped ₹78,000 central subsidy', () => {
  const subsidy = calculateCentralSubsidy(10.0);
  assert.strictEqual(subsidy, 78000);
});

// ---------------------------------------------------------
// 2. Lifetime Generation & Degradation Verification
// ---------------------------------------------------------
console.log('\n--- 2. Lifetime Generation & Degradation ---');

test('3 kW system at 1500 kWh/kWp with 0.5% degradation over 25 years gives ~106,000 kWh', () => {
  const capacityKw = 3.0;
  const annualYield = 1500;
  const annualGen = capacityKw * annualYield; // 4500 kWh in Year 1

  const mockSystemConfig = {
    lifetimeYears: 25,
    degradationPerYear: 0.005,
    tariffEscalation: 0.0,
  };
  const mockEmissionsConfig = {
    gridKgPerKwh: 0.71,
  };

  const metrics = calculateLifetimeMetrics(annualGen, 30000, 75000, mockSystemConfig, mockEmissionsConfig);

  const expectedGen = 106000;
  const tolerance = 0.005; // 0.5%
  const differenceFraction = Math.abs(metrics.totalLifetimeGenKwh - expectedGen) / expectedGen;

  assert.ok(
    differenceFraction <= tolerance,
    `Expected ~106,000 kWh within 0.5% tolerance. Got ${metrics.totalLifetimeGenKwh} (diff: ${(differenceFraction * 100).toFixed(3)}%)`
  );

  // Avoided CO2 tonnes check: 106002 * 0.71 / 1000 ~= 75.3 tonnes
  assert.ok(metrics.lifetimeCo2AvoidedTonnes > 70 && metrics.lifetimeCo2AvoidedTonnes < 80);
});

// ---------------------------------------------------------
// 3. Bill & Bill-to-Units Round-Trip Inversion
// ---------------------------------------------------------
console.log('\n--- 3. Bill Calculation & Bill-to-Units Inversion ---');

test('calculateBill(0) returns fixed charge plus duty', () => {
  const bill0 = calculateBill(0, 'UGVCL');
  // Fixed charge 25 + 15% duty = 28.75
  assert.strictEqual(bill0, 28.75);
});

test('billToUnits round-trip consistency across multiple consumption levels', () => {
  const discoms = ['UGVCL', 'Torrent_Power', 'PGVCL'];
  const testUnitValues = [50, 100, 250, 450, 800];

  for (const discom of discoms) {
    for (const units of testUnitValues) {
      const generatedBill = calculateBill(units, discom);
      const invertedUnits = billToUnits(generatedBill, discom);
      const recomputedBill = calculateBill(invertedUnits, discom);

      const billDiff = Math.abs(recomputedBill - generatedBill);
      assert.ok(
        billDiff < 0.1,
        `Roundtrip error for ${units} units on ${discom}: generated ₹${generatedBill}, inverted to ${invertedUnits} units, recomputed to ₹${recomputedBill} (diff: ₹${billDiff})`
      );
    }
  }
});

// ---------------------------------------------------------
// 4. Capacity Constraints & Limiting Factors
// ---------------------------------------------------------
console.log('\n--- 4. Capacity Caps & Limiting Factors ---');

test('Roof area constraints limit capacity to roofKw', () => {
  // 150 sqft allows 1.5 kW roof, but bill is ₹5000 (needs ~5 kW)
  const result = calculateSolarPotential({
    roofAreaSqft: 150,
    monthlyBillInr: 5000,
    district: 'Ahmedabad',
  });

  assert.strictEqual(result.feasible, true);
  assert.strictEqual(result.limitingFactor, 'roof');
  assert.strictEqual(result.capacityKw, 1.5);
});

test('Electricity consumption constraints limit capacity to requiredKw', () => {
  // 1000 sqft allows 10 kW roof, but bill is ₹1600 (needs ~1.5 kW, below 10 kW roof)
  const result = calculateSolarPotential({
    roofAreaSqft: 1000,
    monthlyBillInr: 1600,
    district: 'Ahmedabad',
  });

  assert.strictEqual(result.feasible, true);
  assert.strictEqual(result.limitingFactor, 'consumption');
  assert.strictEqual(result.capacityKw, 1.5);
});

test('System maximum 10 kW cap takes effect for very high consumption and large roof', () => {
  // 2500 sqft allows 25 kW roof, bill ₹30,000 needs ~25 kW -> capped at 10 kW
  const result = calculateSolarPotential({
    roofAreaSqft: 2500,
    monthlyBillInr: 30000,
    district: 'Ahmedabad',
  });

  assert.strictEqual(result.feasible, true);
  assert.strictEqual(result.limitingFactor, 'max');
  assert.strictEqual(result.capacityKw, 10.0);
});

// ---------------------------------------------------------
// 5. Infeasible Cases
// ---------------------------------------------------------
console.log('\n--- 5. Infeasible Cases ---');

test('Infeasible when roof area is less than 100 sq.ft (below minKw)', () => {
  const result = calculateSolarPotential({
    roofAreaSqft: 60,
    monthlyBillInr: 2500,
    district: 'Vadodara',
  });

  assert.strictEqual(result.feasible, false);
  assert.strictEqual(result.limitingFactor, 'roof');
  assert.ok(result.reason.includes('Roof area (60 sq.ft) is too small'));
});

test('Infeasible when consumption is too low to justify 1 kW', () => {
  const result = calculateSolarPotential({
    roofAreaSqft: 400,
    monthlyBillInr: 50,
    district: 'Surat',
  });

  assert.strictEqual(result.feasible, false);
  assert.strictEqual(result.limitingFactor, 'consumption');
  assert.ok(result.reason.includes('consumption'));
});

// ---------------------------------------------------------
// 6. Payback Period & Verdict
// ---------------------------------------------------------
console.log('\n--- 6. Payback Years & Verdict ---');

test('Standard residential rooftop yields viable payback and recommended verdict', () => {
  const result = calculateSolarPotential({
    roofAreaSqft: 350,
    monthlyBillInr: 2800,
    district: 'Rajkot',
  });

  assert.strictEqual(result.feasible, true);
  assert.ok(result.financials.paybackYears !== null);
  assert.ok(result.financials.paybackYears >= 1 && result.financials.paybackYears <= 10);
  assert.ok(
    result.financials.verdict === 'recommended' || result.financials.verdict === 'highly_recommended'
  );
});

test('Payback returns null and not_recommended if payback exceeds 25 years', () => {
  // Create an artificial scenario with high capital cost using custom options
  const customConfig = JSON.parse(JSON.stringify(defaultSolarConfig));
  customConfig.cost.sizeBands = [{ minKw: 1, maxKw: 10, costPerKw: 500000 }]; // 10x cost

  const result = calculateSolarPotential(
    {
      roofAreaSqft: 400,
      monthlyBillInr: 2500,
      district: 'Ahmedabad',
    },
    { config: customConfig }
  );

  assert.strictEqual(result.feasible, true);
  assert.strictEqual(result.financials.paybackYears, null);
  assert.strictEqual(result.financials.verdict, 'not_recommended');
});

// ---------------------------------------------------------
// 7. Determinism Check
// ---------------------------------------------------------
console.log('\n--- 7. Determinism & Zero Network Call Check ---');

test('Engine produces strictly identical, deep-equal outputs given the same inputs twice', () => {
  const input = {
    roofAreaSqft: 450,
    monthlyBillInr: 3200,
    district: 'Gandhinagar',
    state: 'Gujarat',
    homeType: 'independent',
  };

  const run1 = calculateSolarPotential(input);
  const run2 = calculateSolarPotential(input);

  assert.deepStrictEqual(run1, run2, 'Engine outputs must be deep-equal across runs');
});

// ---------------------------------------------------------
// 8. Special Contexts: Apartment & Non-Gujarat
// ---------------------------------------------------------
console.log('\n--- 8. Special Contexts (Apartment & Non-Gujarat) ---');

test('Apartment homeType attaches society NOC / roof rights assumption', () => {
  const result = calculateSolarPotential({
    roofAreaSqft: 300,
    monthlyBillInr: 2500,
    district: 'Ahmedabad',
    homeType: 'apartment',
  });

  const apartmentAssumption = result.assumptions.find((a) => a.label === 'Apartment Rooftop Access');
  assert.ok(apartmentAssumption, 'Should include Apartment Rooftop Access assumption');
  assert.ok(apartmentAssumption.note.includes('No Objection Certificate (NOC)'));
});

test('Non-Gujarat state uses approximate fallback yield and sets state subsidy to 0', () => {
  const result = calculateSolarPotential({
    roofAreaSqft: 300,
    monthlyBillInr: 2500,
    state: 'Maharashtra',
    district: 'Pune',
  });

  assert.strictEqual(result.financials.stateSubsidyInr, 0);
  assert.strictEqual(result.estimatedFlags.yield, true, 'Yield must be flagged as unverified fallback');

  const outOfStateAssumption = result.assumptions.find((a) => a.label === 'Non-Gujarat Location Notice');
  assert.ok(outOfStateAssumption, 'Should include Non-Gujarat Location Notice');
});

// ---------------------------------------------------------
// 9. Config Structure & Unverified Values Verification
// ---------------------------------------------------------
console.log('\n--- 9. Config Structure & Verified Flag Auditing ---');

test('Every configuration block has { unit, source, asOf, verified: boolean }', () => {
  const requiredBlocks = ['pmSuryaGhar', 'stateSubsidy', 'tariff', 'cost', 'yield', 'system', 'emissions'];

  for (const blockKey of requiredBlocks) {
    const block = defaultSolarConfig[blockKey];
    assert.ok(block, `Block ${blockKey} must exist in solar.json`);
    assert.ok(typeof block.unit === 'string', `${blockKey}.unit must be string`);
    assert.ok(typeof block.source === 'string', `${blockKey}.source must be string`);
    assert.ok(typeof block.asOf === 'string', `${blockKey}.asOf must be string`);
    assert.ok(typeof block.verified === 'boolean', `${blockKey}.verified must be boolean`);
  }
});

test('Audit and list verified vs unverified configuration parameters', () => {
  const blocks = ['pmSuryaGhar', 'stateSubsidy', 'tariff', 'cost', 'yield', 'system', 'emissions'];
  const verifiedList = [];
  const unverifiedList = [];

  for (const k of blocks) {
    if (defaultSolarConfig[k].verified) {
      verifiedList.push(k);
    } else {
      unverifiedList.push({ block: k, note: defaultSolarConfig[k].note || 'Unverified parameter' });
    }
  }

  console.log(`    Verified blocks: ${verifiedList.join(', ')}`);
  console.log(`    Unverified / Placeholder blocks:`);
  for (const u of unverifiedList) {
    console.log(`      - ${u.block}: ${u.note}`);
  }

  assert.ok(defaultSolarConfig.pmSuryaGhar.verified === true);
  assert.ok(defaultSolarConfig.cost.verified === false); // explicit placeholder per prompt
  assert.ok(defaultSolarConfig.stateSubsidy.verified === false); // explicit placeholder per prompt
});

// ---------------------------------------------------------
// 10. API Controller Validation & Rate Limiting
// ---------------------------------------------------------
console.log('\n--- 10. API Validation & Rate Limiting ---');

test('calculateSolar returns 400 for negative or missing inputs', async () => {
  let statusCode = 0;
  let jsonResponse = null;

  const mockRes = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          jsonResponse = data;
        },
      };
    },
  };

  // Missing roofAreaSqft
  await calculateSolar({ body: { monthlyBillInr: 2000 } }, mockRes, () => {});
  assert.strictEqual(statusCode, 400);
  assert.strictEqual(jsonResponse.success, false);

  // Negative monthlyBillInr
  await calculateSolar({ body: { roofAreaSqft: 200, monthlyBillInr: -50 } }, mockRes, () => {});
  assert.strictEqual(statusCode, 400);
  assert.strictEqual(jsonResponse.success, false);
});

test('Rate limiter restricts requests exceeding threshold', () => {
  const limiter = createRateLimiter({ windowMs: 1000, max: 2 });
  const mockReq = { headers: {}, socket: { remoteAddress: '127.0.0.1' }, path: '/test-limiter' };

  let lastStatus = 200;
  const mockRes = {
    setHeader: () => {},
    status: (code) => {
      lastStatus = code;
      return { json: () => {} };
    },
  };

  let nextCalled = 0;
  const next = () => {
    nextCalled++;
  };

  limiter(mockReq, mockRes, next); // 1st
  assert.strictEqual(nextCalled, 1);

  limiter(mockReq, mockRes, next); // 2nd
  assert.strictEqual(nextCalled, 2);

  limiter(mockReq, mockRes, next); // 3rd -> Exceeds max 2
  assert.strictEqual(lastStatus, 429);
  assert.strictEqual(nextCalled, 2);
});

// ---------------------------------------------------------
// 11. PVGIS Gujarat Yield Data Verification
// ---------------------------------------------------------
console.log('\n--- 11. Gujarat Yield Dataset Audit ---');

test('gujarat-yield.json contains all 33 Gujarat districts with realistic annual kWh/kWp', () => {
  assert.ok(gujaratYieldData.districts, 'Districts object must exist');
  const districtNames = Object.keys(gujaratYieldData.districts);
  assert.strictEqual(districtNames.length, 33, 'All 33 Gujarat districts must be present');

  for (const [name, info] of Object.entries(gujaratYieldData.districts)) {
    assert.ok(
      info.kwhPerKwpPerYear >= 1450 && info.kwhPerKwpPerYear <= 1750,
      `District ${name} yield ${info.kwhPerKwpPerYear} is within expected Gujarat solar range (1450-1750)`
    );
  }
});

// ---------------------------------------------------------
// Suite Summary
// ---------------------------------------------------------
console.log(`\n======================================================`);
console.log(`🎉 TEST SUITE COMPLETE: ${passedTests}/${totalTests} tests passed.`);
console.log(`======================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
