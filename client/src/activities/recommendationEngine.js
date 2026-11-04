/**
 * Mission LiFE: Personalized Recommendation & Carbon Impact Engine
 *
 * Takes an activity, user's baseline questionnaire responses, and produces:
 *  - Current baseline usage
 *  - Recommended realistic target & reduction
 *  - Estimated resource savings (kWh, Litres, km, kg waste)
 *  - Estimated carbon savings (kg CO2e) with transparent formulas, emission factors & assumptions
 *  - A progressive 7-day personalized actionable plan
 *  - Adaptive difficulty rules
 *
 * All factors are India-specific (CEA grid factor 0.71 kg CO2e/kWh, ARAI/IPCC vehicle factors, etc.)
 */

const INDIA_GRID_FACTOR = 0.71; // Central Electricity Authority (CEA) CO2 Baseline Database v19 (kg CO2e / kWh)
const PETROL_CAR_FACTOR = 0.165; // kg CO2e / km (ARAI / BEE standard passenger car)
const DIESEL_CAR_FACTOR = 0.185; // kg CO2e / km
const TWO_WHEELER_FACTOR = 0.042; // kg CO2e / km (average 110-150cc scooter/motorcycle)
const MUNICIPAL_WATER_FACTOR = 0.00045; // kg CO2e / Litre (energy for municipal extraction, treatment, and distribution pumping)
const HOT_WATER_HEATING_KWH_PER_LITRE = 0.035; // ~35 Wh to raise 1 L of water by 30°C in an electric geyser
const FOOD_WASTE_FACTOR = 2.5; // kg CO2e avoided per kg food waste diverted (IPCC / FAO)
const PAPER_RECYCLE_FACTOR = 0.95; // kg CO2e avoided per kg clean paper recycled (IPCC)

const round2 = (n) => Math.round(n * 100) / 100;
const round3 = (n) => Math.round(n * 1000) / 1000;

/**
 * Generate a personalized recommendation, resource calculation, and progressive plan.
 *
 * @param {string} activityId
 * @param {Object} responses - Form responses from the questionnaire
 * @param {Object} activity - Activity catalog definition
 * @returns {Object} Personalized recommendation bundle
 */
