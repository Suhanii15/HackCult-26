/**
 * Mission LiFE - shared activity catalogue (single source of truth).
 *
 * Used by the server seed script/API and (via `npm run sync:engine`) by the client's
 * offline fallback. Carbon numbers are DERIVED from the factors below - they are
 * estimates, never measurements, and every activity states its own assumptions.
 */
const cfg = require('../engine/config.json');

const GRID = cfg.electricity.gridKgPerKwh; // 0.71 kg CO2e/kWh - CEA CO2 Baseline Database (India)
const KM = cfg.transport.perKm; // kg CO2e per passenger-km (ARAI / India GHG Program)

// Extra emission / resource factors (all approximate, flagged as estimates in the UI).
const F = {
  waterSupplyKwhPerL: 0.0005, // ~0.5 kWh/m3 urban supply, pumping & treatment (typical range 0.3-1.0)
  hotWaterKwhPerL: 0.029, // heating 1 L by 25 C with a resistive geyser: 4.186 kJ/kg.K x 25 K / 3600
  petrolKgPerL: 2.31, // IPCC default combustion factor for petrol
  idleLitresPerHour: 0.6, // typical petrol hatchback/two-wheeler engine idling
  foodKgPerKg: 2.0, // conservative life-cycle estimate for edible food (published range ~1.5-3+ kg CO2e/kg)
  organicLandfillKgPerKg: 0.5, // methane from organics in landfill/dump (order of magnitude, EPA WARM / IPCC)
  petBottleKg: 0.08, // 500 ml PET bottle, cradle-to-grave
  plasticBagKg: 0.03, // single-use HDPE carry bag
  disposableCupKg: 0.1, // plastic-lined paper cup
  paperRecycleKgPerKg: 1.0, // conservative avoided emissions vs virgin paper/landfill
  plasticRecycleKgPerKg: 1.0, // conservative avoided emissions vs virgin plastic
  garmentKg: 3.0, // low end of published garment LCAs (~2-15 kg CO2e per garment)
  plantMealKg: 0.8, // replacing an egg/chicken-based meal with a plant-based one
  flightKmKg: 0.15, // domestic short-haul flight per passenger-km, excluding radiative forcing
};

const SOURCES =
  'Grid 0.71 kg CO2e/kWh: CEA CO2 Baseline Database (India). Vehicle factors: ARAI / India GHG Program. ' +
  'Other factors are approximate literature values (IPCC, EPA WARM, DEFRA, FAO/Poore & Nemecek) and are estimates.';

const r3 = (n) => Math.round(n * 1000) / 1000;
const bucketFor = (minutes) => (minutes <= 10 ? 'short' : minutes <= 30 ? 'medium' : 'long');

const CATEGORY_META = {
  energy: { id: 'energy', name: 'Energy Conservation' },
  transport: { id: 'transport', name: 'Sustainable Transportation' },
  waste: { id: 'waste', name: 'Waste Management' },
  water: { id: 'water', name: 'Water Conservation' },
};

/** Build a quantified impact block. perQty = kg CO2e saved per 1 `qtyUnit`. */
const imp = ({ type, perQty, qty, qtyUnit, unit, factor, calc, assume, max, label, persist = 1, water = 0 }) => ({
  isQuantitative: true,
  impactType: type,
  carbonPerQuantity: Math.round(perQty * 1e6) / 1e6,
  quantity: qty,
  quantityUnit: qtyUnit,
  unit,
  factor,
  calc,
  assume,
  maxQuantity: max || 0,
  inputLabel: label || '',
  persistDays: persist,
  waterPerQuantity: water,
});

/** Qualitative impact: no CO2e number is shown or recorded. */
const qual = (type, text, assume = '') => ({
  isQuantitative: false,
  impactType: type,
  text,
  assume,
});

const habit = (o) => ({
  activityType: 'daily_habit',
  durationDays: 7,
  isRecurring: true,
  cooldownDays: 1,
  ...o,
});
const once = (o) => ({
  activityType: 'one_time',
  durationDays: 1,
  requiredCheckIns: 1,
  isRecurring: false,
  cooldownDays: 0,
  ...o,
});

