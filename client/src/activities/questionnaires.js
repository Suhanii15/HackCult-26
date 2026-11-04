/**
 * Questionnaire configurations for all 59 Mission LiFE activities.
 * Every activity has an assessment questionnaire that gathers the user's
 * specific baseline habit to compute personalized targets, resource savings,
 * and real carbon impact.
 *
 * Question types:
 *  - 'slider': continuous or stepped numeric range (min, max, step, unit, defaultValue)
 *  - 'radio': mutually exclusive options with visual cards (options: [{ id, label, description, icon, value }])
 *  - 'dropdown': selector for equipment, vehicle or appliance choices
 *  - 'stepper': integer counter (+ / -) for item counts or days/week
 *  - 'multiselect': multi-choice checkboxes for options/constraints
 */

const QUESTIONNAIRES = {
  // =========================================================================
  // 1. ENERGY CONSERVATION (15 Activities)
  // =========================================================================

  energy_switch_off_unused: {
    activityId: 'energy_switch_off_unused',
    title: 'Standby Power Assessment',
    subtitle: 'Measure vampire load from devices plugged in overnight',
    questions: [
      {
        id: 'standby_devices_count',
        type: 'stepper',
        label: 'How many electronics or chargers stay plugged into the wall 24/7?',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 5,
        unit: 'appliances',
        hint: 'TVs, set-top boxes, Wi-Fi routers, phone/laptop chargers, gaming consoles',
      },
      {
        id: 'night_switch_off_habit',
        type: 'radio',
        label: 'Do you currently switch off wall sockets before sleeping?',
        options: [
          { id: 'never', label: 'Rarely / Never', description: 'Left on all night standby', icon: '🔴', factor: 1.0 },
          { id: 'sometimes', label: 'Sometimes (1-2 days/week)', description: 'Occasionally turned off', icon: '🟡', factor: 0.75 },
          { id: 'often', label: 'Most nights', description: 'Already vigilant, looking to optimize', icon: '🟢', factor: 0.3 },
        ],
        defaultValue: 'never',
      },
      {
        id: 'standby_duration_hours',
        type: 'slider',
        label: 'How many hours are these devices left idle/standby per day?',
        min: 4,
        max: 20,
        step: 1,
        defaultValue: 10,
        unit: 'hours/day',
      },
    ],
  },

  energy_reduce_ac: {
    activityId: 'energy_reduce_ac',
    title: 'AC Lifestyle Assessment',
    subtitle: 'Evaluate your cooling patterns to set a gradual, comfortable reduction',
    questions: [
      {
        id: 'daily_ac_hours',
        type: 'slider',
        label: 'How many hours per day do you typically run your air conditioner?',
        min: 1,
        max: 20,
        step: 0.5,
        defaultValue: 8,
        unit: 'hours/day',
      },
      {
        id: 'ac_type',
        type: 'dropdown',
        label: 'What type of air conditioner is installed?',
        options: [
          { id: 'inverter_5star', label: 'Inverter 5-Star (High Efficiency, ~1.0 kW)', kw: 1.0 },
          { id: 'inverter_3star', label: 'Inverter 3-Star (Standard Inverter, ~1.3 kW)', kw: 1.3 },
          { id: 'fixed_speed', label: 'Non-Inverter / Split 1.5 Ton (~1.6 kW)', kw: 1.6 },
          { id: 'window_old', label: 'Window AC / Older Unit (~1.8 kW)', kw: 1.8 },
        ],
        defaultValue: 'inverter_3star',
      },
      {
        id: 'current_thermostat_temp',
        type: 'radio',
        label: 'What temperature do you typically set on the remote?',
        options: [
          { id: 'cold_18_20', label: '18°C – 20°C', description: 'Maximum compressor load', icon: '❄️', temp: 19 },
          { id: 'chilly_21_23', label: '21°C – 23°C', description: 'Common cooling range', icon: '🌬️', temp: 22 },
          { id: 'optimal_24_26', label: '24°C – 26°C', description: 'BEE recommended comfort level', icon: '🌿', temp: 24 },
          { id: 'mild_27_plus', label: '27°C+', description: 'Warm / Assisted by fan', icon: '☀️', temp: 27 },
        ],
        defaultValue: 'chilly_21_23',
      },
      {
        id: 'days_per_week',
        type: 'stepper',
        label: 'How many days per week is the AC operating?',
        min: 1,
        max: 7,
        step: 1,
        defaultValue: 7,
        unit: 'days/week',
      },
    ],
  },

  energy_switch_off_lights: {
    activityId: 'energy_switch_off_lights',
    title: 'Lighting & Fan Habits',
    subtitle: 'Identify avoidable illumination in unoccupied rooms',
    questions: [
      {
        id: 'lights_fans_left_on',
        type: 'stepper',
        label: 'How many lights or fans are typically left running in empty rooms?',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 3,
        unit: 'fixtures',
      },
      {
        id: 'vacant_hours_daily',
        type: 'slider',
        label: 'For approximately how many hours daily do these stay on while unattended?',
        min: 0.5,
        max: 10,
        step: 0.5,
        defaultValue: 3,
        unit: 'hours/day',
      },
      {
        id: 'predominant_fixture_type',
        type: 'radio',
        label: 'What kind of lights are mostly installed in these rooms?',
        options: [
          { id: 'led_fixtures', label: 'LED Bulbs / Battens', description: 'Low wattage (~9–18W)', icon: '💡', watts: 14 },
          { id: 'cfl_tubes', label: 'CFL / Fluorescent Tube lights', description: 'Medium wattage (~36–40W)', icon: '🔦', watts: 38 },
          { id: 'incandescent', label: 'Traditional Filament Bulbs', description: 'High wattage (60W+)', icon: '🟡', watts: 60 },
          { id: 'mix_with_fan', label: 'Mix of Lights + Ceiling Fan', description: 'Average ~80W total load', icon: '🌀', watts: 80 },
        ],
        defaultValue: 'cfl_tubes',
      },
    ],
  },

  energy_replace_led: {
    activityId: 'energy_replace_led',
    title: 'Lighting Upgrade Audit',
    subtitle: 'Calculate savings from upgrading conventional lighting to BEE LEDs',
    questions: [
      {
        id: 'bulbs_to_upgrade',
        type: 'stepper',
        label: 'How many old incandescent bulbs or CFLs are still in use at home?',
        min: 1,
        max: 25,
        step: 1,
        defaultValue: 3,
        unit: 'bulbs',
      },
      {
        id: 'existing_bulb_type',
        type: 'radio',
        label: 'What is the wattage / type of the current bulbs to be replaced?',
        options: [
          { id: 'incandescent_60', label: '60W Incandescent Filament', description: 'Draws ~60W, replaces with 9W LED', icon: '🟡', savedWatts: 51 },
          { id: 'cfl_24', label: '24W–28W CFL Spiral', description: 'Draws ~25W, replaces with 9W LED', icon: '🌀', savedWatts: 16 },
          { id: 'tube_40', label: '40W T8 Fluorescent Rod', description: 'Replaces with 20W LED Batten', icon: '📏', savedWatts: 20 },
        ],
        defaultValue: 'incandescent_60',
      },
      {
        id: 'daily_lighting_hours',
        type: 'slider',
        label: 'How many hours are these primary lights switched on every evening?',
        min: 2,
        max: 14,
        step: 0.5,
        defaultValue: 5,
        unit: 'hours/day',
      },
    ],
  },

  energy_ac_set_temp: {
    activityId: 'energy_ac_set_temp',
    title: 'AC Thermostat Optimization',
    subtitle: 'Every 1°C increase saves ~6% electricity',
    questions: [
      {
        id: 'current_remote_temp',
        type: 'slider',
        label: 'What is your current AC temperature setting?',
        min: 16,
        max: 28,
        step: 1,
        defaultValue: 20,
        unit: '°C',
      },
      {
        id: 'daily_run_hours',
        type: 'slider',
        label: 'How many hours daily is this AC used?',
        min: 2,
        max: 18,
        step: 1,
        defaultValue: 8,
        unit: 'hours/day',
      },
      {
        id: 'use_ceiling_fan',
        type: 'radio',
        label: 'Do you run a ceiling fan along with the AC?',
        options: [
          { id: 'no_fan', label: 'No fan, AC only', description: 'Higher chill demand', icon: '❄️', bonus: 1 },
          { id: 'with_fan', label: 'Yes, on low/medium speed', description: 'Allows higher thermostat with equal comfort', icon: '🌀', bonus: 0 },
        ],
        defaultValue: 'no_fan',
      },
    ],
  },

  energy_fan_not_ac: {
    activityId: 'energy_fan_not_ac',
    title: 'Ceiling Fan Transition',
    subtitle: 'Fans use only ~60W compared to ~1,500W for an air conditioner',
    questions: [
      {
        id: 'hours_ac_can_be_skipped',
        type: 'slider',
        label: 'During mild weather or morning/evening hours, how many AC hours could a ceiling fan replace?',
        min: 1,
        max: 8,
        step: 0.5,
        defaultValue: 2,
        unit: 'hours/day',
      },
      {
        id: 'fan_type',
        type: 'radio',
        label: 'What type of ceiling fan is in the room?',
        options: [
          { id: 'bldc_fan', label: 'BLDC 5-Star Fan (~28W)', description: 'Ultra-low power consumption', icon: '⚡', fanWatts: 28 },
          { id: 'standard_fan', label: 'Standard Induction Fan (~65W)', description: 'Standard residential ceiling fan', icon: '🌀', fanWatts: 65 },
        ],
        defaultValue: 'standard_fan',
      },
    ],
  },

  energy_natural_daylight: {
    activityId: 'energy_natural_daylight',
    title: 'Natural Daylight Harvesting',
    subtitle: 'Cut daytime indoor artificial illumination',
    questions: [
      {
        id: 'daytime_lights_count',
        type: 'stepper',
        label: 'How many lights are turned on indoors during daytime hours (9 AM – 5 PM)?',
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 2,
        unit: 'bulbs/tubes',
      },
      {
        id: 'daytime_hours_on',
        type: 'slider',
        label: 'For how many hours during the day are artificial lights on?',
        min: 1,
        max: 8,
        step: 0.5,
        defaultValue: 4,
        unit: 'hours/day',
      },
      {
        id: 'window_access',
        type: 'radio',
        label: 'Are windows or curtains accessible to let natural daylight in?',
        options: [
          { id: 'good_light', label: 'Good daylight, curtains usually drawn', description: 'Easy to open and utilize sunlight', icon: '🪟' },
          { id: 'moderate', label: 'Moderate sunlight from one side', description: 'Can replace half the daytime lights', icon: '⛅' },
        ],
        defaultValue: 'good_light',
      },
    ],
  },

  energy_reduce_geyser: {
    activityId: 'energy_reduce_geyser',
    title: 'Water Heater (Geyser) Usage',
    subtitle: 'Electric water heaters draw 2,000–3,000 Watts continuously',
    questions: [
      {
        id: 'geyser_duration_mins',
        type: 'slider',
        label: 'How many total minutes does your geyser run per day?',
        min: 10,
        max: 120,
        step: 5,
        defaultValue: 45,
        unit: 'mins/day',
      },
      {
        id: 'household_baths',
        type: 'stepper',
        label: 'How many family members take hot water baths daily?',
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 3,
        unit: 'people',
      },
      {
        id: 'geyser_power',
        type: 'radio',
        label: 'What is the heating capacity of your geyser?',
        options: [
          { id: 'standard_2kw', label: 'Standard Storage Geyser (2 kW)', description: 'Most common 15L/25L geyser', icon: '♨️', kw: 2.0 },
          { id: 'instant_3kw', label: 'Instant Water Heater (3 kW)', description: 'Fast heating element', icon: '⚡', kw: 3.0 },
        ],
        defaultValue: 'standard_2kw',
      },
    ],
  },

  energy_cold_wash: {
    activityId: 'energy_cold_wash',
    title: 'Laundry Temperature Profile',
    subtitle: 'Heating water accounts for up to 90% of washing machine energy',
    questions: [
      {
        id: 'weekly_wash_cycles',
        type: 'stepper',
        label: 'How many machine wash cycles does your household run per week?',
        min: 1,
        max: 14,
        step: 1,
        defaultValue: 4,
        unit: 'cycles/week',
      },
      {
        id: 'current_wash_temp',
        type: 'radio',
        label: 'What temperature setting is currently selected on the washing machine?',
        options: [
          { id: 'hot_60', label: 'Hot (60°C)', description: 'Draws heater for 45+ minutes (~1.8 kWh/cycle)', icon: '🔥', heaterKwh: 1.8 },
          { id: 'warm_40', label: 'Warm (40°C)', description: 'Moderate heater usage (~0.9 kWh/cycle)', icon: '♨️', heaterKwh: 0.9 },
          { id: 'cold_eco', label: 'Cold / Normal Eco (Ambient)', description: 'No water heating element used (~0.2 kWh/cycle)', icon: '💧', heaterKwh: 0.0 },
        ],
        defaultValue: 'warm_40',
      },
    ],
  },

  energy_air_dry: {
    activityId: 'energy_air_dry',
    title: 'Clothes Drying Method',
    subtitle: 'Solar line drying consumes 0 kWh vs 2.5 kWh for a tumble dryer',
    questions: [
      {
        id: 'uses_dryer',
        type: 'radio',
        label: 'Do you currently use an electric tumble dryer or washer-dryer combo?',
        options: [
          { id: 'always_dryer', label: 'Yes, for most laundry loads', description: 'Electric heated dryer', icon: '🌀' },
          { id: 'monsoon_only', label: 'Occasionally / Only during rains', description: 'Partial outdoor drying', icon: '🌧️' },
        ],
        defaultValue: 'always_dryer',
      },
      {
        id: 'weekly_dryer_cycles',
        type: 'stepper',
        label: 'How many electric dryer cycles do you run per week?',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 3,
        unit: 'loads/week',
      },
      {
        id: 'drying_space_available',
        type: 'radio',
        label: 'Do you have a balcony, terrace, or clothes horse for line drying?',
        options: [
          { id: 'full_sun', label: 'Good sunlight balcony/terrace', description: 'Clothes dry in 2-3 hours', icon: '☀️' },
          { id: 'indoor_rack', label: 'Indoor clothes rack under ceiling fan', description: 'Dries overnight without electricity', icon: '👕' },
        ],
        defaultValue: 'full_sun',
      },
    ],
  },

  energy_offpeak_appliances: {
    activityId: 'energy_offpeak_appliances',
    title: 'Off-Peak Electricity Shifting',
    subtitle: 'Run heavy loads during lower grid emission & off-peak tariff periods',
    questions: [
      {
        id: 'heavy_appliance_time',
        type: 'radio',
        label: 'When do you usually run high-load appliances (washing machine, water pump, dish washer)?',
        options: [
          { id: 'peak_evening', label: 'Peak Evening (6 PM – 10 PM)', description: 'Grid at highest carbon intensity', icon: '🌇' },
          { id: 'mid_day', label: 'Midday (11 AM – 3 PM)', description: 'Solar generation peak on Gujarat grid', icon: '☀️' },
          { id: 'early_morning', label: 'Early Morning (6 AM – 9 AM)', description: 'Low grid stress', icon: '🌅' },
        ],
        defaultValue: 'peak_evening',
      },
      {
        id: 'weekly_flexible_loads',
        type: 'stepper',
        label: 'How many appliance cycles could be shifted to daytime solar hours per week?',
        min: 1,
        max: 14,
        step: 1,
        defaultValue: 4,
        unit: 'cycles/week',
      },
    ],
  },

  energy_fridge_efficiency: {
    activityId: 'energy_fridge_efficiency',
    title: 'Refrigerator Optimization',
    subtitle: 'Refrigerators run 24x7; dial and maintenance tuning yield steady gains',
    questions: [
      {
        id: 'fridge_temp_dial',
        type: 'radio',
        label: 'What is your refrigerator dial setting?',
        options: [
          { id: 'max_cold', label: 'Maximum / Coldest Setting (1–2°C)', description: 'Compressor over-works unnecessarily', icon: '❄️' },
          { id: 'medium_dial', label: 'Medium / Recommended (3–5°C)', description: 'Optimal food preservation balance', icon: '🌿' },
          { id: 'unsure', label: 'Not sure / Default setting', description: 'Needs checking and optimization', icon: '❓' },
        ],
        defaultValue: 'max_cold',
      },
      {
        id: 'door_seal_condition',
        type: 'radio',
        label: 'Is the rubber magnetic door gasket clean and sealing tightly?',
        options: [
          { id: 'needs_check', label: 'Not checked recently', description: 'May have air leaks letting ambient heat in', icon: '⚠️' },
          { id: 'good_seal', label: 'Tight and clean', description: 'Proper seal maintained', icon: '✅' },
        ],
        defaultValue: 'needs_check',
      },
    ],
  },

  energy_computer_power_down: {
    activityId: 'energy_computer_power_down',
    title: 'PC & Workstation Power Management',
    subtitle: 'Shut down desktop computers and external displays when work ends',
    questions: [
      {
        id: 'computer_type',
        type: 'radio',
        label: 'What computer do you primarily use for work or study?',
        options: [
          { id: 'desktop_rig', label: 'Desktop PC + Monitor (~150W)', description: 'High idle draw', icon: '🖥️', watts: 150 },
          { id: 'laptop_external', label: 'Laptop + External Monitor (~70W)', description: 'Medium draw', icon: '💻', watts: 70 },
          { id: 'laptop_alone', label: 'Laptop only (~35W)', description: 'Lower draw', icon: '⌨️', watts: 35 },
        ],
        defaultValue: 'desktop_rig',
      },
      {
        id: 'hours_left_on_idle',
        type: 'slider',
        label: 'How many hours daily is the computer left on or asleep without active use?',
        min: 1,
        max: 16,
        step: 1,
        defaultValue: 6,
        unit: 'hours/day',
      },
    ],
  },

  energy_clean_ac_filter: {
    activityId: 'energy_clean_ac_filter',
    title: 'AC Air Filter Maintenance',
    subtitle: 'Dirty filters choke airflow and increase compressor power draw by 10–15%',
    questions: [
      {
        id: 'months_since_last_clean',
        type: 'radio',
        label: 'When was the air conditioner mesh filter last washed?',
        options: [
          { id: 'over_3_months', label: 'More than 3 months ago (or never)', description: 'Heavily clogged with dust', icon: '🛑', efficiencyLoss: 0.15 },
          { id: '1_to_3_months', label: '1 to 3 months ago', description: 'Moderate dust layer', icon: '⚠️', efficiencyLoss: 0.08 },
          { id: 'cleaned_regularly', label: 'Cleaned within the last month', description: 'Routine upkeep', icon: '✅', efficiencyLoss: 0.02 },
        ],
        defaultValue: 'over_3_months',
      },
      {
        id: 'number_of_acs',
        type: 'stepper',
        label: 'How many AC units in your home need filter washing?',
        min: 1,
        max: 6,
        step: 1,
        defaultValue: 1,
        unit: 'units',
      },
    ],
  },

  energy_star_rated_appliance: {
    activityId: 'energy_star_rated_appliance',
    title: 'Appliance Efficiency Audit',
    subtitle: 'Identify old inefficient power guzzlers for future upgrade planning',
    questions: [
      {
        id: 'oldest_appliance',
        type: 'radio',
        label: 'What is the oldest frequently used major appliance in your household?',
        options: [
          { id: 'old_refrigerator', label: 'Refrigerator (> 8 years old)', description: 'Non-inverter, single-speed compressor', icon: '🧊' },
          { id: 'old_ac', label: 'Air Conditioner (> 7 years old)', description: 'Fixed-speed 2-star or unrated', icon: '❄️' },
          { id: 'old_water_pump', label: 'Monoblock Water Pump (> 6 years old)', description: 'Low motor efficiency', icon: '💧' },
          { id: 'old_fans', label: 'Old Ceiling Fans (75W induction motors)', description: 'Multiple old fans in rooms', icon: '🌀' },
        ],
        defaultValue: 'old_refrigerator',
      },
      {
        id: 'appliance_daily_hours',
        type: 'slider',
        label: 'Approximately how many hours per day does this appliance operate?',
        min: 2,
        max: 24,
        step: 1,
        defaultValue: 12,
        unit: 'hours/day',
      },
    ],
  },

  // =========================================================================
  // 2. SUSTAINABLE TRANSPORTATION (12 Activities)
  // =========================================================================

  transport_walk_cycle: {
    activityId: 'transport_walk_cycle',
    title: 'Neighborhood Errand Transit',
    subtitle: 'Replace short cold-engine motor trips with active walking or cycling',
    questions: [
      {
        id: 'short_trips_per_week',
        type: 'stepper',
        label: 'How many short trips (< 2 km) do you make per week for milk, groceries, etc.?',
        min: 2,
        max: 21,
        step: 1,
        defaultValue: 7,
        unit: 'trips/week',
      },
      {
        id: 'current_vehicle_used',
        type: 'radio',
        label: 'What vehicle do you usually take for these neighborhood errands?',
        options: [
          { id: 'petrol_scooter', label: 'Petrol Scooter / Motorbike (~0.04 kg CO₂/km)', description: 'Active engine cold start', icon: '🛵', kgPerKm: 0.042 },
          { id: 'petrol_car', label: 'Petrol / Diesel Car (~0.17 kg CO₂/km)', description: 'Highest emissions for short distance', icon: '🚗', kgPerKm: 0.17 },
          { id: 'auto_rickshaw', label: 'Auto Rickshaw (~0.07 kg CO₂/km)', description: 'Hired 3-wheeler', icon: '🛺', kgPerKm: 0.07 },
        ],
        defaultValue: 'petrol_scooter',
      },
      {
        id: 'average_trip_distance_km',
        type: 'slider',
        label: 'What is the average one-way distance of these errand trips?',
        min: 0.5,
        max: 3.0,
        step: 0.25,
        defaultValue: 1.2,
        unit: 'km',
      },
    ],
  },

  transport_cycle_instead_of_driving: {
    activityId: 'transport_cycle_instead_of_driving',
    title: 'Bicycle Commuting Assessment',
    subtitle: 'Swap motorized commute or errand travel for clean bicycling',
    questions: [
      {
        id: 'travel_distance_km',
        type: 'slider',
        label: 'How far is the typical trip you could cycle instead of drive (one-way)?',
        min: 1,
        max: 10,
        step: 0.5,
        defaultValue: 3.0,
        unit: 'km',
      },
      {
        id: 'displaced_vehicle',
        type: 'radio',
        label: 'Which motorized vehicle will this cycling trip displace?',
        options: [
          { id: 'petrol_car', label: 'Petrol Car', description: 'Saves ~0.165 kg CO₂e per km', icon: '🚗', kgPerKm: 0.165 },
          { id: 'diesel_car', label: 'Diesel Car', description: 'Saves ~0.185 kg CO₂e per km', icon: '🚙', kgPerKm: 0.185 },
          { id: 'motorbike', label: 'Motorbike / Scooter', description: 'Saves ~0.042 kg CO₂e per km', icon: '🏍️', kgPerKm: 0.042 },
        ],
        defaultValue: 'petrol_car',
      },
      {
        id: 'days_per_week_cycling',
        type: 'stepper',
        label: 'How many days per week are you willing to bicycle for this trip?',
        min: 1,
        max: 6,
        step: 1,
        defaultValue: 3,
        unit: 'days/week',
      },
    ],
  },

  transport_public_transit: {
    activityId: 'transport_public_transit',
    title: 'Public Transit Transition',
    subtitle: 'Take BRTS, Metro, AMTS, or shared transit for daily commuting',
    questions: [
      {
        id: 'one_way_commute_km',
        type: 'slider',
        label: 'What is your one-way commute distance to work / college?',
        min: 2,
        max: 35,
        step: 1,
        defaultValue: 10,
        unit: 'km',
      },
      {
        id: 'current_private_mode',
        type: 'radio',
        label: 'What private mode do you currently drive for this commute?',
        options: [
          { id: 'solo_car', label: 'Solo Car (Petrol/Diesel)', description: 'High fuel spend & congestion', icon: '🚗', netSavingPerKm: 0.13 },
          { id: 'solo_two_wheeler', label: 'Solo Two-Wheeler', description: 'Scooter/bike commute', icon: '🛵', netSavingPerKm: 0.025 },
        ],
        defaultValue: 'solo_car',
      },
      {
        id: 'available_transit_system',
        type: 'dropdown',
        label: 'Which public transit system connects near your route?',
        options: [
          { id: 'metro', label: 'City Metro / Rapid Rail' },
          { id: 'brts', label: 'Ahmedabad BRTS (Bus Rapid Transit)' },
          { id: 'city_bus', label: 'AMTS / City Municipal Bus' },
          { id: 'shared_transit', label: 'Shared Shuttle / Corporate Bus' },
        ],
        defaultValue: 'brts',
      },
      {
        id: 'commute_days_per_week',
        type: 'stepper',
        label: 'How many days a week do you commute?',
        min: 1,
        max: 6,
        step: 1,
        defaultValue: 5,
        unit: 'days/week',
      },
    ],
  },

  transport_carpool: {
    activityId: 'transport_carpool',
    title: 'Ride Sharing & Carpooling',
    subtitle: 'Divide single-occupancy vehicle emissions across multiple riders',
    questions: [
      {
        id: 'one_way_trip_km',
        type: 'slider',
        label: 'What is your typical one-way travel distance?',
        min: 3,
        max: 40,
        step: 1,
        defaultValue: 12,
        unit: 'km',
      },
      {
        id: 'potential_carpool_size',
        type: 'stepper',
        label: 'How many total people (including you) can share the car?',
        min: 2,
        max: 5,
        step: 1,
        defaultValue: 3,
        unit: 'riders',
      },
      {
        id: 'vehicle_fuel',
        type: 'radio',
        label: 'What is the vehicle fuel type?',
        options: [
          { id: 'petrol', label: 'Petrol Car (~0.165 kg CO₂/km)', icon: '⛽', emissionPerKm: 0.165 },
          { id: 'cng', label: 'CNG Car (~0.11 kg CO₂/km)', icon: '💨', emissionPerKm: 0.11 },
          { id: 'diesel', label: 'Diesel Car (~0.185 kg CO₂/km)', icon: '🛢️', emissionPerKm: 0.185 },
        ],
        defaultValue: 'petrol',
      },
    ],
  },

  transport_combine_errands: {
    activityId: 'transport_combine_errands',
    title: 'Trip Chaining & Errand Consolidation',
    subtitle: 'Group separate trips into a single loop to avoid cold starts & extra mileage',
    questions: [
      {
        id: 'separate_errands_per_week',
        type: 'stepper',
        label: 'How many separate out-and-back errand trips do you do per week?',
        min: 3,
        max: 15,
        step: 1,
        defaultValue: 6,
        unit: 'trips/week',
      },
      {
        id: 'vehicle_used',
        type: 'radio',
        label: 'What vehicle do you use for these trips?',
        options: [
          { id: 'car', label: 'Four-Wheeler / Car', icon: '🚗', factor: 0.165 },
          { id: 'scooter', label: 'Two-Wheeler / Scooter', icon: '🛵', factor: 0.042 },
        ],
        defaultValue: 'scooter',
      },
      {
        id: 'km_per_errand',
        type: 'slider',
        label: 'Average round-trip distance per errand:',
        min: 2,
        max: 15,
        step: 0.5,
        defaultValue: 5,
        unit: 'km',
      },
    ],
  },

  transport_avoid_idling: {
    activityId: 'transport_avoid_idling',
    title: 'Vehicle Anti-Idling Practice',
    subtitle: 'Switch off engine at railway crossings and traffic signals longer than 15 seconds',
    questions: [
      {
        id: 'daily_idling_minutes',
        type: 'slider',
        label: 'Approximately how many minutes is your engine left idling daily (at signals, waiting)?',
        min: 3,
        max: 30,
        step: 1,
        defaultValue: 10,
        unit: 'mins/day',
      },
      {
        id: 'vehicle_type',
        type: 'radio',
        label: 'Your primary daily vehicle:',
        options: [
          { id: 'car_petrol', label: 'Car (Petrol/Diesel)', description: 'Burns ~0.02 L/min idle (~0.05 kg CO₂/min)', icon: '🚗', kgPerMin: 0.048 },
          { id: 'two_wheeler', label: 'Two-Wheeler Scooter/Motorbike', description: 'Burns ~0.007 L/min idle (~0.016 kg CO₂/min)', icon: '🛵', kgPerMin: 0.016 },
        ],
        defaultValue: 'two_wheeler',
      },
    ],
  },

  transport_tyre_pressure: {
    activityId: 'transport_tyre_pressure',
    title: 'Tyre Pressure & Rolling Resistance',
    subtitle: 'Under-inflated tyres waste 3–5% fuel and increase tire wear',
    questions: [
      {
        id: 'last_pressure_check',
        type: 'radio',
        label: 'How often do you currently check tyre pressure?',
        options: [
          { id: 'rarely', label: 'Rarely / Only during service', description: 'Usually 4-8 PSI under recommended', icon: '🛑', wastePct: 0.05 },
          { id: 'monthly', label: 'Once a month', description: 'Moderate pressure drop', icon: '⚠️', wastePct: 0.03 },
          { id: 'fortnightly', label: 'Every 2 weeks', description: 'Well maintained', icon: '✅', wastePct: 0.01 },
        ],
        defaultValue: 'rarely',
      },
      {
        id: 'monthly_fuel_spend',
        type: 'slider',
        label: 'What is your approximate monthly fuel spend (petrol/diesel)?',
        min: 500,
        max: 10000,
        step: 250,
        defaultValue: 3000,
        unit: '₹/month',
      },
    ],
  },

  transport_eco_driving: {
    activityId: 'transport_eco_driving',
    title: 'Eco-Driving Smooth Acceleration',
    subtitle: 'Smooth throttle, early gear shifting, and steady cruising cut fuel by 15%',
    questions: [
      {
        id: 'daily_driving_distance_km',
        type: 'slider',
        label: 'How many kilometers do you drive per day on average?',
        min: 5,
        max: 60,
        step: 2,
        defaultValue: 20,
        unit: 'km/day',
      },
      {
        id: 'driving_style',
        type: 'radio',
        label: 'How would you describe your typical driving pattern in city traffic?',
        options: [
          { id: 'aggressive', label: 'Brisk / Quick acceleration & frequent hard braking', icon: '🏎️', potentialSaving: 0.18 },
          { id: 'moderate', label: 'Average city driving with occasional stops', icon: '🚗', potentialSaving: 0.10 },
          { id: 'already_smooth', label: 'Steady & defensive', icon: '🕊️', potentialSaving: 0.05 },
        ],
        defaultValue: 'aggressive',
      },
    ],
  },

  transport_work_remote: {
    activityId: 'transport_work_remote',
    title: 'Telecommuting & Remote Work',
    subtitle: 'Eliminate round-trip commuting emissions entirely by working from home',
    questions: [
      {
        id: 'remote_days_possible',
        type: 'stepper',
        label: 'How many days per week could your work/study be done remotely?',
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 2,
        unit: 'days/week',
      },
      {
        id: 'round_trip_commute_km',
        type: 'slider',
        label: 'What is your total round-trip commute distance?',
        min: 4,
        max: 60,
        step: 2,
        defaultValue: 24,
        unit: 'km/day',
      },
      {
        id: 'commute_mode',
        type: 'radio',
        label: 'Mode of commute avoided on remote days:',
        options: [
          { id: 'car', label: 'Personal Car', icon: '🚗', factor: 0.165 },
          { id: 'bike', label: 'Two-Wheeler', icon: '🛵', factor: 0.042 },
          { id: 'bus_train', label: 'Public Transit / Bus', icon: '🚌', factor: 0.02 },
        ],
        defaultValue: 'bike',
      },
    ],
  },

  transport_train_over_flight: {
    activityId: 'transport_train_over_flight',
    title: 'Intercity Rail vs Short-Haul Flight',
    subtitle: 'Indian Railways electric train produces ~85% lower CO₂ per passenger than domestic flights',
    questions: [
      {
        id: 'route_distance_km',
        type: 'slider',
        label: 'Approximate distance of your upcoming intercity trip (e.g. Ahmedabad - Mumbai ~500 km)?',
        min: 200,
        max: 1200,
        step: 50,
        defaultValue: 500,
        unit: 'km',
      },
      {
        id: 'travel_frequency',
        type: 'radio',
        label: 'How often do you make domestic intercity trips under 800 km?',
        options: [
          { id: 'monthly', label: 'Monthly or more', icon: '📅' },
          { id: 'quarterly', label: 'Every 3-4 months', icon: '🧳' },
          { id: 'yearly', label: '1–2 times a year', icon: '✈️' },
        ],
        defaultValue: 'quarterly',
      },
    ],
  },

  transport_ev_trip: {
    activityId: 'transport_ev_trip',
    title: 'Electric Vehicle (EV) Transition',
    subtitle: 'Zero tailpipe emissions and significantly higher well-to-wheel efficiency',
    questions: [
      {
        id: 'daily_distance_km',
        type: 'slider',
        label: 'What daily distance will be traveled on the EV?',
        min: 5,
        max: 60,
        step: 5,
        defaultValue: 25,
        unit: 'km/day',
      },
      {
        id: 'ev_category',
        type: 'radio',
        label: 'Which electric vehicle category are you assessing?',
        options: [
          { id: 'electric_2w', label: 'Electric Scooter / Bike', description: 'Replaces petrol 2-wheeler', icon: '⚡🛵', netSavingPerKm: 0.028 },
          { id: 'electric_4w', label: 'Electric Car / Cab', description: 'Replaces petrol/diesel car', icon: '⚡🚗', netSavingPerKm: 0.095 },
        ],
        defaultValue: 'electric_2w',
      },
    ],
  },

  transport_vehicle_service_puc: {
    activityId: 'transport_vehicle_service_puc',
    title: 'Vehicle Maintenance & PUC Audit',
    subtitle: 'A tuned engine burns fuel cleanly and prevents hazardous unburnt hydrocarbon emissions',
    questions: [
      {
        id: 'months_since_service',
        type: 'radio',
        label: 'When was your vehicle last fully serviced (oil change, spark plug, air filter)?',
        options: [
          { id: 'over_6m', label: 'Over 6 months ago', description: 'Likely overdue for tuning', icon: '🛑' },
          { id: '3_to_6m', label: '3 to 6 months ago', description: 'Moderate condition', icon: '⚠️' },
          { id: 'under_3m', label: 'Within last 3 months', description: 'Freshly maintained', icon: '✅' },
        ],
        defaultValue: 'over_6m',
      },
      {
        id: 'puc_status',
        type: 'radio',
        label: 'Is your vehicle Pollution Under Control (PUC) certificate current?',
        options: [
          { id: 'expired', label: 'Expired or missing', description: 'Need immediate test', icon: '📄' },
          { id: 'valid', label: 'Valid & active', description: 'Emission within legal limits', icon: '✅' },
        ],
        defaultValue: 'expired',
      },
    ],
  },

  // =========================================================================
  // 3. WATER CONSERVATION (12 Activities)
  // =========================================================================

  water_turn_off_tap_brushing: {
    activityId: 'water_turn_off_tap_brushing',
    title: 'Faucet Hygiene Audit',
    subtitle: 'Running taps waste 6–9 liters of treated drinking water per minute',
    questions: [
      {
        id: 'tap_running_minutes',
        type: 'slider',
        label: 'How many minutes is the washbasin tap left running while brushing or shaving?',
        min: 1,
        max: 6,
        step: 0.5,
        defaultValue: 2.5,
        unit: 'mins/routine',
      },
      {
        id: 'routines_per_day',
        type: 'stepper',
        label: 'How many times per day do you brush or shave?',
        min: 1,
        max: 4,
        step: 1,
        defaultValue: 2,
        unit: 'times/day',
      },
      {
        id: 'household_members',
        type: 'stepper',
        label: 'How many people in your home do this routine?',
        min: 1,
        max: 6,
        step: 1,
        defaultValue: 3,
        unit: 'people',
      },
    ],
  },

  water_reduce_shower_duration: {
    activityId: 'water_reduce_shower_duration',
    title: 'Shower Duration & Flow',
    subtitle: 'A standard overhead shower consumes 12–15 litres of heated water per minute',
    questions: [
      {
        id: 'current_shower_mins',
        type: 'slider',
        label: 'How many minutes does your typical overhead shower last?',
        min: 4,
        max: 25,
        step: 1,
        defaultValue: 12,
        unit: 'mins',
      },
      {
        id: 'shower_water_heated',
        type: 'radio',
        label: 'Do you use hot water for this shower?',
        options: [
          { id: 'electric_geyser', label: 'Yes, electric water geyser', description: 'Water + electricity carbon footprint', icon: '♨️', addsCarbon: true },
          { id: 'ambient_water', label: 'No, ambient / cold water', description: 'Conserves water pumping energy', icon: '💧', addsCarbon: false },
        ],
        defaultValue: 'electric_geyser',
      },
    ],
  },

  water_report_leaking_taps: {
    activityId: 'water_report_leaking_taps',
    title: 'Plumbing Leak Audit',
    subtitle: 'A steady dripping tap wastes 30–60 liters of clean water every 24 hours',
    questions: [
      {
        id: 'leaking_fixtures_count',
        type: 'stepper',
        label: 'How many taps, flush valves, or showerheads are dripping in your home?',
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 2,
        unit: 'fixtures',
      },
      {
        id: 'drip_rate',
        type: 'radio',
        label: 'What is the drip intensity?',
        options: [
          { id: 'slow_drip', label: 'Slow Drip (1 drop / 2-3 sec)', description: 'Wastes ~15 L/day per tap', icon: '💧', litresPerDay: 15 },
          { id: 'fast_drip', label: 'Fast Drip (1 drop / second)', description: 'Wastes ~40 L/day per tap', icon: '💦', litresPerDay: 40 },
          { id: 'trickle', label: 'Steady Thin Trickle / Flush hiss', description: 'Wastes ~120 L/day per fixture', icon: '🚰', litresPerDay: 120 },
        ],
        defaultValue: 'fast_drip',
      },
    ],
  },

  water_bucket_bath: {
    activityId: 'water_bucket_bath',
    title: 'Bucket Bath Transition',
    subtitle: 'A standard bucket bath uses 16–20 L vs 100+ L for an overhead shower',
    questions: [
      {
        id: 'current_bathing_method',
        type: 'radio',
        label: 'What is your current daily bathing style?',
        options: [
          { id: 'overhead_shower', label: 'Overhead Power Shower (~100 L)', description: 'High volume consumption', icon: '🚿', litresUsed: 100 },
          { id: 'mix_both', label: 'Mixed (Shower on weekends, bucket sometimes)', description: 'Moderate consumption (~60 L)', icon: '🛁', litresUsed: 60 },
        ],
        defaultValue: 'overhead_shower',
      },
      {
        id: 'baths_per_week',
        type: 'stepper',
        label: 'How many shower baths do you take per week?',
        min: 3,
        max: 14,
        step: 1,
        defaultValue: 7,
        unit: 'baths/week',
      },
    ],
  },

  water_reuse_plants: {
    activityId: 'water_reuse_plants',
    title: 'Greywater & RO Reject Reuse',
    subtitle: 'RO purifiers discard 2–3 liters of water for every 1 liter of drinking water produced',
    questions: [
      {
        id: 'ro_usage_litres',
        type: 'slider',
        label: 'How many liters of drinking water does your household consume daily from the RO?',
        min: 5,
        max: 40,
        step: 5,
        defaultValue: 15,
        unit: 'litres/day',
      },
      {
        id: 'reject_water_destination',
        type: 'radio',
        label: 'Where does your RO purifier reject pipe drain currently?',
        options: [
          { id: 'straight_to_drain', label: 'Directly into the kitchen sink drain', description: 'Completely wasted', icon: '🚰' },
          { id: 'partially_collected', label: 'Collected in a bucket sometimes', description: 'Irregular reuse', icon: '🪣' },
        ],
        defaultValue: 'straight_to_drain',
      },
      {
        id: 'reuse_targets',
        type: 'multiselect',
        label: 'Which tasks could utilize this non-potable collected water? (Select all that apply)',
        options: [
          { id: 'floor_mopping', label: 'Floor Mopping', icon: '🧹' },
          { id: 'plants_garden', label: 'Watering Ornamental Plants', icon: '🪴' },
          { id: 'utensils_prewash', label: 'Pre-rinsing Utensils', icon: '🍽️' },
          { id: 'vehicle_wash', label: 'Washing Two-Wheeler / Car', icon: '🛵' },
        ],
        defaultValue: ['floor_mopping', 'plants_garden'],
      },
    ],
  },

  water_full_load_washing: {
    activityId: 'water_full_load_washing',
    title: 'Washing Machine Load Optimization',
    subtitle: 'A single cycle consumes 50–80 liters of treated municipal water',
    questions: [
      {
        id: 'weekly_cycles',
        type: 'stepper',
        label: 'How many machine loads does your home run per week?',
        min: 2,
        max: 12,
        step: 1,
        defaultValue: 5,
        unit: 'loads/week',
      },
      {
        id: 'typical_fullness',
        type: 'radio',
        label: 'How full is the drum when a cycle is started?',
        options: [
          { id: 'half_full', label: 'Half-full or just a few clothes', description: 'Wastes water per kilogram washed', icon: '👕', potentialSaveCycles: 2 },
          { id: 'mostly_full', label: 'Three-quarters full', description: 'Good, but room for optimization', icon: '🧺', potentialSaveCycles: 1 },
        ],
        defaultValue: 'half_full',
      },
    ],
  },

  water_efficient_fixtures: {
    activityId: 'water_efficient_fixtures',
    title: 'Water Aerator & Fixture Upgrade',
    subtitle: 'Low-cost tap aerators introduce air bubbles and cut tap flow by 40–50%',
    questions: [
      {
        id: 'sink_taps_count',
        type: 'stepper',
        label: 'How many washbasin and kitchen taps do not yet have aerator nozzles?',
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 3,
        unit: 'taps',
      },
      {
        id: 'daily_use_minutes_per_tap',
        type: 'slider',
        label: 'Estimated minutes these taps run combined across all family members daily:',
        min: 5,
        max: 45,
        step: 5,
        defaultValue: 20,
        unit: 'mins/day',
      },
    ],
  },

  water_rainwater: {
    activityId: 'water_rainwater',
    title: 'Rainwater Harvesting Readiness',
    subtitle: 'Capture monsoon rooftop runoff to recharge groundwater aquifers',
    questions: [
      {
        id: 'rooftop_area',
        type: 'radio',
        label: 'What is your approximate available rooftop / terrace area?',
        options: [
          { id: 'small_terrace', label: 'Small Terrace / Balcony (< 500 sq ft)', description: 'Suitable for rain barrel collection', icon: '🏠' },
          { id: 'medium_bungalow', label: 'Independent Bungalow (500 – 1,500 sq ft)', description: 'High recharge volume', icon: '🏡' },
          { id: 'apartment_complex', label: 'Society / Apartment Terrace (> 1,500 sq ft)', description: 'Community bore recharge potential', icon: '🏢' },
        ],
        defaultValue: 'small_terrace',
      },
    ],
  },

  water_plants_cooler_hours: {
    activityId: 'water_plants_cooler_hours',
    title: 'Garden Watering Schedule',
    subtitle: 'Watering under direct midday sun loses up to 40% to evaporation before roots absorb it',
    questions: [
      {
        id: 'current_watering_time',
        type: 'radio',
        label: 'What time of day do you currently water your pots or garden?',
        options: [
          { id: 'afternoon_sun', label: 'Late Morning / Afternoon (10 AM – 4 PM)', description: 'Peak evaporation loss', icon: '☀️' },
          { id: 'evening_morning', label: 'Early Morning (before 8 AM) or Sunset', description: 'Optimal absorption', icon: '🌅' },
        ],
        defaultValue: 'afternoon_sun',
      },
      {
        id: 'number_of_pots',
        type: 'stepper',
        label: 'How many potted plants or garden beds do you water daily?',
        min: 2,
        max: 50,
        step: 2,
        defaultValue: 10,
        unit: 'pots',
      },
    ],
  },

  water_bucket_wash: {
    activityId: 'water_bucket_wash',
    title: 'Vehicle Washing Practice',
    subtitle: 'A continuous garden hose discharges 200–300 L vs 25 L for two buckets',
    questions: [
      {
        id: 'vehicle_wash_frequency',
        type: 'stepper',
        label: 'How many times per month is your car or two-wheeler washed?',
        min: 1,
        max: 12,
        step: 1,
        defaultValue: 4,
        unit: 'washes/month',
      },
      {
        id: 'wash_method',
        type: 'radio',
        label: 'What method is currently used?',
        options: [
          { id: 'running_hose', label: 'Running Hose Pipe from Tap (~250 L/wash)', description: 'Massive water wastage', icon: '🚿', litres: 250 },
          { id: 'pressure_service', label: 'Commercial Service Station', description: 'External washing', icon: '🏢', litres: 100 },
          { id: 'bucket_already', label: 'Bucket + Microfiber cloth (~25 L/wash)', description: 'Already water-efficient', icon: '🪣', litres: 25 },
        ],
        defaultValue: 'running_hose',
      },
    ],
  },

  water_meter_leak_audit: {
    activityId: 'water_meter_leak_audit',
    title: 'Overnight Water Meter Audit',
    subtitle: 'Detect concealed underground or wall pipe seepages that silently waste water',
    questions: [
      {
        id: 'has_water_meter',
        type: 'radio',
        label: 'Do you have a water meter or dedicated overhead tank indicator?',
        options: [
          { id: 'yes_meter', label: 'Yes, utility water meter installed', icon: '⏲️' },
          { id: 'overhead_tank', label: 'Overhead tank with level gauge', icon: '🚰' },
        ],
        defaultValue: 'yes_meter',
      },
    ],
  },

  water_dishwashing_basin: {
    activityId: 'water_dishwashing_basin',
    title: 'Sink Basin Dishwashing Method',
    subtitle: 'Scrubbing with the tap turned off or using a wash basin saves 40 liters per meal cleanup',
    questions: [
      {
        id: 'sink_tap_minutes',
        type: 'slider',
        label: 'How many minutes daily does the kitchen faucet run continuously during dishwashing?',
        min: 5,
        max: 45,
        step: 5,
        defaultValue: 20,
        unit: 'mins/day',
      },
    ],
  },

  // =========================================================================
  // 4. WASTE MANAGEMENT (20 Activities)
  // =========================================================================

  waste_segregate: {
    activityId: 'waste_segregate',
    title: 'Two-Bin Source Segregation Audit',
    subtitle: 'Separate kitchen organic waste from clean recyclables before disposal',
    questions: [
      {
        id: 'current_bin_setup',
        type: 'radio',
        label: 'How many waste bins do you currently maintain in your kitchen?',
        options: [
          { id: 'single_mixed_bin', label: '1 Single Mixed Bin', description: 'Food scraps, plastics & paper all mixed together', icon: '🗑️' },
          { id: 'partial_segregation', label: '2 Bins, but often mixed up', description: 'Sometimes plastics get thrown into food waste', icon: '⚠️' },
          { id: 'strict_two_bins', label: 'Strict 2 Bins (Green Wet + Blue Dry)', description: 'Consistent source segregation', icon: '✅' },
        ],
        defaultValue: 'single_mixed_bin',
      },
      {
        id: 'household_size',
        type: 'stepper',
        label: 'How many people live in your household?',
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 4,
        unit: 'people',
      },
    ],
  },

  waste_avoid_single_plastic: {
    activityId: 'waste_avoid_single_plastic',
    title: 'Single-Use Plastics Audit',
    subtitle: 'Eliminate disposable straws, cutlery, thin film pouches and lids',
    questions: [
      {
        id: 'weekly_single_use_items',
        type: 'stepper',
        label: 'How many single-use plastic items enter your home weekly (cutlery, delivery lids, pouches)?',
        min: 2,
        max: 50,
        step: 2,
        defaultValue: 14,
        unit: 'items/week',
      },
      {
        id: 'primary_source',
        type: 'radio',
        label: 'What is the biggest source of this disposable plastic?',
        options: [
          { id: 'food_delivery', label: 'Online Food Delivery (Swiggy / Zomato)', icon: '🥡' },
          { id: 'grocery_packaging', label: 'Vegetable / Kirana shopping', icon: '🛍️' },
          { id: 'takeaway_tea', label: 'Street tea / coffee takeaway cups', icon: '☕' },
        ],
        defaultValue: 'food_delivery',
      },
    ],
  },

  waste_reusable_bottle: {
    activityId: 'waste_reusable_bottle',
    title: 'Reusable Water Bottle Practice',
    subtitle: 'A single reusable stainless steel bottle displaces 150+ single-use PET bottles annually',
    questions: [
      {
        id: 'disposable_bottles_per_week',
        type: 'stepper',
        label: 'How many single-use plastic water bottles do you buy per week while traveling/commuting?',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 4,
        unit: 'bottles/week',
      },
      {
        id: 'owns_reusable_flask',
        type: 'radio',
        label: 'Do you already own a stainless steel or copper reusable bottle?',
        options: [
          { id: 'owns_one', label: 'Yes, but forget to carry it', description: 'Need habit reminder before leaving home', icon: '🧴' },
          { id: 'does_not_own', label: 'No, need to purchase/acquire one', description: 'Invest in a durable reusable bottle', icon: '🛒' },
        ],
        defaultValue: 'owns_one',
      },
    ],
  },

  waste_reusable_bag: {
    activityId: 'waste_reusable_bag',
    title: 'Cloth Shopping Bag Habit',
    subtitle: 'Decline single-use polythene carry bags at grocery and vegetable stores',
    questions: [
      {
        id: 'weekly_shopping_trips',
        type: 'stepper',
        label: 'How many market / grocery shopping trips do you make per week?',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 4,
        unit: 'trips/week',
      },
      {
        id: 'plastic_bags_accepted_per_trip',
        type: 'stepper',
        label: 'How many polythene bags do you typically accept per trip?',
        min: 1,
        max: 6,
        step: 1,
        defaultValue: 2,
        unit: 'bags/trip',
      },
    ],
  },

  waste_reusable_cup: {
    activityId: 'waste_reusable_cup',
    title: 'Reusable Beverage Cup (Chai / Coffee)',
    subtitle: 'Paper cups are lined with non-biodegradable polyethylene plastic film',
    questions: [
      {
        id: 'paper_cups_consumed_weekly',
        type: 'slider',
        label: 'How many disposable paper/plastic tea cups do you use per week at offices or roadside stalls?',
        min: 2,
        max: 30,
        step: 1,
        defaultValue: 10,
        unit: 'cups/week',
      },
    ],
  },

  waste_compost: {
    activityId: 'waste_compost',
    title: 'Home Composting Readiness',
    subtitle: 'Divert kitchen fruit & vegetable peelings from methane-producing municipal dumps',
    questions: [
      {
        id: 'daily_wet_waste_kg',
        type: 'slider',
        label: 'Approximate weight of daily kitchen vegetable/fruit scraps:',
        min: 0.2,
        max: 3.0,
        step: 0.1,
        defaultValue: 0.8,
        unit: 'kg/day',
      },
      {
        id: 'composting_space',
        type: 'radio',
        label: 'What space is available for a compost pot (khamba) or aerated bin?',
        options: [
          { id: 'balcony_corner', label: 'Balcony Corner (Terracotta Khamba pot)', icon: '🪴' },
          { id: 'backyard_soil', label: 'Ground garden / backyard bed', icon: '🌳' },
          { id: 'community_bin', label: 'Apartment society compost composter', icon: '🏢' },
        ],
        defaultValue: 'balcony_corner',
      },
    ],
  },

  waste_recycle_paper: {
    activityId: 'waste_recycle_paper',
    title: 'Paper & Cardboard Segregation',
    subtitle: '1 tonne of recycled paper saves 17 trees, 26,000 liters of water and 4,000 kWh',
    questions: [
      {
        id: 'monthly_paper_waste_kg',
        type: 'slider',
        label: 'Estimated weight of newspapers, cardboard cartons and paper generated monthly:',
        min: 1,
        max: 25,
        step: 1,
        defaultValue: 6,
        unit: 'kg/month',
      },
      {
        id: 'current_disposal_paper',
        type: 'radio',
        label: 'How is household paper currently handled?',
        options: [
          { id: 'mixed_with_wet', label: 'Thrown in general dustbin with food scraps', description: 'Soiled paper cannot be recycled', icon: '🛑' },
          { id: 'stored_for_kabadi', label: 'Stacked dry for kabadiwala / raddiwala', description: 'Ready for recycling market', icon: '📦' },
        ],
        defaultValue: 'mixed_with_wet',
      },
    ],
  },

  waste_recycle_plastic: {
    activityId: 'waste_recycle_plastic',
    title: 'Rigid Plastic Cleaning & Recycling',
    subtitle: 'Wash and dry oil bottles, shampoo bottles and containers before recycling',
    questions: [
      {
        id: 'monthly_plastic_bottles_jars',
        type: 'stepper',
        label: 'How many rigid plastic containers (detergent, shampoo, oil cans) are emptied monthly?',
        min: 2,
        max: 30,
        step: 2,
        defaultValue: 8,
        unit: 'containers/month',
      },
    ],
  },

  waste_ewaste: {
    activityId: 'waste_ewaste',
    title: 'Electronic Waste (E-Waste) Inventory',
    subtitle: 'Safely channel dead batteries, old cords and broken electronics to certified recyclers',
    questions: [
      {
        id: 'idle_ewaste_items',
        type: 'stepper',
        label: 'How many unused phones, chargers, broken earbuds or batteries are stored in your drawers?',
        min: 1,
        max: 15,
        step: 1,
        defaultValue: 4,
        unit: 'items',
      },
    ],
  },

  waste_repair_items: {
    activityId: 'waste_repair_items',
    title: 'Right to Repair Assessment',
    subtitle: 'Mend footwear, zippers, bags and home items rather than replacing them prematurely',
    questions: [
      {
        id: 'items_needing_repair',
        type: 'stepper',
        label: 'How many items (shoes, backpacks, fans, appliances) currently need minor repair?',
        min: 1,
        max: 6,
        step: 1,
        defaultValue: 2,
        unit: 'items',
      },
    ],
  },

  waste_second_hand: {
    activityId: 'waste_second_hand',
    title: 'Second-Hand / Refurbished Purchasing',
    subtitle: 'Buying pre-loved books, gadgets or furniture avoids 100% of embodied manufacturing carbon',
    questions: [
      {
        id: 'upcoming_purchase_category',
        type: 'radio',
        label: 'Which upcoming purchase could you consider buying pre-owned or refurbished?',
        options: [
          { id: 'books', label: 'Academic / Fiction Books & Textbooks', icon: '📚' },
          { id: 'electronics', label: 'Refurbished Laptop / Smartphone', icon: '📱' },
          { id: 'furniture', label: 'Study Table / Chair / Home Décor', icon: '🪑' },
        ],
        defaultValue: 'books',
      },
    ],
  },

  waste_avoid_food_waste: {
    activityId: 'waste_avoid_food_waste',
    title: 'Food Waste Audit',
    subtitle: 'Food rotting in landfills releases methane; 1 kg avoided food waste saves ~2.5 kg CO₂e',
    questions: [
      {
        id: 'food_portions_wasted_weekly',
        type: 'stepper',
        label: 'Approximately how many servings of cooked leftovers or spoilt food get tossed weekly?',
        min: 1,
        max: 15,
        step: 1,
        defaultValue: 4,
        unit: 'servings/week',
      },
      {
        id: 'average_serving_weight_grams',
        type: 'slider',
        label: 'Approximate weight of each discarded portion:',
        min: 100,
        max: 500,
        step: 50,
        defaultValue: 250,
        unit: 'grams',
      },
    ],
  },

  waste_plan_meals: {
    activityId: 'waste_plan_meals',
    title: 'Weekly Meal Planning & Smart Shopping',
    subtitle: 'Making a strict grocery list prevents over-purchasing perishable items',
    questions: [
      {
        id: 'planning_habit',
        type: 'radio',
        label: 'Do you currently make a meal plan or written grocery list before shopping?',
        options: [
          { id: 'no_list', label: 'No list, buy on impulse and estimates', description: 'High risk of vegetable spoilage', icon: '🛑' },
          { id: 'mental_list', label: 'Rough mental list', description: 'Moderate surplus purchases', icon: '⚠️' },
          { id: 'written_plan', label: 'Strict written list based on weekly meals', description: 'Zero surplus grocery waste', icon: '✅' },
        ],
        defaultValue: 'no_list',
      },
    ],
  },

  waste_low_packaging: {
    activityId: 'waste_low_packaging',
    title: 'Low-Packaging Grocery Selection',
    subtitle: 'Choose loose produce and bulk grains over plastic-clam-shelled vegetables',
    questions: [
      {
        id: 'packaged_produce_frequency',
        type: 'radio',
        label: 'Where do you buy fresh fruits and vegetables most frequently?',
        options: [
          { id: 'supermarket_plastic', label: 'Supermarkets (packaged in cling film / trays)', icon: '🏬' },
          { id: 'local_mandi', label: 'Local Sabzi Mandi / Pushcart vendor (loose produce)', icon: '🥦' },
        ],
        defaultValue: 'supermarket_plastic',
      },
    ],
  },

  waste_donate_items: {
    activityId: 'waste_donate_items',
    title: 'Clothing & Goods Donation',
    subtitle: 'Channel outgrown garments and usable goods to community donation centers',
    questions: [
      {
        id: 'wearable_clothes_to_donate',
        type: 'stepper',
        label: 'How many wearable garments in your wardrobe have not been worn in the past 12 months?',
        min: 2,
        max: 50,
        step: 2,
        defaultValue: 10,
        unit: 'garments',
      },
    ],
  },

  waste_plant_based_meal: {
    activityId: 'waste_plant_based_meal',
    title: 'Plant-Based Meal Transition',
    subtitle: 'Replacing meat/egg meals with dal, legumes, and local vegetables cuts dietary footprint by 40%',
    questions: [
      {
        id: 'current_nonveg_meals_weekly',
        type: 'stepper',
        label: 'How many non-vegetarian / egg meals do you consume per week?',
        min: 1,
        max: 14,
        step: 1,
        defaultValue: 4,
        unit: 'meals/week',
      },
      {
        id: 'meals_to_replace',
        type: 'stepper',
        label: 'How many of these meals are you willing to replace with protein-rich plant dishes (chole, rajma, sprouts)?',
        min: 1,
        max: 7,
        step: 1,
        defaultValue: 2,
        unit: 'meals/week',
      },
    ],
  },

  waste_seasonal_local: {
    activityId: 'waste_seasonal_local',
    title: 'Seasonal & Local Produce Audit',
    subtitle: 'Locally grown seasonal crops require no cold storage or long-distance refrigerated transit',
    questions: [
      {
        id: 'buys_imported_offseason',
        type: 'radio',
        label: 'Do you frequently buy exotic/off-season imported produce (e.g. out-of-season berries, imported apples)?',
        options: [
          { id: 'often', label: 'Yes, regularly', icon: '✈️' },
          { id: 'sometimes', label: 'Occasionally', icon: '🍎' },
          { id: 'strictly_local', label: 'Mostly local Indian seasonal produce', icon: '🇮🇳' },
        ],
        defaultValue: 'sometimes',
      },
    ],
  },

  waste_native_tree: {
    activityId: 'waste_native_tree',
    title: 'Native Tree Planting Feasibility',
    subtitle: 'Indigenous trees (Neem, Peepal, Jamun) support native birds and sequester carbon over decades',
    questions: [
      {
        id: 'planting_location',
        type: 'radio',
        label: 'Where do you plan to plant and nurture the native sapling?',
        options: [
          { id: 'own_compound', label: 'Own garden / residential society compound', icon: '🏡' },
          { id: 'community_park', label: 'Neighborhood municipal park / school ground', icon: '🌳' },
          { id: 'large_terrace_pot', label: 'Large terrace drum container', icon: '🪴' },
        ],
        defaultValue: 'own_compound',
      },
      {
        id: 'watering_commitment',
        type: 'radio',
        label: 'Can you commit to watering and protecting the sapling for at least 6 months?',
        options: [
          { id: 'committed', label: 'Yes, regular daily/alternate day access', icon: '✅' },
          { id: 'shared', label: 'Shared responsibility with neighbors/gardener', icon: '🤝' },
        ],
        defaultValue: 'committed',
      },
    ],
  },

  waste_grow_herbs: {
    activityId: 'waste_grow_herbs',
    title: 'Kitchen Balcony Garden Audit',
    subtitle: 'Grow zero-kilometer fresh mint, coriander, tulsi and chillies at home',
    questions: [
      {
        id: 'pots_count',
        type: 'stepper',
        label: 'How many pots do you plan to set up for herbs / microgreens?',
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 2,
        unit: 'pots',
      },
      {
        id: 'sunlight_hours',
        type: 'slider',
        label: 'Hours of direct sunlight on your balcony/window sill:',
        min: 1,
        max: 8,
        step: 0.5,
        defaultValue: 3,
        unit: 'hours/day',
      },
    ],
  },

  waste_community_cleanup: {
    activityId: 'waste_community_cleanup',
    title: 'Community Cleanup Participation',
    subtitle: 'Join hands with local civic groups or societies to remove litter from public spots',
    questions: [
      {
        id: 'cleanup_focus_area',
        type: 'radio',
        label: 'What public area in your vicinity needs cleanup attention?',
        options: [
          { id: 'lake_riverbank', label: 'Lake, riverfront, or stormwater drain bank', icon: '🌊' },
          { id: 'neighborhood_park', label: 'Public garden / roadside green belt', icon: '🏞️' },
          { id: 'street_market', label: 'Market square or bus stop surroundings', icon: '🛍️' },
        ],
        defaultValue: 'neighborhood_park',
      },
      {
        id: 'hours_committed',
        type: 'slider',
        label: 'How many volunteer hours can you contribute over the weekend drive?',
        min: 1,
        max: 5,
        step: 0.5,
        defaultValue: 2,
        unit: 'hours',
      },
    ],
  },
};

/** Get questionnaire configuration for a given activityId */
function getQuestionnaire(activityId) {
  if (QUESTIONNAIRES[activityId]) {
    return QUESTIONNAIRES[activityId];
  }

  // Graceful fallback questionnaire for any unlisted activity
  return {
    activityId,
    title: 'Personal Baseline Assessment',
    subtitle: 'Answer a few quick questions to calibrate your sustainability challenge',
    questions: [
      {
        id: 'current_frequency_per_week',
        type: 'stepper',
        label: 'How many days per week do you currently practice this action?',
        min: 0,
        max: 7,
        step: 1,
        defaultValue: 2,
        unit: 'days/week',
      },
      {
        id: 'commitment_level',
        type: 'radio',
        label: 'What pace of improvement feels comfortable for you?',
        options: [
          { id: 'gradual', label: 'Gradual (+1-2 days/week)', description: 'Low effort, sustainable habit building', icon: '🌱' },
          { id: 'ambitious', label: 'Ambitious (+3-4 days/week)', description: 'Faster impact and rewards', icon: '🚀' },
        ],
        defaultValue: 'gradual',
      },
    ],
  };
}

module.exports = {
  QUESTIONNAIRES,
  getQuestionnaire,
};