function generatePersonalizedPlan(activityId, responses = {}, activity = {}) {
  const r = responses || {};
  const durationDays = activity.durationDays || 7;
  const ecoScore = activity.ecoScoreReward || 5;
  const greenPoints = activity.greenPointsReward || 20;

  let currentUsage = '';
  let recommendedTarget = '';
  let recommendedReduction = '';
  let resourceSavings = { amount: 0, unit: '', formatted: '' };
  let carbonSavings = {
    isQuantitative: true,
    perDayKgCO2e: 0,
    totalCycleKgCO2e: 0,
    formula: '',
    emissionFactor: '',
    assumptions: '',
    formatted: '',
  };
  let dailyPlan = [];
  let adaptiveRules = {
    onSuccess: 'Maintain target or increase by 15% next cycle.',
    onStruggle: 'Reduce target by 20% to prioritize habit consistency.',
  };

  // -------------------------------------------------------------------------
  // ENERGY CONSERVATION
  // -------------------------------------------------------------------------
  if (activityId === 'energy_reduce_ac') {
    const dailyHours = Number(r.daily_ac_hours) || 8;
    const acTypeKw = r.ac_type === 'inverter_5star' ? 1.0 : r.ac_type === 'fixed_speed' ? 1.6 : r.ac_type === 'window_old' ? 1.8 : 1.3;
    // Gradual recommendation: reduce by 1 hour if usage >= 4 hours, else 0.5 hours
    const reductionHours = dailyHours >= 5 ? 1.0 : 0.5;
    const targetHours = Math.max(0, dailyHours - reductionHours);
    const kwhSavedDaily = reductionHours * acTypeKw;
    const co2Daily = kwhSavedDaily * INDIA_GRID_FACTOR;
    const co2Total = co2Daily * durationDays;

    currentUsage = `${dailyHours} hours/day`;
    recommendedTarget = `${targetHours} hours/day`;
    recommendedReduction = `${reductionHours} hour/day reduction (${round2((reductionHours / dailyHours) * 100)}% cut)`;
    resourceSavings = {
      amount: round2(kwhSavedDaily * durationDays),
      unit: 'kWh over 7 days',
      formatted: `${round2(kwhSavedDaily * 7)} kWh electricity saved per week`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2Daily),
      totalCycleKgCO2e: round3(co2Total),
      formula: `${reductionHours} h avoided × ${acTypeKw} kW × ${INDIA_GRID_FACTOR} kg CO₂e/kWh`,
      emissionFactor: `${INDIA_GRID_FACTOR} kg CO₂e/kWh (Central Electricity Authority CEA v19)`,
      assumptions: `Based on your ${acTypeKw} kW AC rating and ${reductionHours} h/day operating reduction.`,
      formatted: `Saves ~${round2(co2Daily)} kg CO₂e/day (≈ ${round2(co2Total)} kg CO₂e over 7 days)`,
    };
    dailyPlan = [
      { day: 1, action: `Switch off the AC 30 minutes earlier in the morning and switch on ceiling fan.` },
      { day: 2, action: `Set the AC sleep timer to turn off 45 minutes before wake-up time.` },
      { day: 3, action: `Keep bedroom door tightly closed to retain coolness, meeting the ${targetHours} h target.` },
      { day: 4, action: `Run ceiling fan on medium speed to sustain comfort without extending AC run time.` },
      { day: 5, action: `Audit room curtains to block afternoon heat radiation, preventing thermal buildup.` },
      { day: 6, action: `Verify your AC remote timer is locked in for the new ${targetHours} h daily limit.` },
      { day: 7, action: `Reflect on comfort: you saved ~${round2(kwhSavedDaily * 7)} kWh this week without sacrificing sleep quality!` },
    ];
  } else if (activityId === 'energy_switch_off_unused') {
    const count = Number(r.standby_devices_count) || 5;
    const idleHours = Number(r.standby_duration_hours) || 10;
    // Average standby draw ~6W per plugged device (chargers, TV board, monitors, set-top box)
    const wattsSaved = count * 6;
    const kwhDaily = (wattsSaved * idleHours) / 1000;
    const co2Daily = kwhDaily * INDIA_GRID_FACTOR;
    const co2Total = co2Daily * durationDays;

    currentUsage = `${count} devices left plugged in (~${idleHours} hours idle)`;
    recommendedTarget = `Switch off wall switches for all ${count} devices before bed`;
    recommendedReduction = `Eliminate ${round2(kwhDaily * 1000)} Wh/day idle vampire draw`;
    resourceSavings = {
      amount: round2(kwhDaily * durationDays),
      unit: 'kWh/week',
      formatted: `${round2(kwhDaily * 7)} kWh standby electricity eliminated per week`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2Daily),
      totalCycleKgCO2e: round3(co2Total),
      formula: `${count} devices × 6W standby × ${idleHours} h / 1000 × ${INDIA_GRID_FACTOR} kg CO₂e/kWh`,
      emissionFactor: `${INDIA_GRID_FACTOR} kg CO₂e/kWh (CEA Grid factor)`,
      assumptions: `Estimates ~6 Watts standby vampire consumption per active wall outlet fixture.`,
      formatted: `Saves ~${round2(co2Daily)} kg CO₂e/day (≈ ${round2(co2Total)} kg CO₂e over 7 days)`,
    };
    dailyPlan = [
      { day: 1, action: `Turn off the TV and set-top box at the main wall switch before going to sleep.` },
      { day: 2, action: `Unplug laptop and mobile phone chargers once battery reaches 80-90%.` },
      { day: 3, action: `Check the living room power strip: turn off the master switch at night.` },
      { day: 4, action: `Turn off microwave and kitchen appliance sockets when cooking is done.` },
      { day: 5, action: `Check study desk: turn off external monitor and desktop printer switches.` },
      { day: 6, action: `Maintain complete 6-socket nightly switch-off routine.` },
      { day: 7, action: `Weekly review: you successfully eliminated continuous vampire electricity drain!` },
    ];
  } else if (activityId === 'energy_replace_led') {
    const bulbs = Number(r.bulbs_to_upgrade) || 3;
    const savedWatts = r.existing_bulb_type === 'cfl_24' ? 16 : r.existing_bulb_type === 'tube_40' ? 20 : 51;
    const dailyHours = Number(r.daily_lighting_hours) || 5;
    const kwhDaily = (bulbs * savedWatts * dailyHours) / 1000;
    const co2Daily = kwhDaily * INDIA_GRID_FACTOR;
    const co230Days = co2Daily * 30;

    currentUsage = `${bulbs} conventional bulb(s) running ~${dailyHours} hours/day`;
    recommendedTarget = `Upgrade all ${bulbs} bulb(s) to 9W BEE 5-Star rated LEDs`;
    recommendedReduction = `Reduce lighting power draw by ${bulbs * savedWatts} Watts`;
    resourceSavings = {
      amount: round2(kwhDaily * 30),
      unit: 'kWh over 30 days',
      formatted: `${round2(kwhDaily * 30)} kWh electricity saved each month`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2Daily),
      totalCycleKgCO2e: round3(co230Days),
      formula: `${bulbs} bulbs × ${savedWatts}W saved × ${dailyHours} h / 1000 × ${INDIA_GRID_FACTOR} kg CO₂e/kWh`,
      emissionFactor: `${INDIA_GRID_FACTOR} kg CO₂e/kWh (India Grid)`,
      assumptions: `Projected over 30-day initial operational period with 9W BEE LED retrofit.`,
      formatted: `Saves ~${round2(co2Daily)} kg CO₂e/day (≈ ${round2(co230Days)} kg CO₂e monthly)`,
    };
    dailyPlan = [
      { day: 1, action: `Inspect and purchase ${bulbs} standard B22 base 9W LED bulb(s).` },
      { day: 2, action: `Safely replace the old bulb in the most frequently used living/study area.` },
      { day: 3, action: `Replace remaining conventional fixtures and confirm bright warm/cool illumination.` },
      { day: 4, action: `Safely store or recycle old working bulbs without shattering.` },
      { day: 5, action: `Notice how LEDs stay completely cool to the touch, reducing ambient room heat.` },
      { day: 6, action: `Confirm all primary household sockets are now LED-equipped.` },
      { day: 7, action: `One-time upgrade complete! Enjoy 80% lower lighting power draw for years.` },
    ];
  } else if (activityId === 'energy_ac_set_temp') {
    const currentTemp = Number(r.current_remote_temp) || 20;
    const dailyHours = Number(r.daily_run_hours) || 8;
    const targetTemp = Math.min(26, Math.max(24, currentTemp + 2));
    const tempIncrease = Math.max(1, targetTemp - currentTemp);
    // 6% savings per 1 deg C increase on a 1.4 kW AC
    const kwhSavedDaily = dailyHours * 1.4 * (tempIncrease * 0.06);
    const co2Daily = kwhSavedDaily * INDIA_GRID_FACTOR;
    const co2Total = co2Daily * durationDays;

    currentUsage = `${currentTemp}°C setting (${dailyHours} hours/day)`;
    recommendedTarget = `${targetTemp}°C thermostat setting with ceiling fan assist`;
    recommendedReduction = `Increase temperature by ${tempIncrease}°C (~${tempIncrease * 6}% compressor power cut)`;
    resourceSavings = {
      amount: round2(kwhSavedDaily * durationDays),
      unit: 'kWh/week',
      formatted: `${round2(kwhSavedDaily * 7)} kWh electricity saved per week`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2Daily),
      totalCycleKgCO2e: round3(co2Total),
      formula: `${dailyHours} h × 1.4 kW × (${tempIncrease} × 6%) × ${INDIA_GRID_FACTOR} kg CO₂e/kWh`,
      emissionFactor: `${INDIA_GRID_FACTOR} kg CO₂e/kWh (BEE / CEA data)`,
      assumptions: `Bureau of Energy Efficiency (BEE) research demonstrates ~6% electricity savings per 1°C increase.`,
      formatted: `Saves ~${round2(co2Daily)} kg CO₂e/day (≈ ${round2(co2Total)} kg CO₂e over 7 days)`,
    };
    dailyPlan = [
      { day: 1, action: `Set AC remote to ${Math.min(targetTemp, currentTemp + 1)}°C and run ceiling fan on speed 2.` },
      { day: 2, action: `Notice the gentle air breeze: thermal comfort feels identical to ${currentTemp}°C.` },
      { day: 3, action: `Reach your recommended target of ${targetTemp}°C tonight.` },
      { day: 4, action: `Maintain ${targetTemp}°C throughout the night without cold shivering.` },
      { day: 5, action: `Keep the remote preset locked at ${targetTemp}°C to avoid accidental reset.` },
      { day: 6, action: `Share this simple tip with family members to maintain consistency.` },
      { day: 7, action: `Habit formed! You permanently cut ~${round2(kwhSavedDaily * 7)} kWh per week with zero discomfort.` },
    ];
  } else if (activityId === 'energy_reduce_geyser') {
    const mins = Number(r.geyser_duration_mins) || 45;
    const geyserKw = r.geyser_power === 'instant_3kw' ? 3.0 : 2.0;
    const targetMins = Math.max(15, mins - 15);
    const savedHours = (mins - targetMins) / 60;
    const kwhSavedDaily = savedHours * geyserKw;
    const co2Daily = kwhSavedDaily * INDIA_GRID_FACTOR;
    const co2Total = co2Daily * durationDays;

    currentUsage = `${mins} mins/day geyser run time (${geyserKw} kW element)`;
    recommendedTarget = `${targetMins} mins/day (turn off as soon as water reaches bath temp)`;
    recommendedReduction = `Reduce geyser on-time by 15 mins daily`;
    resourceSavings = {
      amount: round2(kwhSavedDaily * durationDays),
      unit: 'kWh/week',
      formatted: `${round2(kwhSavedDaily * 7)} kWh heating electricity saved per week`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2Daily),
      totalCycleKgCO2e: round3(co2Total),
      formula: `(15 / 60) h saved × ${geyserKw} kW × ${INDIA_GRID_FACTOR} kg CO₂e/kWh`,
      emissionFactor: `${INDIA_GRID_FACTOR} kg CO₂e/kWh (CEA Grid factor)`,
      assumptions: `Electric storage/instant geysers draw full 2-3 kW continuously while heating.`,
      formatted: `Saves ~${round2(co2Daily)} kg CO₂e/day (≈ ${round2(co2Total)} kg CO₂e over 7 days)`,
    };
    dailyPlan = [
      { day: 1, action: `Switch on geyser exactly 15 minutes before bath and switch off before entering bathroom.` },
      { day: 2, action: `Avoid leaving geyser on standby thermostat for hours after bathing.` },
      { day: 3, action: `Coordinate back-to-back baths with family so one heated tank serves consecutive baths.` },
      { day: 4, action: `Lock in the ${targetMins} min maximum heating routine.` },
      { day: 5, action: `Notice zero loss in water temperature while saving ~${round2(kwhSavedDaily)} kWh.` },
      { day: 6, action: `Maintain morning switch-off discipline.` },
      { day: 7, action: `Challenge complete! You saved ~${round2(kwhSavedDaily * 7)} kWh on water heating this week.` },
    ];
  }

  // -------------------------------------------------------------------------
  // SUSTAINABLE TRANSPORTATION
  // -------------------------------------------------------------------------
  else if (activityId === 'transport_cycle_instead_of_driving') {
    const dist = Number(r.travel_distance_km) || 3.0;
    const kgPerKm = Number(r.displaced_vehicle_factor) || (r.displaced_vehicle === 'motorbike' ? TWO_WHEELER_FACTOR : PETROL_CAR_FACTOR);
    const daysCycling = Number(r.days_per_week_cycling) || 3;
    const roundTripKm = dist * 2;
    const co2PerTrip = roundTripKm * kgPerKm;
    const co2Week = co2PerTrip * daysCycling;

    currentUsage = `Driving motorized vehicle for ${dist} km one-way trips`;
    recommendedTarget = `Bicycle for ${roundTripKm} km round trip on ${daysCycling} days/week`;
    recommendedReduction = `Eliminate ${roundTripKm * daysCycling} km of motorized driving weekly`;
    resourceSavings = {
      amount: round2(roundTripKm * daysCycling),
      unit: 'km/week',
      formatted: `${roundTripKm * daysCycling} km of motorized vehicle travel eliminated weekly`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2PerTrip),
      totalCycleKgCO2e: round3(co2Week),
      formula: `${roundTripKm} km round trip × ${kgPerKm} kg CO₂e/km (${r.displaced_vehicle || 'petrol car'})`,
      emissionFactor: `${kgPerKm} kg CO₂e/km (ARAI / IPCC tailpipe factor)`,
      assumptions: `Assumes zero tailpipe emissions from bicycle vs direct avoided fuel combustion.`,
      formatted: `Saves ~${round2(co2PerTrip)} kg CO₂e per cycling day (≈ ${round2(co2Week)} kg CO₂e/week)`,
    };
    dailyPlan = [
      { day: 1, action: `Check bicycle tyre pressure, brakes and chain oil.` },
      { day: 2, action: `Cycle for Day 1: complete your ${dist} km trip by bicycle. Log distance in check-in!` },
      { day: 3, action: `Rest or short errand ride; plan route with shade and lower traffic.` },
      { day: 4, action: `Cycle for Day 2: pedal your ${dist} km journey. Enjoy clean morning air.` },
      { day: 5, action: `Carry a small water bottle and backpack for comfort.` },
      { day: 6, action: `Cycle for Day 3: complete your third cycling day of the week.` },
      { day: 7, action: `Week complete! You eliminated ${roundTripKm * daysCycling} km of motor pollution and burned ~600 kcal!` },
    ];
  } else if (activityId === 'transport_walk_cycle') {
    const trips = Number(r.short_trips_per_week) || 7;
    const dist = Number(r.average_trip_distance_km) || 1.2;
    const kgPerKm = r.current_vehicle_used === 'petrol_car' ? PETROL_CAR_FACTOR : TWO_WHEELER_FACTOR;
    const targetTrips = Math.min(trips, 5);
    const kmAvoidedWeekly = targetTrips * (dist * 2);
    const co2Week = kmAvoidedWeekly * kgPerKm;
    const co2PerCheckin = co2Week / targetTrips;

    currentUsage = `${trips} neighborhood errand trips/week using motor vehicle`;
    recommendedTarget = `Walk or cycle for at least ${targetTrips} errand trips this week`;
    recommendedReduction = `Eliminate ${round2(kmAvoidedWeekly)} km of cold-engine short trips`;
    resourceSavings = {
      amount: round2(kmAvoidedWeekly),
      unit: 'km/week',
      formatted: `${round2(kmAvoidedWeekly)} km of cold-start motor trips replaced`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2PerCheckin),
      totalCycleKgCO2e: round3(co2Week),
      formula: `${dist * 2} km round trip × ${kgPerKm} kg CO₂e/km`,
      emissionFactor: `${kgPerKm} kg CO₂e/km (Short trip cold engine)`,
      assumptions: `Short motorized trips run on cold engines, producing higher tailpipe pollutants per km.`,
      formatted: `Saves ~${round2(co2PerCheckin)} kg CO₂e per walk (≈ ${round2(co2Week)} kg CO₂e/week)`,
    };
    dailyPlan = [
      { day: 1, action: `Walk to the local dairy or grocery store (~${dist} km) with a reusable cloth tote bag.` },
      { day: 2, action: `Walk or pedal for your evening neighborhood errand.` },
      { day: 3, action: `Step out on foot for pharmacy / stationery run.` },
      { day: 4, action: `Choose walking instead of starting the scooter for local errands.` },
      { day: 5, action: `Combine nearby shops into a brisk 20-minute neighborhood walk.` },
      { day: 6, action: `Complete your 5th active walking errand of the week.` },
      { day: 7, action: `Challenge accomplished! You made local active transit your default habit.` },
    ];
  } else if (activityId === 'transport_public_transit') {
    const km = Number(r.one_way_commute_km) || 10;
    const days = Number(r.commute_days_per_week) || 5;
    const netSavingPerKm = r.current_private_mode === 'solo_two_wheeler' ? 0.025 : 0.13;
    const kmAvoidedWeekly = km * 2 * days;
    const co2Week = kmAvoidedWeekly * netSavingPerKm;
    const co2PerDay = co2Week / days;

    currentUsage = `Private motorized commute for ${km} km one-way`;
    recommendedTarget = `Take ${r.available_transit_system || 'BRTS / Metro'} on at least 3-4 commute days this week`;
    recommendedReduction = `Shift ${km * 2} km daily commute to shared high-efficiency mass transit`;
    resourceSavings = {
      amount: round2(kmAvoidedWeekly),
      unit: 'km/week',
      formatted: `${kmAvoidedWeekly} km of private vehicle road miles removed weekly`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2PerDay),
      totalCycleKgCO2e: round3(co2Week),
      formula: `${km * 2} km × ${netSavingPerKm} kg CO₂e net saving/km`,
      emissionFactor: `Net ${netSavingPerKm} kg CO₂e/passenger-km reduction over solo private car`,
      assumptions: `Displacing single-occupancy vehicle with high-capacity urban mass transit (BRTS/Metro).`,
      formatted: `Saves ~${round2(co2PerDay)} kg CO₂e per transit day (≈ ${round2(co2Week)} kg CO₂e/week)`,
    };
    dailyPlan = [
      { day: 1, action: `Locate your nearest transit station and check metro/BRTS schedule.` },
      { day: 2, action: `Transit Day 1: Commute via Metro/BRTS. Enjoy reading or relaxing instead of driving stress!` },
      { day: 3, action: `Transit Day 2: Take transit for your return journey as well.` },
      { day: 4, action: `Notice how you avoided peak traffic gridlock and parking hassles.` },
      { day: 5, action: `Transit Day 3: Complete your third public transit commute of the week.` },
      { day: 6, action: `Transit Day 4: Solidify your mass transit routine.` },
      { day: 7, action: `Celebration! You avoided ~${round2(co2Week)} kg CO₂e and contributed to less city smog.` },
    ];
  }

  // -------------------------------------------------------------------------
  // WATER CONSERVATION
  // -------------------------------------------------------------------------
  else if (activityId === 'water_turn_off_tap_brushing') {
    const minsRunning = Number(r.tap_running_minutes) || 2.5;
    const timesDaily = Number(r.routines_per_day) || 2;
    // Standard washbasin tap discharges ~8 L/min
    const litresWastedDaily = minsRunning * 8 * timesDaily;
    const litresSavedWeekly = litresWastedDaily * durationDays;
    const co2Daily = litresWastedDaily * MUNICIPAL_WATER_FACTOR;
    const co2Total = co2Daily * durationDays;

    currentUsage = `Tap running ~${minsRunning} mins while brushing/shaving (${timesDaily}x daily)`;
    recommendedTarget = `Close faucet tightly while brushing; open only for final 10-second rinse`;
    recommendedReduction = `Save ${round2(litresWastedDaily)} liters of treated drinking water daily`;
    resourceSavings = {
      amount: round2(litresSavedWeekly),
      unit: 'litres/week',
      formatted: `${round2(litresSavedWeekly)} litres of water conserved per week`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2Daily),
      totalCycleKgCO2e: round3(co2Total),
      formula: `${litresWastedDaily} L saved/day × ${MUNICIPAL_WATER_FACTOR} kg CO₂e/L (water pumping energy)`,
      emissionFactor: `${MUNICIPAL_WATER_FACTOR} kg CO₂e/L (municipal extraction & distribution pumping energy)`,
      assumptions: `Washbasin aerated tap flow of ~8 Litres per minute running unattended.`,
      formatted: `Saves ${round2(litresWastedDaily)} L water/day (≈ ${round2(litresSavedWeekly)} L & ~${round3(co2Total)} kg CO₂e/week)`,
    };
    dailyPlan = [
      { day: 1, action: `Wet toothbrush, shut tap completely with a firm twist, scrub teeth for 2 minutes.` },
      { day: 2, action: `Use a small rinse tumbler instead of cupping hands under running water.` },
      { day: 3, action: `Apply the same closed-tap habit during morning shaving / face washing.` },
      { day: 4, action: `Notice how clean the sink stays without continuous tap splash.` },
      { day: 5, action: `Keep the rinse tumbler beside the toothbrush stand as a visual trigger.` },
      { day: 6, action: `Check in: you have saved over 100 liters of treated water in just 6 days.` },
      { day: 7, action: `Habit cemented! You eliminated mindless water waste from your daily hygiene.` },
    ];
  } else if (activityId === 'water_reduce_shower_duration') {
    const mins = Number(r.current_shower_mins) || 12;
    const targetMins = Math.max(5, mins - 4);
    const minsSaved = mins - targetMins;
    const litresSavedDaily = minsSaved * 12; // 12 L/min overhead shower
    const hasGeyser = r.shower_water_heated !== 'ambient_water';
    const kwhHeatingSavedDaily = hasGeyser ? (litresSavedDaily * HOT_WATER_HEATING_KWH_PER_LITRE) : 0;
    const co2Daily = (kwhHeatingSavedDaily * INDIA_GRID_FACTOR) + (litresSavedDaily * MUNICIPAL_WATER_FACTOR);
    const co2Total = co2Daily * durationDays;

    currentUsage = `${mins} minutes overhead shower (~${mins * 12} L/day)`;
    recommendedTarget = `${targetMins} minutes shower (cut duration by ${minsSaved} mins)`;
    recommendedReduction = `Save ${litresSavedDaily} litres of water & heating energy daily`;
    resourceSavings = {
      amount: round2(litresSavedDaily * durationDays),
      unit: 'litres/week',
      formatted: `${round2(litresSavedDaily * 7)} litres of water conserved per week`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2Daily),
      totalCycleKgCO2e: round3(co2Total),
      formula: `${litresSavedDaily} L saved (${hasGeyser ? `+ ${round2(kwhHeatingSavedDaily)} kWh heating avoided` : 'pumping energy'})`,
      emissionFactor: `${INDIA_GRID_FACTOR} kg CO₂e/kWh geyser + ${MUNICIPAL_WATER_FACTOR} kg CO₂e/L pumping`,
      assumptions: `12 L/min showerhead flow rate; electric geyser heating ~${HOT_WATER_HEATING_KWH_PER_LITRE} kWh per litre heated.`,
      formatted: `Saves ~${round2(co2Daily)} kg CO₂e/day (≈ ${round2(co2Total)} kg CO₂e & ${litresSavedDaily * 7} L/week)`,
    };
    dailyPlan = [
      { day: 1, action: `Set a 8-minute shower timer on your phone or play two short 4-minute songs.` },
      { day: 2, action: `Turn off shower while lathering soap and shampoo, turning on only to rinse.` },
      { day: 3, action: `Hit your new ${targetMins}-minute target effortlessly.` },
      { day: 4, action: `Notice how refreshing and brisk a mindful shower feels.` },
      { day: 5, action: `Keep the musical timer going to stay on track.` },
      { day: 6, action: `Check in: you've conserved hundreds of liters of water this week.` },
      { day: 7, action: `Excellent! You achieved high personal hygiene with minimal environmental footprint.` },
    ];
  } else if (activityId === 'water_bucket_bath') {
    const baths = Number(r.baths_per_week) || 7;
    const litresSavedPerBath = 80; // 100 L shower replaced by 20 L bucket
    const litresSavedWeekly = baths * litresSavedPerBath;
    const co2Week = litresSavedWeekly * MUNICIPAL_WATER_FACTOR;
    const co2PerDay = co2Week / baths;

    currentUsage = `Overhead power shower (~100 L per bath)`;
    recommendedTarget = `Single bucket bath (~20 L) for at least 5 days this week`;
    recommendedReduction = `Save 80 litres of water per bathing routine`;
    resourceSavings = {
      amount: round2(litresSavedWeekly),
      unit: 'litres/week',
      formatted: `${litresSavedWeekly} litres of water conserved weekly`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2PerDay),
      totalCycleKgCO2e: round3(co2Week),
      formula: `80 L saved/bath × ${MUNICIPAL_WATER_FACTOR} kg CO₂e/L pumping`,
      emissionFactor: `${MUNICIPAL_WATER_FACTOR} kg CO₂e/L (water pumping factor)`,
      assumptions: `Replaces ~100 L overhead shower with standard 18-20 L bathing bucket.`,
      formatted: `Saves 80 L water per bath (≈ ${litresSavedWeekly} L saved per week)`,
    };
    dailyPlan = [
      { day: 1, action: `Fill one standard 18-20 L bucket with water. Avoid touching the showerhead!` },
      { day: 2, action: `Take your bucket bath using a mug. Notice you feel equally fresh and clean.` },
      { day: 3, action: `Continue the bucket bath routine for Day 3.` },
      { day: 4, action: `Enjoy how much control you have over water volume and temperature.` },
      { day: 5, action: `Take bucket bath for Day 5: 400 litres saved so far!` },
      { day: 6, action: `Maintain the traditional Indian water-conserving bucket bath.` },
      { day: 7, action: `Outstanding! You saved ~${litresSavedWeekly} litres of treated water this week alone.` },
    ];
  }

  // -------------------------------------------------------------------------
  // WASTE MANAGEMENT
  // -------------------------------------------------------------------------
  else if (activityId === 'waste_avoid_food_waste') {
    const servings = Number(r.food_portions_wasted_weekly) || 4;
    const servingGrams = Number(r.average_serving_weight_grams) || 250;
    const targetServings = Math.max(0, servings - 3);
    const kgSavedWeekly = ((servings - targetServings) * servingGrams) / 1000;
    const co2Week = kgSavedWeekly * FOOD_WASTE_FACTOR;
    const co2Daily = co2Week / durationDays;

    currentUsage = `Discarding ~${servings} cooked food portions/week (~${round2((servings * servingGrams) / 1000)} kg/week)`;
    recommendedTarget = `Zero edible cooked food waste (store leftovers promptly)`;
    recommendedReduction = `Divert ${round2(kgSavedWeekly)} kg of edible food from landfill per week`;
    resourceSavings = {
      amount: round2(kgSavedWeekly),
      unit: 'kg food/week',
      formatted: `${round2(kgSavedWeekly)} kg of edible cooked food saved per week`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2Daily),
      totalCycleKgCO2e: round3(co2Week),
      formula: `${round2(kgSavedWeekly)} kg food saved × ${FOOD_WASTE_FACTOR} kg CO₂e/kg (IPCC avoided landfill methane & lifecycle)`,
      emissionFactor: `${FOOD_WASTE_FACTOR} kg CO₂e / kg food waste avoided`,
      assumptions: `Food rotting in anaerobic landfills releases potent methane (CH₄); lifecycle factor includes agricultural production emissions.`,
      formatted: `Saves ~${round2(co2Daily)} kg CO₂e/day (≈ ${round2(co2Week)} kg CO₂e/week)`,
    };
    dailyPlan = [
      { day: 1, action: `Serve smaller initial portions on plates; take a second helping only if still hungry.` },
      { day: 2, action: `Store leftover dal / subzi in airtight containers in the front of the fridge.` },
      { day: 3, action: `Repurpose leftover roti / rice into poha, fried rice, or parathas for breakfast.` },
      { day: 4, action: `Audit the refrigerator vegetable crisper: cook older vegetables first.` },
      { day: 5, action: `Freeze excess cooked food if going out of town over the weekend.` },
      { day: 6, action: `Check in: zero cooked food scraped into the dustbin today.` },
      { day: 7, action: `Clean plate week accomplished! You saved food, money and averted landfill methane.` },
    ];
  } else if (activityId === 'waste_reusable_bottle') {
    const bottlesWeekly = Number(r.disposable_bottles_per_week) || 4;
    const plasticGramsPerBottle = 25; // 25g PET per 1L bottle
    const kgPlasticSavedWeekly = (bottlesWeekly * plasticGramsPerBottle) / 1000;
    // ~3 kg CO2e per 1 kg PET manufacturing & incineration/landfill
    const co2Week = kgPlasticSavedWeekly * 3.0;
    const co2Daily = co2Week / durationDays;

    currentUsage = `Buying ~${bottlesWeekly} single-use PET water bottles/week`;
    recommendedTarget = `Carry a refillable stainless steel / copper bottle every time you leave home`;
    recommendedReduction = `Eliminate ${bottlesWeekly} disposable plastic bottles per week`;
    resourceSavings = {
      amount: bottlesWeekly,
      unit: 'bottles/week',
      formatted: `${bottlesWeekly} single-use plastic bottles avoided weekly`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2Daily),
      totalCycleKgCO2e: round3(co2Week),
      formula: `${bottlesWeekly} bottles × 25g PET / 1000 × 3.0 kg CO₂e/kg PET`,
      emissionFactor: `3.0 kg CO₂e / kg virgin PET plastic lifecycle`,
      assumptions: `Embodied petroleum extraction, blow-moulding, transport, and disposal of PET bottles.`,
      formatted: `Saves ${bottlesWeekly} plastic bottles & ~${round2(co2Week)} kg CO₂e/week`,
    };
    dailyPlan = [
      { day: 1, action: `Rinse and fill your reusable bottle with drinking water before leaving home.` },
      { day: 2, action: `Keep the bottle inside your daily commuter bag or vehicle cup holder.` },
      { day: 3, action: `Refill at office / college water coolers instead of buying packaged bottles.` },
      { day: 4, action: `Say a polite "No thank you" to disposable plastic water bottles at meetings.` },
      { day: 5, action: `Notice how cold and fresh water tastes from a steel flask.` },
      { day: 6, action: `Maintain your zero-disposable-bottle streak.` },
      { day: 7, action: `Week complete! You kept ${bottlesWeekly} bottles out of roadside litter and landfills.` },
    ];
  } else if (activityId === 'waste_compost') {
    const wetKgDaily = Number(r.daily_wet_waste_kg) || 0.8;
    const kgWetWeekly = wetKgDaily * durationDays;
    // Composting diverts organic waste from anaerobic landfill where it produces methane (CH4)
    // Avoids ~0.5 kg CO2e per kg organic waste composted
    const co2Daily = wetKgDaily * 0.5;
    const co2Total = co2Daily * durationDays;

    currentUsage = `Disposing ${wetKgDaily} kg/day kitchen vegetable/fruit waste in municipal cart`;
    recommendedTarget = `Compost 100% of organic fruit peels, coffee grounds and vegetable trimmings at home`;
    recommendedReduction = `Divert ${round2(kgWetWeekly)} kg organic waste from landfills this week`;
    resourceSavings = {
      amount: round2(kgWetWeekly),
      unit: 'kg organic waste/week',
      formatted: `${round2(kgWetWeekly)} kg kitchen waste converted to black gold compost`,
    };
    carbonSavings = {
      isQuantitative: true,
      perDayKgCO2e: round3(co2Daily),
      totalCycleKgCO2e: round3(co2Total),
      formula: `${wetKgDaily} kg/day × 0.5 kg CO₂e/kg (avoided anaerobic landfill methane)`,
      emissionFactor: `0.5 kg CO₂e/kg organic waste diverted from municipal dumps (IPCC Waste Model)`,
      assumptions: `Aerobic home composting prevents anaerobic bacterial methane formation in dumpsites.`,
      formatted: `Saves ~${round2(co2Daily)} kg CO₂e/day (≈ ${round2(co2Total)} kg CO₂e & ${round2(kgWetWeekly)} kg waste/week)`,
    };
    dailyPlan = [
      { day: 1, action: `Set up a perforated earthen pot (khamba) or aerated plastic bin on your balcony.` },
      { day: 2, action: `Add a 2-inch base layer of dry brown leaves, coco peat, or torn cardboard.` },
      { day: 3, action: `Add today's kitchen vegetable peels and fruit scraps (green layer).` },
      { day: 4, action: `Sprinkle a handful of dry leaves or sour buttermilk to accelerate beneficial microbes.` },
      { day: 5, action: `Turn compost with a small trowel to ensure aeration and prevent any foul smell.` },
      { day: 6, action: `Continue daily green + brown layering: zero wet waste sent to municipal cart!` },
      { day: 7, action: `7-day compost batch active! In 4-6 weeks you will have nutrient-rich organic soil.` },
    ];
  }

  // -------------------------------------------------------------------------
  // GENERAL FALLBACK FOR OTHER QUANTITATIVE & QUALITATIVE ACTIVITIES
  // -------------------------------------------------------------------------
  else {
    const perQtyDefault = activity.carbonSavingKgCO2e || 0.05;
    const cycleTotal = activity.totalCycleCarbonSavingKg || (perQtyDefault * durationDays);
    const isQuant = Boolean(activity.isQuantitativeImpact);

    currentUsage = `Current baseline: standard household usage`;
    recommendedTarget = `Adopt daily Mission LiFE sustainable practice`;
    recommendedReduction = `Consistent practice on at least ${activity.requiredCheckIns || 5} of 7 days`;
    resourceSavings = {
      amount: round2(perQtyDefault * (activity.requiredCheckIns || 5)),
      unit: activity.impactUnit || 'units saved',
      formatted: isQuant
        ? `Conserves resources throughout the ${durationDays}-day cycle`
        : 'Qualitative ecological & behavioral benefits',
    };
    carbonSavings = {
      isQuantitative: isQuant,
      perDayKgCO2e: round3(perQtyDefault),
      totalCycleKgCO2e: round3(cycleTotal),
      formula: isQuant ? activity.calculationMethod || 'Behavioral reduction × India emission factor' : 'Qualitative assessment',
      emissionFactor: isQuant ? activity.emissionFactor || `${INDIA_GRID_FACTOR} kg CO₂e/kWh` : 'Not applicable (qualitative habit)',
      assumptions: activity.assumptions || 'Standard Mission LiFE behavioral footprint assumptions.',
      formatted: isQuant
        ? `Estimated ~${round2(perQtyDefault)} kg CO₂e per completion (≈ ${round2(cycleTotal)} kg CO₂e total)`
        : 'Qualitative environmental benefit (no fabricated numbers)',
    };
    dailyPlan = [
      { day: 1, action: `Prepare and begin: take the first concrete step for ${activity.title}.` },
      { day: 2, action: `Integrate the habit into your daily schedule: check in today!` },
      { day: 3, action: `Refine your method: eliminate friction to make it effortless.` },
      { day: 4, action: `Mid-challenge consistency check: maintain the positive routine.` },
      { day: 5, action: `Observe the tangible household and environmental difference.` },
      { day: 6, action: `Penultimate check-in: your habit is becoming second nature.` },
      { day: 7, action: `Challenge complete! Consolidate your progress and earn +${ecoScore} EcoScore & +${greenPoints} GP.` },
    ];
  }

  return {
    activityId,
    activityTitle: activity.title,
    currentUsage,
    recommendedTarget,
    recommendedReduction,
    resourceSavings,
    carbonSavings,
    dailyPlan,
    adaptiveRules,
    rewards: {
      ecoScoreReward: ecoScore,
      greenPointsReward: greenPoints,
    },
    durationDays,
    requiredCheckIns: activity.requiredCheckIns || (durationDays === 1 ? 1 : 6),
    generatedAt: new Date().toISOString(),
    isPersonalized: true,
  };
}

module.exports = {
  generatePersonalizedPlan,
  INDIA_GRID_FACTOR,
  PETROL_CAR_FACTOR,
  DIESEL_CAR_FACTOR,
  TWO_WHEELER_FACTOR,
  MUNICIPAL_WATER_FACTOR,
  FOOD_WASTE_FACTOR,
  PAPER_RECYCLE_FACTOR,
};