// Compact definitions. `min` = minutes of effort per check-in / per action.
const DEFS = [
  // ───────────────────────── ENERGY (15) ─────────────────────────
  habit({
    id: 'energy_switch_off_unused', cat: 'energy', title: 'Switch off unused appliances',
    desc: 'Switch TVs, set-top boxes and chargers fully off at the plug when not in use.',
    why: 'Always-on devices draw standby power all night, adding avoidable grid emissions.',
    how: 'Turn off TV, set-top box, monitor and chargers at the wall switch before bed.',
    crit: 'Check in on at least 6 of 7 days after switching unused electronics fully off.',
    req: 6, eco: 3, gp: 12, diff: 'easy', min: 3, kw: ['standby', 'vampire', 'plug', 'tv', 'charger'],
    impact: imp({
      type: 'electricity_saving', perQty: 0.2 * GRID, qty: 1, qtyUnit: 'night', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh (India grid)`, calc: '≈25 W standby load × 8 h = 0.2 kWh/day × grid factor',
      assume: 'About 25 W of combined standby load (TV + set-top box + chargers) removed for ~8 hours.',
    }),
  }),
  habit({
    id: 'energy_reduce_ac', cat: 'energy', title: 'Reduce unnecessary AC usage',
    desc: 'Run the air conditioner for one hour less each day than usual.',
    why: 'A 1.5 kW AC is usually the largest single electricity load in an Indian home.',
    how: 'Switch the AC off earlier or use a timer; cool only the room you are in.',
    crit: 'Check in on at least 5 of 7 days after cutting AC run time by an hour or more.',
    req: 5, eco: 6, gp: 25, diff: 'medium', min: 2, kw: ['ac', 'air conditioner', 'cooling', 'electricity'],
    impact: imp({
      type: 'electricity_saving', perQty: 1.5 * GRID, qty: 1, qtyUnit: 'hour', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh`, calc: '1.5 kW × hours avoided = kWh saved × grid factor',
      assume: 'Typical 1.5-ton AC drawing ~1.5 kW. Savings scale with your AC and hours avoided.',
      max: 6, label: 'AC hours avoided today',
    }),
  }),
  habit({
    id: 'energy_switch_off_lights', cat: 'energy', title: 'Switch off lights when leaving rooms',
    desc: 'Turn off lights and fans whenever you leave a room.',
    why: 'Lights left on in empty rooms are pure waste and add heat that raises cooling needs.',
    how: 'Check switches before leaving bedrooms, kitchen and living room.',
    crit: 'Check in on at least 6 of 7 days with no lights left on in empty rooms.',
    req: 6, eco: 2, gp: 8, diff: 'easy', min: 2, kw: ['lights', 'lighting', 'switch off', 'fan'],
    impact: imp({
      type: 'electricity_saving', perQty: 0.18 * GRID, qty: 1, qtyUnit: 'day', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh`, calc: '3 lights × ~20 W × 3 h = 0.18 kWh/day × grid factor',
      assume: 'Three lights (mix of LED and tube) that would otherwise stay on for ~3 hours.',
    }),
  }),
  once({
    id: 'energy_replace_led', cat: 'energy', title: 'Replace conventional bulbs with LED bulbs',
    desc: 'Swap an old incandescent/CFL bulb for a BEE-rated LED and use it ~5 hours a day.',
    why: 'LEDs use roughly 70-80% less power than incandescent bulbs for the same light.',
    how: 'Replace old bulbs with 9 W LED bulbs and note how many you changed.',
    crit: 'Confirm the bulb(s) are replaced and in use. Savings are projected over 30 days.',
    eco: 4, gp: 30, diff: 'easy', min: 20, kw: ['led', 'bulb', 'lighting', 'efficient'],
    impact: imp({
      type: 'electricity_saving', perQty: 0.105 * GRID, qty: 1, qtyUnit: 'bulb', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh`, calc: '(30 W old − 9 W LED) × 5 h = 0.105 kWh/day per bulb × grid factor',
      assume: 'Replaces a ~30 W bulb with a 9 W LED, 5 h/day. A bulb that is already efficient saves less. Projected over 30 days.',
      max: 20, label: 'Bulbs replaced', persist: 30,
    }),
  }),
  habit({
    id: 'energy_ac_set_temp', cat: 'energy', title: 'Set AC to 24-26°C',
    desc: 'Keep your AC thermostat at 24-26°C instead of a lower setting.',
    why: 'Each 1°C higher setpoint cuts compressor energy by roughly 6% (BEE guidance).',
    how: 'Set the thermostat to 24-26°C and use a fan for comfort.',
    crit: 'Check in on at least 5 of 7 days with the AC set to 24°C or higher.',
    req: 5, eco: 6, gp: 25, diff: 'easy', min: 2, kw: ['ac', 'thermostat', 'temperature', '24', 'cooling'],
    impact: imp({
      type: 'electricity_saving', perQty: 0.54 * GRID, qty: 2, qtyUnit: '°C raised', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh`, calc: '6%/°C × (1.5 kW × 6 h = 9 kWh) = 0.54 kWh per °C × grid factor',
      assume: '1.5 kW AC running ~6 h/day, raised by 2°C (e.g. 22→24). Do not count together with "Reduce AC usage" hours.',
      max: 4, label: '°C raised vs your usual setting',
    }),
  }),
  habit({
    id: 'energy_fan_not_ac', cat: 'energy', title: 'Use a ceiling fan instead of AC',
    desc: 'On mild days, use a ceiling fan instead of the AC for an hour or more.',
    why: 'A ceiling fan uses about 70 W versus ~1,500 W for an AC.',
    how: 'Choose the fan first on mild evenings and early mornings.',
    crit: 'Check in on at least 4 of 7 days with a fan replacing AC time.',
    req: 4, eco: 5, gp: 22, diff: 'medium', min: 2, kw: ['fan', 'ceiling fan', 'ac', 'cooling'],
    impact: imp({
      type: 'electricity_saving', perQty: (1.5 - 0.07) * GRID, qty: 1, qtyUnit: 'hour', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh`, calc: '(1.5 kW AC − 0.07 kW fan) × hours = kWh saved × grid factor',
      assume: 'Counts only hours the fan fully replaces AC; do not also count them under "Reduce AC usage".',
      max: 4, label: 'Hours fan replaced AC',
    }),
  }),
  habit({
    id: 'energy_natural_daylight', cat: 'energy', title: 'Use natural daylight',
    desc: 'Open curtains and work in daylight instead of switching lights on.',
    why: 'Daylight is free and avoids lighting load during the day.',
    how: 'Open curtains/windows and keep daytime lights off in bright rooms.',
    crit: 'Check in on at least 5 of 7 days with daytime lights kept off in bright rooms.',
    req: 5, eco: 2, gp: 9, diff: 'easy', min: 1, kw: ['daylight', 'sunlight', 'curtains', 'lights'],
    impact: imp({
      type: 'electricity_saving', perQty: 0.16 * GRID, qty: 1, qtyUnit: 'day', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh`, calc: '2 lights × 20 W × 4 h = 0.16 kWh/day × grid factor',
      assume: 'Two lights that would otherwise run ~4 hours in daytime.',
    }),
  }),
  habit({
    id: 'energy_reduce_geyser', cat: 'energy', title: 'Reduce geyser usage',
    desc: 'Heat water only when needed: switch the geyser off right after use and shorten heating time.',
    why: 'A 2 kW electric geyser is a big load; heating time adds up fast.',
    how: 'Switch on 10-15 min before bathing and switch off immediately after.',
    crit: 'Check in on at least 5 of 7 days with reduced geyser run time.',
    req: 5, eco: 4, gp: 16, diff: 'easy', min: 2, kw: ['geyser', 'water heater', 'hot water', 'electricity'],
    impact: imp({
      type: 'electricity_saving', perQty: (2 / 60) * GRID, qty: 10, qtyUnit: 'minute', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh`, calc: '2 kW × minutes avoided ÷ 60 = kWh saved × grid factor',
      assume: '2 kW electric geyser; default is 10 minutes less heating per day.',
      max: 60, label: 'Geyser minutes avoided',
    }),
  }),
  habit({
    id: 'energy_cold_wash', cat: 'energy', title: 'Wash clothes in cold water',
    desc: 'Run laundry on cold/normal-temperature water instead of hot.',
    why: 'Most washing machine energy goes into heating water.',
    how: 'Select the cold or tap-water cycle; use hot water only for stains.',
    crit: 'Complete at least 2 cold-water washes within 7 days.',
    req: 2, eco: 3, gp: 14, diff: 'easy', min: 5, kw: ['laundry', 'washing machine', 'cold water', 'clothes'],
    impact: imp({
      type: 'electricity_saving', perQty: 0.7 * GRID, qty: 1, qtyUnit: 'load', unit: 'kg CO₂e per completion',
      factor: `${GRID} kg CO₂e/kWh`, calc: '≈0.7 kWh heating avoided per load × grid factor',
      assume: 'Applies if your machine/geyser would otherwise heat the water; cold-only top-loaders save nothing extra.',
    }),
  }),
  habit({
    id: 'energy_air_dry', cat: 'energy', title: 'Air-dry clothes instead of a dryer',
    desc: 'Hang laundry to dry instead of using an electric dryer.',
    why: 'Electric dryers use about 2-3 kWh per load.',
    how: 'Use a drying rack or balcony line.',
    crit: 'Air-dry at least 2 loads within 7 days.',
    req: 2, eco: 4, gp: 18, diff: 'easy', min: 15, kw: ['dryer', 'laundry', 'clothesline', 'drying'],
    impact: imp({
      type: 'electricity_saving', perQty: 2.5 * GRID, qty: 1, qtyUnit: 'load', unit: 'kg CO₂e per completion',
      factor: `${GRID} kg CO₂e/kWh`, calc: '≈2.5 kWh dryer load avoided × grid factor',
      assume: 'Only applies if you own and would have used an electric dryer.',
    }),
  }),
  habit({
    id: 'energy_offpeak_appliances', cat: 'energy', title: 'Run appliances in off-peak hours',
    desc: 'Run washing machine, iron or water pump late evening or at night.',
    why: 'Shifting load eases evening peak demand when the grid relies on its most carbon-intensive plants.',
    how: 'Schedule heavy appliances after 10 PM or during midday solar hours.',
    crit: 'Check in on at least 3 of 7 days after shifting a heavy appliance run.',
    req: 3, eco: 3, gp: 12, diff: 'easy', min: 3, kw: ['peak', 'off-peak', 'schedule', 'appliance', 'grid'],
    impact: qual('electricity_saving',
      'Shifts when you use power, not how much. Benefit depends on hourly grid mix, so no CO₂e figure is claimed.',
      'Hourly grid emission data is not available per user.'),
  }),
  once({
    id: 'energy_fridge_efficiency', cat: 'energy', title: 'Tune your refrigerator',
    desc: 'Set the fridge to 3-5°C, clean the coils and check the door seal.',
    why: 'A poorly sealed or dusty fridge works harder all day, every day.',
    how: 'Set 3-5°C (freezer −18°C), vacuum the back coils, test the door seal with paper.',
    crit: 'Confirm settings, coils and seal are done. Savings are projected over 30 days.',
    isRecurring: true, eco: 3, gp: 15, diff: 'easy', min: 15, kw: ['fridge', 'refrigerator', 'coils', 'appliance'],
    impact: imp({
      type: 'electricity_saving', perQty: 0.05 * GRID, qty: 1, qtyUnit: 'day', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh`, calc: '5% of ~1.0 kWh/day fridge use = 0.05 kWh/day × grid factor',
      assume: 'Conservative 5% efficiency gain on a fridge using ~1 kWh/day. Projected over 30 days.',
      persist: 30,
    }),
  }),
  habit({
    id: 'energy_computer_power_down', cat: 'energy', title: 'Power down idle computers',
    desc: 'Shut down or sleep PCs and monitors when you step away.',
    why: 'Idle desktops and monitors keep drawing power for hours.',
    how: 'Use sleep after 5 minutes and shut down when leaving for 30+ minutes.',
    crit: 'Check in on at least 5 of 7 days after powering down idle computers.',
    req: 5, eco: 3, gp: 12, diff: 'easy', min: 2, kw: ['computer', 'laptop', 'monitor', 'sleep', 'pc'],
    impact: imp({
      type: 'electricity_saving', perQty: 0.2 * GRID, qty: 2, qtyUnit: 'hour', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh`, calc: '200 W desktop × hours idle avoided = kWh saved × grid factor',
      assume: 'Desktop PC at 200 W (a laptop uses ~50 W, so saves less). Default 2 idle hours avoided.',
      max: 10, label: 'Idle hours avoided',
    }),
  }),
  once({
    id: 'energy_clean_ac_filter', cat: 'energy', title: 'Clean or service your AC filter',
    desc: 'Clean the AC filters (or book a service) so the unit cools efficiently.',
    why: 'Clogged filters make the compressor work harder and raise energy use.',
    how: 'Switch off, remove and wash the filters, dry them and refit.',
    crit: 'Confirm the filter is cleaned. Savings are projected over 30 days of use.',
    isRecurring: true, eco: 5, gp: 25, diff: 'medium', min: 20, kw: ['ac', 'filter', 'service', 'maintenance'],
    impact: imp({
      type: 'electricity_saving', perQty: 0.3 * GRID, qty: 1, qtyUnit: 'day', unit: 'kg CO₂e per day',
      factor: `${GRID} kg CO₂e/kWh`, calc: '5% of (1.5 kW × 4 h = 6 kWh/day) = 0.3 kWh/day × grid factor',
      assume: 'Conservative 5% efficiency gain, AC used ~4 h/day. Projected over 30 days.',
      persist: 30,
    }),
  }),
  once({
    id: 'energy_star_rated_appliance', cat: 'energy', title: 'Choose a BEE 5-star appliance',
    desc: 'When replacing an appliance, pick a high BEE star rating (and the right size).',
    why: 'Appliances last 10+ years, so an efficient choice keeps saving every year.',
    how: 'Compare BEE star labels and annual kWh before buying. Skip upgrades you do not need.',
    crit: 'Confirm you bought or chose a 4/5-star appliance in place of a less efficient one.',
    durationDays: 7, isRecurring: true, eco: 10, gp: 50, diff: 'hard', min: 60,
    kw: ['bee', 'star', 'appliance', 'efficient', 'buy'],
    impact: qual('electricity_saving',
      'Savings depend on the appliance, size and usage, so no single CO₂e figure is claimed.',
      'Compare annual kWh on the BEE label to estimate your own saving.'),
  }),

  // ───────────────────────── TRANSPORT (12) ─────────────────────────
  habit({
    id: 'transport_walk_cycle', cat: 'transport', title: 'Walk or cycle for short distances',
    desc: 'Replace short motorbike or car trips with walking or cycling.',
    why: 'Short trips with a cold engine are the least efficient; walking emits nothing.',
    how: 'Walk or cycle for neighbourhood errands, milk pickup or temple visits.',
    crit: 'Record at least 5 walking/cycling trips within 7 days.',
    req: 5, eco: 4, gp: 20, diff: 'easy', min: 15, kw: ['walk', 'walking', 'short trip', 'errand'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: KM.petrol_bike - KM.walk, qty: 1.5, qtyUnit: 'km', unit: 'kg CO₂e per trip',
      factor: `${KM.petrol_bike} kg CO₂e/km (petrol two-wheeler)`, calc: 'km walked × petrol two-wheeler factor',
      assume: 'Replaces a petrol motorbike trip (a car trip would save more). Default 1.5 km.',
      max: 5, label: 'Distance walked (km)',
    }),
  }),
  habit({
    id: 'transport_cycle_instead_of_driving', cat: 'transport', title: 'Cycle instead of driving',
    desc: 'Replace a 3 km car journey with cycling.',
    why: 'Cycling is zero-emission and keeps you fit while avoiding congestion.',
    how: 'Cycle for trips of 2-5 km that you would normally drive.',
    crit: 'Complete at least 3 cycling trips within 7 days.',
    req: 3, eco: 8, gp: 35, diff: 'medium', min: 20, kw: ['cycle', 'bicycle', 'bike', 'driving', 'car'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: KM.petrol_car - KM.bicycle, qty: 3, qtyUnit: 'km', unit: 'kg CO₂e per trip',
      factor: `${KM.petrol_car} kg CO₂e/km (average petrol car)`, calc: 'km cycled × petrol car factor',
      assume: 'Replaces a trip in an average petrol car. Default 3 km, adjust to your actual distance.',
      max: 20, label: 'Distance cycled (km)',
    }),
  }),
  habit({
    id: 'transport_public_transit', cat: 'transport', title: 'Use public transportation',
    desc: 'Take the bus, BRTS or metro instead of a car or two-wheeler for a commute.',
    why: 'A full bus emits a fraction of the CO₂ per passenger compared with a car.',
    how: 'Take shared transit for at least one leg of your commute.',
    crit: 'Check in on at least 5 of 7 days using public transit.',
    req: 5, eco: 9, gp: 40, diff: 'medium', min: 45, kw: ['bus', 'metro', 'brts', 'amts', 'transit', 'commute'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: KM.petrol_car - KM.bus, qty: 10, qtyUnit: 'km', unit: 'kg CO₂e per trip',
      factor: `${KM.petrol_car} (car) − ${KM.bus} (bus) kg CO₂e/km`, calc: 'km travelled × (car factor − bus factor)',
      assume: 'Replaces a petrol car trip with a bus. Default 10 km; metro would save slightly more.',
      max: 60, label: 'Distance by public transport (km)',
    }),
  }),
  habit({
    id: 'transport_carpool', cat: 'transport', title: 'Carpool whenever possible',
    desc: 'Share rides with colleagues, neighbours or classmates going the same way.',
    why: 'Two people in one car halves the emissions per person.',
    how: 'Coordinate a shared ride instead of driving solo.',
    crit: 'Check in on at least 4 of 7 days with a shared commute.',
    req: 4, eco: 6, gp: 28, diff: 'medium', min: 10, kw: ['carpool', 'ride share', 'shared ride', 'commute'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: KM.petrol_car / 2, qty: 10, qtyUnit: 'km', unit: 'kg CO₂e per trip',
      factor: `${KM.petrol_car} kg CO₂e/km (petrol car)`, calc: 'km shared × car factor ÷ 2 occupants',
      assume: 'Your solo car trip is replaced by sharing one car with one other person. Default 10 km.',
      max: 60, label: 'Distance shared (km)',
    }),
  }),
  habit({
    id: 'transport_combine_errands', cat: 'transport', title: 'Combine errands into one trip',
    desc: 'Plan errands in a single loop instead of several separate trips.',
    why: 'Each avoided trip saves fuel, especially cold-start short journeys.',
    how: 'List your errands and run them in one route.',
    crit: 'Combine errands on at least 3 of 7 days.',
    req: 3, eco: 4, gp: 18, diff: 'easy', min: 5, kw: ['errands', 'trip chaining', 'plan', 'fuel'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: KM.petrol_car, qty: 4, qtyUnit: 'km avoided', unit: 'kg CO₂e per trip',
      factor: `${KM.petrol_car} kg CO₂e/km (petrol car)`, calc: 'km avoided × car factor',
      assume: 'Combining trips avoids ~4 km of driving in a petrol car (default).',
      max: 30, label: 'Kilometres avoided',
    }),
  }),
  habit({
    id: 'transport_avoid_idling', cat: 'transport', title: 'Avoid unnecessary vehicle idling',
    desc: 'Switch off the engine when waiting for more than a minute.',
    why: 'An idling engine burns fuel and emits CO₂ while going nowhere.',
    how: 'Turn off the engine at long signals, level crossings and when waiting.',
    crit: 'Check in on at least 5 of 7 days after switching off at stops.',
    req: 5, eco: 3, gp: 12, diff: 'easy', min: 1, kw: ['idling', 'engine off', 'signal', 'fuel'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: (F.idleLitresPerHour / 60) * F.petrolKgPerL, qty: 10, qtyUnit: 'minute',
      unit: 'kg CO₂e per day', factor: `${F.petrolKgPerL} kg CO₂/L petrol`,
      calc: '0.6 L/h × minutes ÷ 60 × 2.31 kg CO₂/L',
      assume: 'Petrol engine idling ~0.6 L/hour. Default 10 minutes of idling avoided per day.',
      max: 60, label: 'Idling minutes avoided',
    }),
  }),
  once({
    id: 'transport_tyre_pressure', cat: 'transport', title: 'Maintain correct tyre pressure',
    desc: 'Check and correct your tyre pressure to the manufacturer recommendation.',
    why: 'Under-inflated tyres increase fuel use by a few percent.',
    how: 'Use a pressure gauge at a petrol pump and inflate to the sticker value.',
    crit: 'Confirm pressure is checked and corrected. Savings are projected over 30 days.',
    isRecurring: true, eco: 3, gp: 15, diff: 'easy', min: 10, kw: ['tyre', 'tire', 'pressure', 'fuel', 'maintenance'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: KM.petrol_car * 0.02, qty: 12, qtyUnit: 'km driven per day',
      unit: 'kg CO₂e per day', factor: `${KM.petrol_car} kg CO₂e/km`, calc: 'km/day × car factor × 2% fuel saving',
      assume: 'Conservative 2% fuel saving, petrol car, 12 km/day. Projected over 30 days.',
      max: 100, label: 'Km driven per day', persist: 30,
    }),
  }),
  habit({
    id: 'transport_eco_driving', cat: 'transport', title: 'Drive smoothly (eco-driving)',
    desc: 'Accelerate gently, keep a steady speed and anticipate stops.',
    why: 'Smooth driving cuts fuel use and emissions.',
    how: 'Avoid harsh braking and speeding; shift up early.',
    crit: 'Check in on at least 5 of 7 days of smooth driving.',
    req: 5, eco: 3, gp: 14, diff: 'easy', min: 1, kw: ['eco driving', 'fuel efficiency', 'driving', 'car'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: KM.petrol_car * 0.05, qty: 12, qtyUnit: 'km driven', unit: 'kg CO₂e per day',
      factor: `${KM.petrol_car} kg CO₂e/km`, calc: 'km driven × car factor × 5% fuel saving',
      assume: 'Conservative 5% fuel saving on a 12 km petrol car trip. Actual savings vary with traffic.',
      max: 100, label: 'Km driven smoothly',
    }),
  }),
  habit({
    id: 'transport_work_remote', cat: 'transport', title: 'Work or study remotely',
    desc: 'Skip the commute on days when working from home is possible.',
    why: 'The cleanest trip is the one you do not make.',
    how: 'Arrange a work-from-home day and avoid the commute.',
    crit: 'Work or study remotely on at least 2 of 7 days.',
    req: 2, eco: 7, gp: 30, diff: 'medium', min: 5, kw: ['remote', 'work from home', 'wfh', 'commute'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: KM.petrol_bike, qty: 20, qtyUnit: 'km commute avoided',
      unit: 'kg CO₂e per day', factor: `${KM.petrol_bike} kg CO₂e/km (petrol two-wheeler)`,
      calc: 'round-trip km avoided × two-wheeler factor',
      assume: 'Default is a 20 km round trip by petrol two-wheeler; a car commute would save more.',
      max: 100, label: 'Round-trip commute avoided (km)',
    }),
  }),
  once({
    id: 'transport_train_over_flight', cat: 'transport', title: 'Choose a train over a short flight',
    desc: 'Travel by train instead of a short domestic flight when practical.',
    why: 'Per passenger-km, trains emit roughly a tenth of what short-haul flights do.',
    how: 'Book a train for trips under ~600 km and record the distance.',
    crit: 'Confirm a train journey replaced a flight. Enter the one-way distance.',
    durationDays: 7, isRecurring: true, eco: 12, gp: 55, diff: 'hard', min: 60,
    kw: ['train', 'flight', 'rail', 'travel', 'aviation'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: F.flightKmKg - KM.train, qty: 400, qtyUnit: 'km', unit: 'kg CO₂e per trip',
      factor: `${F.flightKmKg} (flight) − ${KM.train} (train) kg CO₂e/pkm`, calc: 'km × (flight factor − train factor)',
      assume: 'Domestic flight excluding radiative forcing, replaced by train. Default 400 km one way.',
      max: 2000, label: 'One-way distance (km)',
    }),
  }),
  habit({
    id: 'transport_ev_trip', cat: 'transport', title: 'Use an electric vehicle for a trip',
    desc: 'Use an e-car, e-rickshaw or e-bike instead of a petrol car for a trip.',
    why: 'Even on the Indian grid, an electric car emits well under half of a petrol car per km.',
    how: 'Pick an electric option for a trip you would drive; enter the distance.',
    crit: 'Complete at least 3 electric trips within 7 days.',
    req: 3, eco: 8, gp: 35, diff: 'hard', min: 30, kw: ['electric', 'ev', 'e-rickshaw', 'e-bike'],
    impact: imp({
      type: 'avoided_vehicle_emissions', perQty: KM.petrol_car - KM.electric_car, qty: 15, qtyUnit: 'km', unit: 'kg CO₂e per trip',
      factor: `${KM.petrol_car} (petrol) − ${KM.electric_car} (EV, India grid) kg CO₂e/km`,
      calc: 'km × (petrol car factor − EV factor)',
      assume: 'EV charged on the average Indian grid. Default 15 km.', max: 100, label: 'Distance by EV (km)',
    }),
  }),
  once({
    id: 'transport_vehicle_service_puc', cat: 'transport', title: 'Service your vehicle and renew PUC',
    desc: 'Get your vehicle serviced and carry a valid Pollution Under Control certificate.',
    why: 'A well-tuned engine burns cleaner and uses less fuel.',
    how: 'Book a service, check air filter and spark plugs, and get a PUC test.',
    crit: 'Confirm the service is done and the PUC certificate is valid.',
    durationDays: 7, isRecurring: true, eco: 4, gp: 20, diff: 'easy', min: 60,
    kw: ['service', 'puc', 'maintenance', 'emissions'],
    impact: qual('avoided_vehicle_emissions',
      'Fuel savings depend heavily on how neglected the engine was, so no CO₂e figure is claimed. Lower tailpipe pollution is the main benefit.'),
  }),

  // ───────────────────────── WATER (12) ─────────────────────────
  habit({
    id: 'water_turn_off_tap_brushing', cat: 'water', title: 'Turn off taps while brushing',
    desc: 'Close the tap while brushing teeth or shaving.',
    why: 'A running tap wastes several litres per minute of treated water.',
    how: 'Open the tap only to wet and rinse the brush.',
    crit: 'Check in on at least 6 of 7 days with the tap closed while brushing.',
    req: 6, eco: 2, gp: 8, diff: 'easy', min: 2, kw: ['tap', 'brushing', 'faucet', 'water'],
    impact: imp({
      type: 'water_energy_saving', perQty: 12 * F.waterSupplyKwhPerL * GRID, qty: 1, qtyUnit: 'day', unit: 'kg CO₂e per day',
      factor: `${F.waterSupplyKwhPerL} kWh/L supply energy × ${GRID} kg CO₂e/kWh`,
      calc: '≈12 L saved (2 min × 6 L/min) × supply energy × grid factor',
      assume: 'Carbon here is only the electricity to supply and treat the water; the main benefit is ~12 L of water saved.',
      water: 12,
    }),
  }),
  habit({
    id: 'water_reduce_shower_duration', cat: 'water', title: 'Take a shorter shower',
    desc: 'Cut your shower by about 5 minutes.',
    why: 'Showers use water and, with an electric geyser, a lot of heating energy.',
    how: 'Time your shower and turn it off while soaping.',
    crit: 'Check in on at least 5 of 7 days with a shorter shower.',
    req: 5, eco: 3, gp: 10, diff: 'easy', min: 1, kw: ['shower', 'bathing', 'hot water', 'water'],
    impact: imp({
      type: 'water_energy_saving',
      perQty: (9 * 0.5 * F.hotWaterKwhPerL + 9 * F.waterSupplyKwhPerL) * GRID, qty: 5, qtyUnit: 'minute',
      unit: 'kg CO₂e per day', factor: `${F.hotWaterKwhPerL} kWh/L heating, ${GRID} kg CO₂e/kWh`,
      calc: 'minutes × 9 L/min × (50% heated × 0.029 kWh/L + supply energy) × grid factor',
      assume: 'Flow ~9 L/min, half the water heated by an electric geyser. Gas/solar heaters or cold showers save less carbon.',
      max: 15, label: 'Minutes saved', water: 9,
    }),
  }),
  once({
    id: 'water_report_leaking_taps', cat: 'water', title: 'Report or repair leaking taps',
    desc: 'Fix or report dripping taps, shower heads and flush valves.',
    why: 'A tap dripping once per second wastes 3,000+ litres a year.',
    how: 'Inspect fixtures, replace worn washers or report leaks to maintenance.',
    crit: 'Confirm all dripping fixtures were repaired or reported. Savings projected over 30 days.',
    eco: 4, gp: 25, diff: 'easy', min: 30, kw: ['leak', 'tap', 'plumbing', 'repair'],
    impact: imp({
      type: 'water_energy_saving', perQty: 8.2 * F.waterSupplyKwhPerL * GRID, qty: 1, qtyUnit: 'day', unit: 'kg CO₂e per day',
      factor: `${F.waterSupplyKwhPerL} kWh/L supply energy × ${GRID}`, calc: '≈8.2 L/day (3,000 L/yr) × supply energy × grid factor',
      assume: 'One tap dripping once per second. Carbon is small; the main benefit is ~8 L of water per day. Projected over 30 days.',
      persist: 30, water: 8.2,
    }),
  }),
  habit({
    id: 'water_bucket_bath', cat: 'water', title: 'Use a bucket instead of a shower',
    desc: 'Bathe with a bucket and mug instead of an overhead shower.',
    why: 'A bucket bath uses about 18 L versus 50+ L for a typical shower.',
    how: 'Use an 18 L bucket and mug; do not count the same bath as a shorter shower.',
    crit: 'Check in on at least 5 of 7 days using a bucket bath.',
    req: 5, eco: 4, gp: 16, diff: 'medium', min: 5, kw: ['bucket', 'bathing', 'shower', 'water saving'],
    impact: imp({
      type: 'water_energy_saving',
      perQty: (36 * 0.5 * F.hotWaterKwhPerL + 36 * F.waterSupplyKwhPerL) * GRID, qty: 1, qtyUnit: 'bath', unit: 'kg CO₂e per day',
      factor: `${F.hotWaterKwhPerL} kWh/L heating, ${GRID} kg CO₂e/kWh`,
      calc: '(54 L shower − 18 L bucket) × (50% heated × 0.029 + supply energy) × grid factor',
      assume: 'Replaces a ~6 min, 9 L/min shower with an 18 L bucket bath, half of it electrically heated. Do not combine with the shorter-shower activity.',
      water: 36,
    }),
  }),
  habit({
    id: 'water_reuse_plants', cat: 'water', title: 'Reuse household water for plants',
    desc: 'Use RO reject water, rinse water or leftover drinking water for plants.',
    why: 'Greywater reuse reduces demand on treated supply.',
    how: 'Collect rinse/RO reject water in a bucket and use it for plants or cleaning.',
    crit: 'Check in on at least 5 of 7 days reusing water.',
    req: 5, eco: 2, gp: 10, diff: 'easy', min: 5, kw: ['reuse', 'greywater', 'plants', 'ro water'],
    impact: imp({
      type: 'water_energy_saving', perQty: F.waterSupplyKwhPerL * GRID, qty: 5, qtyUnit: 'litre', unit: 'kg CO₂e per day',
      factor: `${F.waterSupplyKwhPerL} kWh/L × ${GRID}`, calc: 'litres reused × supply energy × grid factor',
      assume: 'Carbon is tiny; the benefit is the litres of fresh water not drawn. Default 5 L/day.',
      max: 40, label: 'Litres reused', water: 1,
    }),
  }),
  habit({
    id: 'water_full_load_washing', cat: 'water', title: 'Run washing machine with full loads',
    desc: 'Wait until you have a full load instead of washing small batches.',
    why: 'Each avoided wash saves water and electricity.',
    how: 'Combine small loads; avoid half-empty cycles.',
    crit: 'Run at least 2 full loads (avoiding extra cycles) within 7 days.',
    req: 2, eco: 3, gp: 14, diff: 'easy', min: 2, kw: ['washing machine', 'laundry', 'full load', 'water'],
    impact: imp({
      type: 'water_energy_saving', perQty: (0.35 + 60 * F.waterSupplyKwhPerL) * GRID, qty: 1, qtyUnit: 'wash avoided',
      unit: 'kg CO₂e per completion', factor: `${GRID} kg CO₂e/kWh`,
      calc: '(0.35 kWh machine cycle + 60 L × supply energy) × grid factor',
      assume: 'One avoided cycle of a 500 W machine (~0.7 h) using ~60 L of water.', water: 60,
    }),
  }),
  once({
    id: 'water_efficient_fixtures', cat: 'water', title: 'Install water-efficient fixtures',
    desc: 'Fit tap aerators or low-flow shower heads.',
    why: 'Aerators cut flow by ~30-50% with no change in habit.',
    how: 'Buy and fit aerators or a low-flow head; check the flow rating.',
    crit: 'Confirm at least one efficient fixture is installed. Savings projected over 30 days.',
    durationDays: 7, isRecurring: true, eco: 6, gp: 28, diff: 'medium', min: 30,
    kw: ['aerator', 'low flow', 'fixtures', 'tap', 'shower head'],
    impact: imp({
      type: 'water_energy_saving', perQty: 30 * F.waterSupplyKwhPerL * GRID, qty: 1, qtyUnit: 'fixture set', unit: 'kg CO₂e per day',
      factor: `${F.waterSupplyKwhPerL} kWh/L × ${GRID}`, calc: '≈30 L/day saved × supply energy × grid factor',
      assume: 'Roughly 3 L/min less flow over ~10 min of daily tap use. Hot-water savings are excluded. Projected over 30 days.',
      persist: 30, water: 30,
    }),
  }),
  once({
    id: 'water_rainwater', cat: 'water', title: 'Collect rainwater',
    desc: 'Set up a barrel or recharge pit to capture roof rainwater.',
    why: 'Harvested rain reduces groundwater pumping and flooding.',
    how: 'Direct a downpipe to a storage barrel or recharge pit with a mesh filter.',
    crit: 'Confirm a working rainwater collection or recharge setup.',
    durationDays: 7, isRecurring: true, eco: 10, gp: 45, diff: 'hard', min: 120,
    kw: ['rain', 'harvest', 'groundwater', 'recharge'],
    impact: qual('qualitative_ecosystem',
      'Water captured depends on roof area and rainfall, so no CO₂e figure is claimed. It reduces groundwater pumping and runoff.'),
  }),
  habit({
    id: 'water_plants_cooler_hours', cat: 'water', title: 'Water plants in cooler hours',
    desc: 'Water plants early morning or evening, not at midday.',
    why: 'Less water evaporates before reaching roots.',
    how: 'Water before 9 AM or after 5 PM at the base of the plant.',
    crit: 'Check in on at least 5 of 7 days watering at cooler times.',
    req: 5, eco: 2, gp: 8, diff: 'easy', min: 10, kw: ['plants', 'garden', 'watering', 'evaporation'],
    impact: qual('qualitative_ecosystem',
      'Saves water through less evaporation; the amount varies with weather, so no CO₂e figure is claimed.'),
  }),
  habit({
    id: 'water_bucket_wash', cat: 'water', title: 'Wash vehicle or floors with a bucket',
    desc: 'Use a bucket and cloth instead of a running hose.',
    why: 'A hose can use 10+ litres per minute.',
    how: 'Fill a bucket and wipe; rinse sparingly.',
    crit: 'Wash with a bucket instead of a hose at least 2 times within 7 days.',
    req: 2, eco: 3, gp: 12, diff: 'easy', min: 15, kw: ['hose', 'car wash', 'floor', 'bucket'],
    impact: imp({
      type: 'water_energy_saving', perQty: 100 * F.waterSupplyKwhPerL * GRID, qty: 1, qtyUnit: 'wash', unit: 'kg CO₂e per completion',
      factor: `${F.waterSupplyKwhPerL} kWh/L × ${GRID}`, calc: '≈100 L saved × supply energy × grid factor',
      assume: 'Hose ~10 L/min for ~10 min versus a few buckets. Carbon is small; ~100 L of water saved.', water: 100,
    }),
  }),
  once({
    id: 'water_meter_leak_audit', cat: 'water', title: 'Run a home water-leak check',
    desc: 'Check the meter with all taps off and test the toilet for silent leaks.',
    why: 'Silent toilet and pipe leaks can waste hundreds of litres a day.',
    how: 'Note the meter, wait 30 minutes with no use, and add food colour to the cistern.',
    crit: 'Confirm the check is done and any leak is reported or fixed.',
    isRecurring: true, eco: 4, gp: 18, diff: 'easy', min: 20, kw: ['leak', 'meter', 'toilet', 'audit'],
    impact: qual('qualitative_ecosystem',
      'Only saves water if a leak is found; the amount is unknown until checked, so no CO₂e figure is claimed.'),
  }),
  habit({
    id: 'water_dishwashing_basin', cat: 'water', title: 'Wash dishes in a basin',
    desc: 'Wash and rinse dishes in basins instead of under a running tap.',
    why: 'A running tap uses far more water than two basins.',
    how: 'Use one basin to wash and one to rinse.',
    crit: 'Check in on at least 5 of 7 days washing dishes in a basin.',
    req: 5, eco: 2, gp: 10, diff: 'easy', min: 10, kw: ['dishes', 'kitchen', 'basin', 'tap'],
    impact: imp({
      type: 'water_energy_saving', perQty: 18 * F.waterSupplyKwhPerL * GRID, qty: 1, qtyUnit: 'day', unit: 'kg CO₂e per day',
      factor: `${F.waterSupplyKwhPerL} kWh/L × ${GRID}`, calc: '≈18 L saved × supply energy × grid factor',
      assume: '~24 L under a running tap versus ~6 L in basins. Carbon is small; ~18 L of water saved per day.', water: 18,
    }),
  }),

  // ───────────────────────── WASTE & SUSTAINABLE LIVING (20) ─────────────────────────
  habit({
    id: 'waste_segregate', cat: 'waste', title: 'Segregate wet and dry waste',
    desc: 'Keep separate bins for kitchen waste and recyclable dry waste.',
    why: 'Mixed waste rots in dumps, releasing methane and contaminating recyclables.',
    how: 'Put peels and scraps in the wet bin; paper, plastic and cardboard in the dry bin.',
    crit: 'Check in on at least 6 of 7 days handing over segregated waste.',
    req: 6, eco: 4, gp: 16, diff: 'easy', min: 5, kw: ['segregation', 'wet waste', 'dry waste', 'bins'],
    impact: qual('waste_avoided_emissions',
      'Segregation enables composting and recycling; their CO₂e is counted in those activities to avoid double counting.'),
  }),
  habit({
    id: 'waste_avoid_single_plastic', cat: 'waste', title: 'Avoid single-use plastic',
    desc: 'Refuse plastic bags, cutlery and straws when buying food or groceries.',
    why: 'Single-use plastic persists for centuries and clogs drains and rivers.',
    how: 'Carry your own bag and cutlery; ask vendors to skip disposables.',
    crit: 'Check in on at least 5 of 7 days refusing single-use plastic items.',
    req: 5, eco: 3, gp: 14, diff: 'medium', min: 2, kw: ['plastic', 'single-use', 'straw', 'cutlery'],
    impact: imp({
      type: 'waste_avoided_emissions', perQty: F.plasticBagKg, qty: 2, qtyUnit: 'item', unit: 'kg CO₂e per day',
      factor: `${F.plasticBagKg} kg CO₂e per single-use bag-equivalent`, calc: 'items refused × per-item footprint',
      assume: 'Each refused item is valued like a thin plastic carry bag. Default 2 items/day.',
      max: 10, label: 'Single-use items refused',
    }),
  }),
  habit({
    id: 'waste_reusable_bottle', cat: 'waste', title: 'Carry a reusable water bottle',
    desc: 'Carry a steel or copper bottle instead of buying bottled water.',
    why: 'Each avoided PET bottle saves plastic and its production emissions.',
    how: 'Fill up before leaving home and refill at trusted points.',
    crit: 'Check in on at least 6 of 7 days carrying your own bottle.',
    req: 6, eco: 3, gp: 12, diff: 'easy', min: 1, kw: ['bottle', 'reusable', 'pet', 'water'],
    impact: imp({
      type: 'waste_avoided_emissions', perQty: F.petBottleKg, qty: 1, qtyUnit: 'bottle', unit: 'kg CO₂e per day',
      factor: `${F.petBottleKg} kg CO₂e per 500 ml PET bottle`, calc: 'bottles avoided × per-bottle footprint',
      assume: 'You would otherwise buy one 500 ml PET bottle. Washing your own bottle has a small footprint of its own.',
      max: 6, label: 'Bottles avoided',
    }),
  }),
  habit({
    id: 'waste_reusable_bag', cat: 'waste', title: 'Carry reusable shopping bags',
    desc: 'Take cloth or jute bags every time you shop.',
    why: 'Thin plastic bags are used for minutes and last for centuries.',
    how: 'Keep bags by the door or in your vehicle.',
    crit: 'Shop with your own bags on at least 4 of 7 days.',
    req: 4, eco: 2, gp: 9, diff: 'easy', min: 1, kw: ['bag', 'shopping', 'cloth bag', 'plastic'],
    impact: imp({
      type: 'waste_avoided_emissions', perQty: F.plasticBagKg, qty: 3, qtyUnit: 'bag', unit: 'kg CO₂e per trip',
      factor: `${F.plasticBagKg} kg CO₂e per single-use bag`, calc: 'bags avoided × per-bag footprint',
      assume: 'Each reusable bag replaces one single-use bag; a cloth bag must be reused many times to pay back its own footprint.',
      max: 10, label: 'Plastic bags avoided',
    }),
  }),
  habit({
    id: 'waste_reusable_cup', cat: 'waste', title: 'Use a reusable cup',
    desc: 'Bring your own cup for tea and coffee instead of disposables.',
    why: 'Plastic-lined disposable cups are rarely recycled.',
    how: 'Carry a cup or flask and ask vendors to fill it.',
    crit: 'Check in on at least 5 of 7 days using your own cup.',
    req: 5, eco: 2, gp: 10, diff: 'easy', min: 1, kw: ['cup', 'tea', 'coffee', 'disposable'],
    impact: imp({
      type: 'waste_avoided_emissions', perQty: F.disposableCupKg, qty: 1, qtyUnit: 'cup', unit: 'kg CO₂e per day',
      factor: `${F.disposableCupKg} kg CO₂e per disposable cup`, calc: 'cups avoided × per-cup footprint',
      assume: 'Replaces one plastic-lined paper cup per use.', max: 6, label: 'Disposable cups avoided',
    }),
  }),
  habit({
    id: 'waste_compost', cat: 'waste', title: 'Compost kitchen waste',
    desc: 'Compost vegetable peels and food scraps at home or in a community pit.',
    why: 'Composting avoids methane from organic waste in dumps and gives free fertiliser.',
    how: 'Use a compost bin or pit with browns (dry leaves) and greens (scraps).',
    crit: 'Check in on at least 5 of 7 days composting your kitchen waste.',
    req: 5, eco: 6, gp: 25, diff: 'medium', min: 15, kw: ['compost', 'organic', 'kitchen waste', 'methane'],
    impact: imp({
      type: 'waste_avoided_emissions', perQty: F.organicLandfillKgPerKg, qty: 0.3, qtyUnit: 'kg', unit: 'kg CO₂e per day',
      factor: `${F.organicLandfillKgPerKg} kg CO₂e per kg organic waste (methane avoided)`, calc: 'kg composted × landfill methane factor',
      assume: 'Order-of-magnitude factor; open dumps without gas capture may emit more. Default 0.3 kg/day. Home composting also emits a little.',
      max: 3, label: 'Kg of kitchen waste composted',
    }),
  }),
  habit({
    id: 'waste_recycle_paper', cat: 'waste', title: 'Recycle paper',
    desc: 'Collect clean paper and cardboard and hand it to a recycler.',
    why: 'Recycling saves trees and the energy needed for virgin paper.',
    how: 'Keep dry paper aside and give it to a kabadiwala or collection point.',
    crit: 'Hand over paper for recycling at least once within 7 days.',
    req: 1, eco: 4, gp: 18, diff: 'easy', min: 10, kw: ['paper', 'cardboard', 'recycle', 'kabadiwala'],
    impact: imp({
      type: 'waste_avoided_emissions', perQty: F.paperRecycleKgPerKg, qty: 1, qtyUnit: 'kg', unit: 'kg CO₂e per completion',
      factor: `${F.paperRecycleKgPerKg} kg CO₂e per kg (conservative)`, calc: 'kg recycled × avoided-emissions factor',
      assume: 'Conservative estimate versus virgin paper and landfill; clean dry paper only.',
      max: 20, label: 'Kg of paper recycled',
    }),
  }),
  habit({
    id: 'waste_recycle_plastic', cat: 'waste', title: 'Recycle eligible plastic',
    desc: 'Rinse and hand over PET bottles and rigid plastics to recyclers.',
    why: 'Recycled plastic displaces virgin plastic production.',
    how: 'Rinse, dry and collect eligible plastics for the dry-waste stream or recycler.',
    crit: 'Hand over plastic for recycling at least once within 7 days.',
    req: 1, eco: 4, gp: 18, diff: 'easy', min: 10, kw: ['plastic', 'pet', 'recycle', 'dry waste'],
    impact: imp({
      type: 'waste_avoided_emissions', perQty: F.plasticRecycleKgPerKg, qty: 0.5, qtyUnit: 'kg', unit: 'kg CO₂e per completion',
      factor: `${F.plasticRecycleKgPerKg} kg CO₂e per kg (conservative)`, calc: 'kg recycled × avoided-emissions factor',
      assume: 'Conservative estimate; applies only if the plastic is actually recycled.',
      max: 20, label: 'Kg of plastic recycled',
    }),
  }),
  once({
    id: 'waste_ewaste', cat: 'waste', title: 'Recycle e-waste responsibly',
    desc: 'Give old phones, chargers and batteries to an authorised e-waste collector.',
    why: 'E-waste contains toxic metals and valuable materials that should not reach dumps.',
    how: 'Find an authorised collector or take-back programme near you.',
    crit: 'Confirm e-waste was handed to an authorised recycler.',
    durationDays: 7, isRecurring: true, eco: 8, gp: 40, diff: 'medium', min: 45, kw: ['e-waste', 'electronics', 'battery', 'phone'],
    impact: qual('waste_avoided_emissions',
      'Prevents toxic leaching and recovers materials; the carbon effect varies by device, so no CO₂e figure is claimed.'),
  }),
  once({
    id: 'waste_repair_items', cat: 'waste', title: 'Repair instead of replacing',
    desc: 'Repair a broken item (clothes, footwear, appliance) instead of buying new.',
    why: 'Repair avoids the emissions and waste of making a replacement.',
    how: 'Visit a local repairer or fix it yourself and note what you repaired.',
    crit: 'Confirm an item was repaired instead of replaced.',
    isRecurring: true, eco: 6, gp: 28, diff: 'medium', min: 60, kw: ['repair', 'fix', 'reuse', 'replace'],
    impact: qual('waste_avoided_emissions',
      'Savings depend on the item, so no CO₂e figure is claimed. Repair avoids the footprint of manufacturing a replacement.'),
  }),
  once({
    id: 'waste_second_hand', cat: 'waste', title: 'Buy second-hand instead of new',
    desc: 'Choose a pre-owned garment, book or item instead of buying new.',
    why: 'Extending an item\'s life avoids the emissions of making a new one.',
    how: 'Shop at thrift stores, swap events or trusted resale apps.',
    crit: 'Confirm you bought a second-hand item in place of a new one.',
    isRecurring: true, eco: 7, gp: 30, diff: 'medium', min: 60, kw: ['second-hand', 'thrift', 'used', 'resale', 'clothes'],
    impact: imp({
      type: 'waste_avoided_emissions', perQty: F.garmentKg, qty: 1, qtyUnit: 'garment', unit: 'kg CO₂e per completion',
      factor: `${F.garmentKg} kg CO₂e per garment (low end of published range)`, calc: 'items × per-item footprint',
      assume: 'Applies when the item replaces buying a new garment. Published values range ~2-15 kg; the low end is used.',
      max: 5, label: 'Second-hand items bought',
    }),
  }),
  habit({
    id: 'waste_avoid_food_waste', cat: 'waste', title: 'Avoid food waste',
    desc: 'Prevent about 500 g of edible food from being wasted each day.',
    why: 'Food waste carries the emissions of growing, transporting and cooking it.',
    how: 'Cook right-sized portions, eat leftovers and store food properly.',
    crit: 'Check in on at least 5 of 7 days with no edible food wasted.',
    req: 5, eco: 6, gp: 25, diff: 'medium', min: 10, kw: ['food waste', 'leftovers', 'portions', 'kitchen'],
    impact: imp({
      type: 'food_lifecycle_saving', perQty: F.foodKgPerKg, qty: 0.5, qtyUnit: 'kg', unit: 'kg CO₂e per day',
      factor: `${F.foodKgPerKg} kg CO₂e per kg of food (conservative)`, calc: 'kg of edible food saved × life-cycle factor',
      assume: 'Depends on the food type; meat and dairy are much higher. Count only food you would otherwise have thrown away.',
      max: 3, label: 'Kg of food saved',
    }),
  }),
  habit({
    id: 'waste_plan_meals', cat: 'waste', title: 'Plan meals and shop with a list',
    desc: 'Plan the week\'s meals and buy only what you need.',
    why: 'Planning reduces over-buying, which is a leading cause of household food waste.',
    how: 'Plan meals, check the pantry and write a grocery list.',
    crit: 'Plan meals and shop from a list at least once within 7 days.',
    req: 1, eco: 3, gp: 14, diff: 'easy', min: 20, kw: ['meal plan', 'grocery', 'shopping list', 'food'],
    impact: qual('food_lifecycle_saving',
      'Planning prevents waste, which is counted under "Avoid food waste" to avoid double counting.'),
  }),
  habit({
    id: 'waste_low_packaging', cat: 'waste', title: 'Choose products with less packaging',
    desc: 'Pick loose, refill or minimally packaged products.',
    why: 'Packaging becomes waste within days of purchase.',
    how: 'Buy loose produce and grains, choose refills and larger packs when practical.',
    crit: 'Check in on at least 3 of 7 days choosing low-packaging options.',
    req: 3, eco: 3, gp: 12, diff: 'easy', min: 5, kw: ['packaging', 'refill', 'loose', 'bulk'],
    impact: qual('waste_avoided_emissions',
      'Savings vary widely by product, so no CO₂e figure is claimed. Less packaging means less waste to dispose of.'),
  }),
  once({
    id: 'waste_donate_items', cat: 'waste', title: 'Donate usable clothes and household items',
    desc: 'Donate items you no longer use instead of throwing them away.',
    why: 'Donating keeps useful goods in use and out of dumps.',
    how: 'Sort clean usable items and give them to an NGO or donation drive.',
    crit: 'Confirm usable items were donated.',
    isRecurring: true, eco: 5, gp: 22, diff: 'easy', min: 30, kw: ['donate', 'clothes', 'reuse', 'charity'],
    impact: qual('waste_avoided_emissions',
      'Benefit depends on reuse by the recipient, so no CO₂e figure is claimed (the saving is counted for the buyer in "Buy second-hand").'),
  }),
  habit({
    id: 'waste_plant_based_meal', cat: 'waste', title: 'Try a plant-based meal',
    desc: 'Replace an egg or meat-based meal with a plant-based one.',
    why: 'Plant-based meals generally have a lower food footprint than meat and egg dishes.',
    how: 'Cook dal, rajma, chole or vegetable-based meals instead.',
    crit: 'Eat at least 3 plant-based replacement meals within 7 days.',
    req: 3, eco: 6, gp: 26, diff: 'medium', min: 5, kw: ['plant-based', 'vegetarian', 'vegan', 'diet', 'meal'],
    impact: imp({
      type: 'food_lifecycle_saving', perQty: F.plantMealKg, qty: 1, qtyUnit: 'meal', unit: 'kg CO₂e per meal',
      factor: `${F.plantMealKg} kg CO₂e saved per meal (estimate)`, calc: 'meals replaced × difference in meal footprint',
      assume: 'Only counts if it replaces an egg/chicken-based meal. If you are already vegetarian, this saves little.',
      max: 3, label: 'Meals replaced today',
    }),
  }),
  habit({
    id: 'waste_seasonal_local', cat: 'waste', title: 'Buy seasonal, local produce',
    desc: 'Choose seasonal fruit and vegetables grown nearby.',
    why: 'Seasonal produce needs less storage, heating and long-distance transport.',
    how: 'Shop at local markets and pick what is in season.',
    crit: 'Buy seasonal local produce on at least 2 of 7 days.',
    req: 2, eco: 3, gp: 12, diff: 'easy', min: 5, kw: ['seasonal', 'local', 'produce', 'market', 'vegetables'],
    impact: qual('food_lifecycle_saving',
      'Transport is a small share of food emissions and varies by crop, so no CO₂e figure is claimed.'),
  }),
  once({
    id: 'waste_native_tree', cat: 'waste', title: 'Plant a native tree',
    desc: 'Plant and care for a native sapling suited to your area.',
    why: 'Native trees support birds and insects, cool neighbourhoods and store carbon as they grow.',
    how: 'Choose a native species, plant in the monsoon, water and protect it for the first year.',
    crit: 'Confirm a native tree was planted and a plan to water it exists.',
    durationDays: 7, isRecurring: true, eco: 12, gp: 50, diff: 'hard', min: 90, kw: ['tree', 'plant', 'native', 'sapling', 'biodiversity'],
    impact: qual('qualitative_ecosystem',
      'Carbon storage is small in the first years and depends on species and survival, so no CO₂e figure is recorded. Established trees typically store roughly 10-20 kg CO₂ per year.',
      'Habitat, shade and cooling benefits begin early.'),
  }),
  once({
    id: 'waste_grow_herbs', cat: 'waste', title: 'Start a herb or vegetable garden',
    desc: 'Grow herbs or vegetables in pots, a balcony or a garden bed.',
    why: 'Home-grown food needs no packaging or transport, and plants support pollinators.',
    how: 'Start with tulsi, mint, coriander or chillies in pots with compost.',
    crit: 'Confirm planted pots/beds are set up.',
    durationDays: 7, isRecurring: true, eco: 5, gp: 22, diff: 'easy', min: 30, kw: ['garden', 'herbs', 'vegetables', 'pollinator', 'balcony'],
    impact: qual('qualitative_ecosystem',
      'Savings are small and depend on what you grow, so no CO₂e figure is claimed. Plants also support pollinators.'),
  }),
  once({
    id: 'waste_community_cleanup', cat: 'waste', title: 'Join a community cleanup',
    desc: 'Take part in a neighbourhood, beach or lake cleanup drive.',
    why: 'Cleanups remove litter before it enters drains, rivers and the sea.',
    how: 'Join a local drive or organise one; segregate what you collect.',
    crit: 'Confirm you participated in a cleanup.',
    isRecurring: true, eco: 8, gp: 38, diff: 'medium', min: 90, kw: ['cleanup', 'community', 'litter', 'volunteer'],
    impact: qual('qualitative_ecosystem',
      'Benefit is local ecosystem and public health, not a measurable CO₂e saving, so no figure is claimed.'),
  }),
];

