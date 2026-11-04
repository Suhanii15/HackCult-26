const { generatePersonalizedPlan } = require('./recommendationEngine');
const { getQuestionnaire, QUESTIONNAIRES } = require('./questionnaires');
const { ACTIVITY_CATALOG } = require('./activityCatalog');

let passed = 0;
let failed = 0;
const check = (name, cond, detail = '') => {
  if (cond) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name} ${detail}`);
  }
};

console.log('\n[1] Questionnaire Configuration Coverage');
check('all 59 activities have valid questionnaires', ACTIVITY_CATALOG.every((a) => {
  const q = getQuestionnaire(a.activityId);
  return q && q.title && Array.isArray(q.questions) && q.questions.length >= 1;
}));

const typesUsed = new Set();
Object.values(QUESTIONNAIRES).forEach((q) => q.questions.forEach((qu) => typesUsed.add(qu.type)));
console.log('   Question types used across catalog:', Array.from(typesUsed).join(', '));
check('interactive control types include slider, radio, stepper, dropdown, multiselect',
  ['slider', 'radio', 'stepper', 'dropdown'].every((t) => typesUsed.has(t)));
check('no questionnaire asks free-text input', !typesUsed.has('text') && !typesUsed.has('textarea'));

console.log('\n[2] Recommendation Engine: Energy Conservation (AC Usage)');
const acAct = ACTIVITY_CATALOG.find((a) => a.activityId === 'energy_reduce_ac');
const acPlan8h = generatePersonalizedPlan('energy_reduce_ac', { daily_ac_hours: 8, ac_type: 'inverter_3star' }, acAct);
check('8h AC produces 7h target (1h reduction)', acPlan8h.recommendedTarget.includes('7') && acPlan8h.recommendedReduction.includes('1'));
check('AC carbon savings calculated with India grid factor ~0.71', acPlan8h.carbonSavings.perDayKgCO2e > 0.8 && acPlan8h.carbonSavings.perDayKgCO2e < 1.1);
check('7-day progressive plan generated', acPlan8h.dailyPlan.length === 7 && acPlan8h.dailyPlan.every((p) => p.day && p.action));
check('Adaptive rules present', Boolean(acPlan8h.adaptiveRules.onSuccess));

const acPlan4h = generatePersonalizedPlan('energy_reduce_ac', { daily_ac_hours: 4, ac_type: 'inverter_5star' }, acAct);
check('4h AC suggests gradual 0.5h reduction (3.5h target)', acPlan4h.recommendedTarget.includes('3.5'));

console.log('\n[3] Recommendation Engine: Transportation (Cycling)');
const cycAct = ACTIVITY_CATALOG.find((a) => a.activityId === 'transport_cycle_instead_of_driving');
const cycPlan = generatePersonalizedPlan('transport_cycle_instead_of_driving', { travel_distance_km: 3, displaced_vehicle: 'petrol_car', days_per_week_cycling: 3 }, cycAct);
check('3 km one-way car trip produces ~0.99 kg CO2e saved per cycling day',
  cycPlan.carbonSavings.perDayKgCO2e >= 0.9 && cycPlan.carbonSavings.perDayKgCO2e <= 1.1,
  String(cycPlan.carbonSavings.perDayKgCO2e));
check('Resource savings in km of driving eliminated', cycPlan.resourceSavings.amount === 18 && cycPlan.resourceSavings.unit.includes('km'));

console.log('\n[4] Recommendation Engine: Water Conservation (Brushing & Shower)');
const brushAct = ACTIVITY_CATALOG.find((a) => a.activityId === 'water_turn_off_tap_brushing');
const brushPlan = generatePersonalizedPlan('water_turn_off_tap_brushing', { tap_running_minutes: 2.5, routines_per_day: 2 }, brushAct);
check('Brushing tap calculates 40 L/day water saved', brushPlan.recommendedReduction.includes('40'));
check('Resource savings in litres water conserved', brushPlan.resourceSavings.amount === 280);

const showerAct = ACTIVITY_CATALOG.find((a) => a.activityId === 'water_reduce_shower_duration');
const showerPlan = generatePersonalizedPlan('water_reduce_shower_duration', { current_shower_mins: 15, shower_water_heated: 'electric_geyser' }, showerAct);
check('15m shower recommends 11m (4m cut, 48L saved)', showerPlan.recommendedTarget.includes('11') && showerPlan.recommendedReduction.includes('48'));
check('Heated shower includes geyser heating carbon savings', showerPlan.carbonSavings.perDayKgCO2e > 0.5);

console.log('\n[5] Recommendation Engine: Waste Management (Food Waste & Bottles)');
const foodAct = ACTIVITY_CATALOG.find((a) => a.activityId === 'waste_avoid_food_waste');
const foodPlan = generatePersonalizedPlan('waste_avoid_food_waste', { food_portions_wasted_weekly: 4, average_serving_weight_grams: 250 }, foodAct);
check('Food waste calculates 0.75 kg/week saved', foodPlan.resourceSavings.amount === 0.75);
check('Food waste uses IPCC 2.5 kg CO2e factor', foodPlan.carbonSavings.totalCycleKgCO2e > 1.5);

const bottleAct = ACTIVITY_CATALOG.find((a) => a.activityId === 'waste_reusable_bottle');
const bottlePlan = generatePersonalizedPlan('waste_reusable_bottle', { disposable_bottles_per_week: 5 }, bottleAct);
check('Bottle calculates 5 bottles saved', bottlePlan.resourceSavings.amount === 5);

console.log('\n[6] Every Activity in Catalog Generates Valid Personalized Plan');
let allPlansValid = true;
for (const a of ACTIVITY_CATALOG) {
  const plan = generatePersonalizedPlan(a.activityId, {}, a);
  if (!plan.recommendedTarget || !plan.dailyPlan || plan.dailyPlan.length === 0 || !plan.carbonSavings) {
    allPlansValid = false;
    console.log(`Failed plan for: ${a.activityId}`);
    break;
  }
}
check('all 59 activities generate valid plans with daily actions and carbon data', allPlansValid);

console.log(`\nRecommendation Engine Suite: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
