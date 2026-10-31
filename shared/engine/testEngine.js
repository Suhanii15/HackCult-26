const assert = require('assert');
const { calculateFootprint, estimateApplianceKwh } = require('./footprintEngine');

console.log('--- RUNNING FOOTPRINT ENGINE ACCEPTANCE CRITERIA TESTS ---');

// Test 1: 150 kWh * 0.71 ≈ 106.5 kg
const t1 = calculateFootprint({
  mode: 'household',
  members: 1,
  electricity: { sourceType: 'kwh', kwh: 150 }
});
console.log('Test 1 (150 kWh):', t1.categories.electricity.kg, 'Expected ≈ 106.5');
assert.strictEqual(t1.categories.electricity.kg, 106.5);
assert.strictEqual(t1.partial, true); // missing cooking and transport

// Test 2: One 14.2 kg LPG cylinder per month ≈ 42.3 kg
const t2 = calculateFootprint({
  mode: 'household',
  members: 1,
  cooking: {
    fuels: [{ type: 'lpg', cylindersPerMonth: 1, cylinderSizeKg: 14.2 }]
  }
});
console.log('Test 2 (1 cylinder 14.2kg):', t2.categories.cooking.kg, 'Expected ≈ 42.3');
assert.strictEqual(t2.categories.cooking.kg, 42.3);

// Test 3: Cylinder lasting 6 weeks ≈ 0.71 cylinders/month ≈ 30.2 kg
const t3 = calculateFootprint({
  mode: 'household',
  members: 1,
  cooking: {
    fuels: [{ type: 'lpg', weeksPerCylinder: 6, cylinderSizeKg: 14.2 }]
  }
});
console.log('Test 3 (6 weeks per cylinder):', t3.categories.cooking.kg, 'Expected ≈ 30.2');
assert(Math.abs(t3.categories.cooking.kg - 30.2) <= 0.2);

// Test 4: Missing transport gives unavailable and partial: true
const t4 = calculateFootprint({
  mode: 'household',
  members: 2,
  electricity: { sourceType: 'kwh', kwh: 100 },
  cooking: { fuels: [{ type: 'lpg', cylindersPerMonth: 1 }] }
});
console.log('Test 4 (Missing transport): status =', t4.categories.transport.status, 'partial =', t4.partial);
assert.strictEqual(t4.categories.transport.status, 'unavailable');
assert.strictEqual(t4.categories.transport.kg, null);
assert.strictEqual(t4.partial, true);

// Test 5: Electric cooking adds 0
const t5 = calculateFootprint({
  mode: 'household',
  members: 2,
  cooking: {
    fuels: [{ type: 'induction' }]
  }
});
console.log('Test 5 (Induction cooking): kg =', t5.categories.cooking.kg);
assert.strictEqual(t5.categories.cooking.kg, 0);

// Test 6: Room share 3 divides the AC estimate by 3
const singleAc = estimateApplianceKwh([{ key: 'ac', count: 1, hoursPerDay: 6 }], 1);
const sharedAc = estimateApplianceKwh([{ key: 'ac', count: 1, hoursPerDay: 6 }], 3);
console.log('Test 6 (AC Room Share 3): single =', singleAc, 'shared =', sharedAc);
assert.strictEqual(Math.round(singleAc / 3), Math.round(sharedAc));

console.log('✅ ALL ENGINE ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