function build(d) {
  const i = d.impact;
  const periodic = d.activityType === 'daily_habit';
  const perQtyDefault = i.isQuantitative ? r3(i.carbonPerQuantity * i.quantity) : 0;
  const waterSaving = i.isQuantitative ? r3((i.waterPerQuantity || 0) * (i.quantity || 1)) : 0;
  const multiplier = periodic ? d.req : i.persistDays || 1;
  const cycleTotal = i.isQuantitative ? r3(perQtyDefault * multiplier) : 0;

  const estimate = i.isQuantitative
    ? `Estimated CO₂e saved: approximately ${perQtyDefault} kg ${i.unit.replace('kg CO₂e ', '')} (estimate).`
    : i.text;

  return {
    activityId: d.id,
    titleKey: `activity_${d.id}_title`,
    title: d.title,
    description: d.desc,
    whyItMatters: d.why,
    instructions: d.how,
    completionCriteria: d.crit,
    category: d.cat,
    activityType: d.activityType,
    durationDays: d.durationDays,
    requiredCheckIns: periodic ? d.req : 1,
    isRecurring: d.isRecurring,
    cooldownDays: d.cooldownDays,
    ecoScoreReward: d.eco,
    greenPointsReward: d.gp,
    difficulty: d.diff,
    estimatedMinutes: d.min,
    durationBucket: bucketFor(d.min),
    timeRequiredText: periodic ? `${d.min} min/day` : `${d.min} min`,
    keywords: d.kw || [],
    carbonSavingKgCO2e: perQtyDefault,
    totalCycleCarbonSavingKg: cycleTotal,
    carbonPerQuantityKgCO2e: i.isQuantitative ? i.carbonPerQuantity : 0,
    waterSavingLitres: waterSaving,
    impactUnit: i.isQuantitative ? i.unit : 'Qualitative impact (no CO₂e figure)',
    impactQuantity: i.isQuantitative ? i.quantity : 0,
    impactQuantityUnit: i.isQuantitative ? i.quantityUnit : '',
    impactBasisDays: i.isQuantitative ? multiplier : 0,
    impactDuration: i.isQuantitative
      ? periodic
        ? `${d.req} successful check-ins in a ${d.durationDays}-day challenge`
        : i.persistDays > 1
        ? `Projected over ${i.persistDays} days after completion`
        : 'Per completion'
      : 'Not quantified',
    impactDescription: estimate,
    calculationMethod: i.isQuantitative ? i.calc : 'Qualitative assessment',
    emissionFactor: i.isQuantitative ? i.factor : 'Not applicable (qualitative habit)',
    assumptions: [i.assume || 'Foundational habit with qualitative ecological or behavioral benefits; avoided emissions are either accounted under downstream actions or non-quantifiable.', SOURCES].filter(Boolean).join(' '),
    impactType: i.impactType,
    isQuantitativeImpact: Boolean(i.isQuantitative),
    allowsQuantityInput: Boolean(i.isQuantitative && i.maxQuantity),
    quantityInputLabel: i.inputLabel || '',
    defaultQuantityValue: i.isQuantitative ? i.quantity : 1,
    maxQuantityValue: i.isQuantitative ? i.maxQuantity || i.quantity : 0,
    isActive: true,
  };
}

const ACTIVITY_CATALOG = DEFS.map(build);

/**
 * Backend-authoritative carbon calculation for one completed check-in/action.
 * `quantity` is user input and is clamped; carbon is never taken from the client.
 */
function computeCarbonSaving(activity, quantity) {
  if (!activity || !activity.isQuantitativeImpact || !activity.carbonPerQuantityKgCO2e) return 0;
  let qty = Number(quantity);
  if (!activity.allowsQuantityInput || !Number.isFinite(qty) || qty <= 0) {
    qty = activity.defaultQuantityValue || 1;
  }
  qty = Math.min(qty, activity.maxQuantityValue || qty);
  return Math.round(activity.carbonPerQuantityKgCO2e * qty * 1e6) / 1e6;
}

module.exports = { ACTIVITY_CATALOG, CATEGORY_META, computeCarbonSaving, EMISSION_SOURCES: SOURCES, EMISSION_FACTORS: { GRID, KM, ...F } };
