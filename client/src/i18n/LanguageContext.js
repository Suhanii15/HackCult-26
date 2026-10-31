import React, { createContext, useContext, useState } from 'react';

const TRANSLATIONS = {
  en: {
    // Language Modal
    select_language_title: 'Choose Your Language',
    select_language_subtitle: 'તમારી ભાષા પસંદ કરો / अपनी भाषा चुनें',
    btn_confirm_language: 'Continue',

    // Welcome Screen
    app_title: 'Mission LiFE',
    app_subtitle: 'Lifestyle for Environment',
    app_tagline: 'Small daily actions create enduring planetary change.',
    welcome_slide1_badge: 'CARBON FOOTPRINT',
    welcome_slide1_title: 'Measure Your Impact',
    welcome_slide1_desc: 'Track your household electricity, LPG, and commute emissions with real local benchmarks.',
    welcome_slide1_stat_label: 'Average savings potential',
    welcome_slide1_stat_val: '2.4 tCO₂e / yr',

    welcome_slide2_badge: 'BEHAVIOURAL NUDGES',
    welcome_slide2_title: 'Daily Micro-Challenges',
    welcome_slide2_desc: 'Shift heavy appliance use away from peak grid hours and complete simple green daily habits.',
    welcome_slide2_stat_label: 'Citizens participating',
    welcome_slide2_stat_val: '18,500+ active',

    welcome_slide3_badge: 'CLEAN ENERGY',
    welcome_slide3_title: 'Solar & Community',
    welcome_slide3_desc: 'Calculate rooftop solar feasibility, claim PM Surya Ghar subsidy, and climb the leaderboards.',
    welcome_slide3_stat_label: 'Central subsidy available',
    welcome_slide3_stat_val: 'Up to ₹78,000',

    btn_create_account: 'Create an Account',
    btn_login: 'Log In',
    welcome_disclaimer: "By continuing, you join Gujarat's Mission LiFE climate pledge",

    // Auth Screen
    auth_signup_title: 'Join Mission LiFE',
    auth_signup_sub: 'Create your citizen profile to start tracking your footprint.',
    auth_login_title: 'Welcome Back',
    auth_login_sub: 'Enter your credentials to access your sustainability companion.',
    auth_name_label: 'Full Name',
    auth_name_placeholder: 'e.g. Priya Patel',
    auth_id_label: 'Email or Mobile Number',
    auth_id_placeholder: 'priya@example.com or 9876543210',
    auth_pass_label: 'Password',
    auth_quick_fill: '✨ Quick fill demo citizen',
    auth_btn_signup: 'Create Account & Continue →',
    auth_btn_login: 'Log In & Continue →',
    auth_security_note: '🔒 Secure login powered by Gujarat Energy Development Agency',

    // Screen 0: Mode Selection
    choose_mode_title: 'Choose Footprint Type',
    choose_mode_subtitle: 'Select the profile that best represents your daily living setup.',
    mode_household_title: 'Household',
    mode_household_desc: 'You share electricity or cooking bills at home with family or roommates.',
    mode_household_badge: 'Recommended for families',
    mode_individual_title: 'Individual',
    mode_individual_desc: 'Hostel, PG, rented room or shared flat with personal bills.',
    mode_individual_badge: 'Students & Single living',
    mode_not_sure_tip: 'Not sure? If you pay a household electricity bill, pick Household.',
    scan_bill_coming_soon: 'Scan bill (coming soon)',

    // Header & Navigation
    step_prefix: 'Step',
    of: 'of',
    back: 'Back',
    continue: 'Continue',
    skip: 'Not sure / Skip',
    personalise_optional: 'Personalise (Optional)',
    live_estimate: '~{val} kg CO₂/mo',
    partial_badge: 'Partial',
    coverage_title: 'Footprint Coverage',
    coverage_subtitle: 'Live tracking of your covered emission categories.',

    // Step 1: Home & Location
    step1_title: 'Where is your home? 📍',
    step1_sub: 'Location helps us apply the right grid emission factor and solar yield.',
    state_label: 'State',
    district_label: 'District',
    select_district: 'Select District',
    city_label: 'Major City / Taluka',
    select_city: 'Select City / Area',
    select_district_modal_title: 'Select District',
    select_state_modal_title: 'Select State',
    search_placeholder: 'Search...',

    // Step 2: Electricity
    step2_household_title: 'Household & Electricity ⚡',
    step2_individual_title: 'Room & Electricity ⚡',
    step2_sub: 'Electricity is typically the largest contributor to a home footprint.',
    household_members_label: 'How many people live in your household?',
    room_share_label: 'How many people share your room / flat?',
    is_elec_included_label: 'Is electricity included in your rent / fee?',
    elec_included_yes_title: 'Yes, Included',
    elec_included_yes_sub: 'Fixed rent / mess fees',
    elec_included_no_title: 'No, Separate Meter',
    elec_included_no_sub: 'I pay sub-meter units',
    how_know_elec: 'How do you know your electricity use?',
    where_find_this: 'Where do I find this? ⓘ',
    tile_kwh_title: 'Units (kWh)',
    tile_kwh_sub: 'From electric bill',
    tile_amount_title: 'Bill Amount (₹)',
    tile_amount_sub: 'Monthly rupee bill',
    tile_not_sure_title: 'Not Sure',
    tile_not_sure_sub: 'Estimate via appliances',
    monthly_units_slider_label: 'Monthly Electricity Units',
    monthly_units_helper: 'Tip: Average of your last 2–3 electricity bills works best',
    monthly_bill_amt_label: 'Average Monthly Bill Amount (₹)',
    estimated_kwh_banner: '⚡ Estimated: ~{val} kWh/mo',
    not_sure_banner_title: '💡 No worries!',
    not_sure_banner_text: 'We will calculate an accurate estimate from your home appliances in the next step.',
    solar_title: 'Rooftop Solar Installed? ☀️',
    solar_sub: 'Offset grid imports with your solar generation',
    solar_capacity_label: 'Rooftop System Capacity',
    solar_export_label: 'Monthly units exported to grid (kWh)',
    solar_export_helper: 'Deducted from your total grid consumption',

    // Step 3: Cooking
    step3_title: 'Cooking Fuel 🍳',
    step3_sub: 'Select all fuels you use in your kitchen. Each selected fuel will reveal details.',
    tile_lpg_title: 'LPG Cylinder',
    tile_lpg_sub: 'Bottled gas',
    tile_png_title: 'PNG Piped Gas',
    tile_png_sub: 'Adani / Gujarat Gas',
    tile_induction_title: 'Induction / Elec',
    tile_induction_sub: 'Electric stove',
    tile_other_fuel_title: 'Other Fuel',
    tile_other_fuel_sub: 'Biogas / Charcoal',
    no_cooking_fuel_btn: 'I do not use cooking fuel at home (Explicit 0 kg CO₂)',
    no_cooking_fuel_reported: '✓ Reported: No cooking fuel used',
    lpg_details_title: '🔴 LPG Cylinder Details',
    lpg_weeks_slider_label: 'How many weeks does one cylinder last?',
    png_details_title: '🔵 PNG Piped Gas Details',
    png_details_sub: 'Enter monthly SCM consumption from your gas bill.',
    png_scm_label: 'Monthly SCM (Standard Cubic Meters)',
    induction_notice_title: '⚡ Electric / Induction Cooking',
    induction_notice_text: 'Already included in your household electricity bill. 0 additional emissions added here to avoid double counting!',

    // Step 4: Travel
    step4_title: 'Your Regular Travel 🚗',
    step4_sub: 'Add the vehicles or commutes you take on a typical week.',
    no_travel_btn: 'I do not commute or travel regularly (Work from home / retired)',
    no_travel_reported: '✓ Reported: No regular travel (Explicit 0 kg CO₂)',
    select_transport_mode: 'Select Transport Mode:',
    trip_distance_label: 'Daily Commute Distance (Both ways)',
    days_travelled_label: 'Days travelled per month:',
    add_trip_btn: '+ Add another vehicle or trip',
    active_travel_title: 'Active Travel Badges',
    active_travel_sub: 'These earn you bonus eco-points and produce zero emissions.',
    badge_walk: '+ I also walk',
    badge_walk_active: '✓ I also walk',
    badge_cycle: '+ I also cycle',
    badge_cycle_active: '✓ I also cycle',
    view_result_btn: 'View My Footprint Result →',

    // Result Screen
    result_title: 'Your Baseline Footprint',
    per_month: 'per month',
    per_person: 'per person / month',
    category_breakdown_title: 'Category Breakdown',
    cat_electricity: 'Electricity',
    cat_cooking: 'Cooking Gas',
    cat_travel: 'Regular Travel',
    measured: 'Measured',
    reported: 'Reported',
    estimated: 'Estimated',
    unavailable: 'Unavailable',
    how_we_calculated: 'How we calculated this',
    start_first_challenge: 'Start My First Challenge 🌿',
    personalise_btn: '✦ Personalise with Home Appliances & Habits (Optional)',
  },

  gu: {
    select_language_title: 'તમારી ભાષા પસંદ કરો',
    select_language_subtitle: 'Choose your language / अपनी भाषा चुनें',
    btn_confirm_language: 'ચાલુ રાખો',

    // Welcome Screen
    app_title: 'મિશન LiFE',
    app_subtitle: 'પર્યાવરણ માટે જીવનશૈલી',
    app_tagline: 'રોજિંદા નાના પગલાં પૃથ્વીમાં મોટો બદલાવ લાવે છે.',
    welcome_slide1_badge: 'કાર્બન ફૂટપ્રિન્ટ',
    welcome_slide1_title: 'તમારી અસર માપો',
    welcome_slide1_desc: 'તમારા ઘરની વીજળી, ગેસ અને મુસાફરીના ઉત્સર્જનને ગુજરાતના ધોરણો મુજબ ટ્રેક કરો.',
    welcome_slide1_stat_label: 'સરેરાશ બચત ક્ષમતા',
    welcome_slide1_stat_val: '2.4 tCO₂e / વર્ષ',

    welcome_slide2_badge: 'વર્તણૂક સુધાર',
    welcome_slide2_title: 'દૈનિક ગ્રીન પડકારો',
    welcome_slide2_desc: 'પીક અવર્સ દરમિયાન વીજળી વપરાશ ઘટાડો અને દૈનિક પર્યાવરણ અનુકૂળ આદતો અપનાવો.',
    welcome_slide2_stat_label: 'સહભાગી નાગરિકો',
    welcome_slide2_stat_val: '18,500+ સક્રિય',

    welcome_slide3_badge: 'સ્વચ્છ ઊર્જા',
    welcome_slide3_title: 'સોલાર અને સમુદાય',
    welcome_slide3_desc: 'રૂફટોપ સોલાર બચત ગણો, પીએમ સૂર્ય ઘર સબસિડી મેળવો અને લીડરબોર્ડમાં આગળ વધો.',
    welcome_slide3_stat_label: 'કેન્દ્રીય સબસિડી ઉપલબ્ધ',
    welcome_slide3_stat_val: '₹78,000 સુધી',

    btn_create_account: 'ખાતું બનાવો',
    btn_login: 'લૉગ ઇન',
    welcome_disclaimer: 'આગળ વધીને તમે ગુજરાતના મિશન LiFE સંકલ્પમાં જોડાવ છો',

    // Auth Screen
    auth_signup_title: 'મિશન LiFE માં જોડાવો',
    auth_signup_sub: 'તમારો ફૂટપ્રિન્ટ માપવા માટે નાગરિક પ્રોફાઇલ બનાવો.',
    auth_login_title: 'સ્વાગત છે',
    auth_login_sub: 'તમારા એકાઉન્ટમાં પ્રવેશ કરવા માહિતી દાખલ કરો.',
    auth_name_label: 'પૂરું નામ',
    auth_name_placeholder: 'દા.ત. પ્રિયા પટેલ',
    auth_id_label: 'ઈમેલ અથવા મોબાઈલ નંબર',
    auth_id_placeholder: 'priya@example.com અથવા 9876543210',
    auth_pass_label: 'પાસવર્ડ',
    auth_quick_fill: '✨ ડેમો નાગરિક વિગતો ભરો',
    auth_btn_signup: 'ખાતું બનાવો અને આગળ વધો →',
    auth_btn_login: 'લૉગ ઇન કરો અને આગળ વધો →',
    auth_security_note: '🔒 ગુજરાત એનર્જી ડેવલપમેન્ટ એજન્સી (GEDA) દ્વારા સુરક્ષિત',

    // Screen 0: Mode Selection
    choose_mode_title: 'ફૂટપ્રિન્ટ પ્રકાર પસંદ કરો',
    choose_mode_subtitle: 'તમારી દૈનિક રહેણીકરણી મુજબ યોગ્ય વિકલ્પ પસંદ કરો.',
    mode_household_title: 'પરિવાર / ઘર',
    mode_household_desc: 'તમે ઘરમાં વીજળી અથવા રસોઈ ગેસનું બિલ પરિવાર કે રૂમમેટ્સ સાથે શેર કરો છો.',
    mode_household_badge: 'પરિવારો માટે ભલામણ કરેલ',
    mode_individual_title: 'વ્યક્તિગત',
    mode_individual_desc: 'હોસ્ટેલ, પીજી, ભાડાનો રૂમ અથવા પોતાના અલગ બિલ સાથે.',
    mode_individual_badge: 'વિદ્યાર્થીઓ અને એકલા રહેતા લોકો',
    mode_not_sure_tip: 'ખાતરી નથી? જો તમે ઘરનું વીજળી બિલ ચૂકવો છો, તો પરિવાર પસંદ કરો.',
    scan_bill_coming_soon: 'બિલ સ્કેન કરો (ટૂંક સમયમાં)',

    // Header & Navigation
    step_prefix: 'પગલું',
    of: 'માંથી',
    back: 'પાછળ',
    continue: 'આગળ વધો',
    skip: 'ખાતરી નથી / છોડો',
    personalise_optional: 'વ્યક્તિગત કરો (વૈકલ્પિક)',
    live_estimate: '~{val} કિગ્રા CO₂/મહિનો',
    partial_badge: 'અપૂર્ણ',
    coverage_title: 'ફૂટપ્રિન્ટ કવરેજ',
    coverage_subtitle: 'તમારા આવરી લીધેલા ઉત્સર્જન ક્ષેત્રોનું લાઇવ ટ્રેકિંગ.',

    // Step 1: Home & Location
    step1_title: 'તમારું રહેઠાણ ક્યાં છે? 📍',
    step1_sub: 'સ્થાન મુજબ ગ્રીડ ફેક્ટર અને સોલાર ક્ષમતા નક્કી થાય છે.',
    state_label: 'રાજ્ય',
    district_label: 'જિલ્લો',
    select_district: 'જિલ્લો પસંદ કરો',
    city_label: 'મુખ્ય શહેર / વિસ્તાર',
    select_city: 'શહેર પસંદ કરો',
    select_district_modal_title: 'જિલ્લો પસંદ કરો',
    select_state_modal_title: 'રાજ્ય પસંદ કરો',
    search_placeholder: 'શોધો...',

    // Step 2: Electricity
    step2_household_title: 'પરિવાર અને વીજળી ⚡',
    step2_individual_title: 'રૂમ અને વીજળી ⚡',
    step2_sub: 'ઘરના કાર્બન ફૂટપ્રિન્ટમાં વીજળી સૌથી મોટો ભાગ ભજવે છે.',
    household_members_label: 'તમારા ઘરમાં કેટલા સભ્યો રહે છે?',
    room_share_label: 'તમારા રૂમ / ફ્લેટમાં કેટલા લોકો સાથે રહે છે?',
    is_elec_included_label: 'શું વીજળી ભાડામાં શામેલ છે?',
    elec_included_yes_title: 'હા, શામેલ છે',
    elec_included_yes_sub: 'ફિક્સ ભાડું / ફી',
    elec_included_no_title: 'ના, અલગ મીટર છે',
    elec_included_no_sub: 'હું યુનિટ મુજબ ચૂકવું છું',
    how_know_elec: 'તમે વીજળી વપરાશ કેવી રીતે જાણો છો?',
    where_find_this: 'આ ક્યાં જોવા મળશે? ⓘ',
    tile_kwh_title: 'યુનિટ્સ (kWh)',
    tile_kwh_sub: 'વીજળી બિલમાંથી',
    tile_amount_title: 'બિલ રકમ (₹)',
    tile_amount_sub: 'માસિક રૂપિયા બિલ',
    tile_not_sure_title: 'ખાતરી નથી',
    tile_not_sure_sub: 'સાધનો પરથી અંદાજ',
    monthly_units_slider_label: 'માસિક વીજળી યુનિટ્સ',
    monthly_units_helper: 'સૂચન: છેલ્લા 2–3 બિલની સરેરાશ શ્રેષ્ઠ રહેશે',
    monthly_bill_amt_label: 'સરેરાશ માસિક બિલ રકમ (₹)',
    estimated_kwh_banner: '⚡ અંદાજિત: ~{val} kWh/મહિનો',
    not_sure_banner_title: '💡 ચિંતા કરશો નહીં!',
    not_sure_banner_text: 'આપણે ઘરના ઉપકરણો પરથી સચોટ અંદાજ મેળવીશું.',
    solar_title: 'રૂફટોપ સોલાર લગાવેલ છે? ☀️',
    solar_sub: 'સોલાર ઉત્પાદનથી ગ્રીડ વપરાશમાં ઘટાડો કરો',
    solar_capacity_label: 'સોલાર સિસ્ટમ ક્ષમતા (kW)',
    solar_export_label: 'ગ્રીડમાં એક્સપોર્ટ કરેલ માસિક યુનિટ્સ (kWh)',
    solar_export_helper: 'તમારા કુલ ગ્રીડ વપરાશમાંથી બાદ કરવામાં આવશે',

    // Step 3: Cooking
    step3_title: 'રસોઈ ઇંધણ 🍳',
    step3_sub: 'તમે ઉપયોગ કરતા તમામ ઇંધણ પસંદ કરો.',
    tile_lpg_title: 'LPG સિલિન્ડર',
    tile_lpg_sub: 'ગેસ બાટલો',
    tile_png_title: 'PNG પાઇપ ગેસ',
    tile_png_sub: 'અદાણી / ગુજરાત ગેસ',
    tile_induction_title: 'ઇન્ડક્શન / ઇલેક્ટ્રિક',
    tile_induction_sub: 'વીજળીનો ચૂલો',
    tile_other_fuel_title: 'અન્ય ઇંધણ',
    tile_other_fuel_sub: 'બાયોગેસ / કોલસો',
    no_cooking_fuel_btn: 'હું રસોઈ ઇંધણ વાપરતો નથી (0 કિગ્રા CO₂)',
    no_cooking_fuel_reported: '✓ નોંધાયેલ: રસોઈ ઇંધણ નથી',
    lpg_details_title: '🔴 LPG સિલિન્ડર વિગતો',
    lpg_weeks_slider_label: 'એક સિલિન્ડર કેટલા અઠવાડિયા ચાલે છે?',
    png_details_title: '🔵 PNG પાઇપ ગેસ વિગતો',
    png_details_sub: 'ગેસ બિલમાંથી માસિક SCM વપરાશ દાખલ કરો.',
    png_scm_label: 'માસિક SCM (સ્ટાન્ડર્ડ ક્યુબિક મીટર)',
    induction_notice_title: '⚡ ઇલેક્ટ્રિક / ઇન્ડક્શન રસોઈ',
    induction_notice_text: 'આ વપરાશ વીજળી બિલમાં પહેલેથી સમાયેલ છે. બેવડી ગણતરી ટાળવા અહીં 0 ઉમેરાય છે!',

    // Step 4: Travel
    step4_title: 'તમારી દૈનિક મુસાફરી 🚗',
    step4_sub: 'તમે સામાન્ય રીતે વાપરતા વાહનો ઉમેરો.',
    no_travel_btn: 'હું નિયમિત મુસાફરી કરતો નથી (વર્ક ફ્રોમ હોમ / નિવૃત્ત)',
    no_travel_reported: '✓ નોંધાયેલ: કોઈ મુસાફરી નથી (0 કિગ્રા CO₂)',
    select_transport_mode: 'મુસાફરી મોડ પસંદ કરો:',
    trip_distance_label: 'દૈનિક મુસાફરી અંતર (બંને બાજુનું)',
    days_travelled_label: 'મહિનામાં મુસાફરીના દિવસો:',
    add_trip_btn: '+ અન્ય વાહન અથવા મુસાફરી ઉમેરો',
    active_travel_title: 'સક્રિય મુસાફરી બેજ',
    active_travel_sub: 'આનાથી બોનસ પોઇન્ટ મળે છે અને શૂન્ય પ્રદૂષણ થાય છે.',
    badge_walk: '+ હું ચાલું પણ છું',
    badge_walk_active: '✓ હું ચાલું પણ છું',
    badge_cycle: '+ હું સાઇકલ પણ ચલાવું છું',
    badge_cycle_active: '✓ હું સાઇકલ પણ ચલાવું છું',
    view_result_btn: 'મારું પરિણામ જુઓ →',

    // Result Screen
    result_title: 'તમારી બેઝલાઇન ફૂટપ્રિન્ટ',
    per_month: 'પ્રતિ મહિને',
    per_person: 'વ્યક્તિ દીઠ / મહિનો',
    category_breakdown_title: 'કેટેગરી મુજબ વિભાજન',
    cat_electricity: 'વીજળી',
    cat_cooking: 'રસોઈ ગેસ',
    cat_travel: 'મુસાફરી',
    measured: 'માપેલું',
    reported: 'નોંધાયેલું',
    estimated: 'અંદાજિત',
    unavailable: 'ઉપલબ્ધ નથી',
    how_we_calculated: 'અમે આ કેવી રીતે ગણતરી કરી',
    start_first_challenge: 'પ્રથમ પડકાર શરૂ કરો 🌿',
    personalise_btn: '✦ ઘરના સાધનો અને આદતોથી વ્યક્તિગત કરો (વૈકલ્પિક)',
  },

  hi: {
    select_language_title: 'अपनी भाषा चुनें',
    select_language_subtitle: 'Choose your language / તમારી ભાષા પસંદ કરો',
    btn_confirm_language: 'जारी रखें',

    // Welcome Screen
    app_title: 'मिशन LiFE',
    app_subtitle: 'पर्यावरण के लिए जीवनशैली',
    app_tagline: 'दैनिक छोटे कदम पृथ्वी में बड़ा बदलाव लाते हैं।',
    welcome_slide1_badge: 'कार्बन फुटप्रिंट',
    welcome_slide1_title: 'अपना प्रभाव मापें',
    welcome_slide1_desc: 'अपने घर की बिजली, गैस और यात्रा उत्सर्जन को स्थानीय मानकों के अनुसार ट्रैक करें।',
    welcome_slide1_stat_label: 'औसत बचत क्षमता',
    welcome_slide1_stat_val: '2.4 tCO₂e / वर्ष',

    welcome_slide2_badge: 'व्यवहार सुधार',
    welcome_slide2_title: 'दैनिक हरित चुनौतियाँ',
    welcome_slide2_desc: 'पीक घंटों के दौरान बिजली उपयोग घटाएं और सरल दैनिक हरित आदतें अपनाएं।',
    welcome_slide2_stat_label: 'प्रतिभागी नागरिक',
    welcome_slide2_stat_val: '18,500+ सक्रिय',

    welcome_slide3_badge: 'स्वच्छ ऊर्जा',
    welcome_slide3_title: 'सौर ऊर्जा और समुदाय',
    welcome_slide3_desc: 'रूफटॉप सोलर बचत का आकलन करें, पीएम सूर्य घर सब्सिडी पाएं और लीडरबोर्ड में आगे बढ़ें।',
    welcome_slide3_stat_label: 'केंद्रीय सब्सिडी उपलब्ध',
    welcome_slide3_stat_val: '₹78,000 तक',

    btn_create_account: 'खाता बनाएं',
    btn_login: 'लॉग इन',
    welcome_disclaimer: 'आगे बढ़कर आप मिशन LiFE के हरित संकल्प में शामिल होते हैं',

    // Auth Screen
    auth_signup_title: 'मिशन LiFE से जुड़ें',
    auth_signup_sub: 'अपना फुटप्रिंट ट्रैक करने के लिए नागरिक प्रोफाइल बनाएं।',
    auth_login_title: 'वापसी पर स्वागत है',
    auth_login_sub: 'अपने खाते में प्रवेश करने के लिए विवरण दर्ज करें।',
    auth_name_label: 'पूरा नाम',
    auth_name_placeholder: 'उदा. प्रिया पटेल',
    auth_id_label: 'ईमेल या मोबाइल नंबर',
    auth_id_placeholder: 'priya@example.com या 9876543210',
    auth_pass_label: 'पासवर्ड',
    auth_quick_fill: '✨ डेमो नागरिक विवरण भरें',
    auth_btn_signup: 'खाता बनाएं और आगे बढ़ें →',
    auth_btn_login: 'लॉग इन करें और आगे बढ़ें →',
    auth_security_note: '🔒 गुजरात ऊर्जा विकास एजेंसी (GEDA) द्वारा सुरक्षित',

    // Screen 0: Mode Selection
    choose_mode_title: 'फुटप्रिंट प्रकार चुनें',
    choose_mode_subtitle: 'अपनी दैनिक जीवनशैली के अनुसार उपयुक्त प्रोफाइल चुनें।',
    mode_household_title: 'परिवार / घर',
    mode_household_desc: 'आप घर पर बिजली या रसोई गैस का बिल परिवार या रूममेट्स के साथ साझा करते हैं।',
    mode_household_badge: 'परिवारों के लिए अनुशंसित',
    mode_individual_title: 'व्यक्तिगत',
    mode_individual_desc: 'हॉस्टल, पीजी, किराए का कमरा या अपने अलग बिल के साथ।',
    mode_individual_badge: 'छात्र और अकेले रहने वाले लोग',
    mode_not_sure_tip: 'निश्चिंत नहीं हैं? यदि आप घरेलू बिजली बिल भरते हैं, तो परिवार चुनें।',
    scan_bill_coming_soon: 'बिल स्कैन करें (जल्द आ रहा है)',

    // Header & Navigation
    step_prefix: 'चरण',
    of: 'का',
    back: 'पीछे',
    continue: 'आगे बढ़ें',
    skip: 'निश्चिंत नहीं / छोड़ें',
    personalise_optional: 'निजीकृत करें (वैकल्पिक)',
    live_estimate: '~{val} किग्रा CO₂/माह',
    partial_badge: 'आंशिक',
    coverage_title: 'फुटप्रिंट कवरेज',
    coverage_subtitle: 'आपके शामिल किए गए उत्सर्जन क्षेत्रों की लाइव ट्रैकिंग।',

    // Step 1: Home & Location
    step1_title: 'आपका निवास कहाँ है? 📍',
    step1_sub: 'स्थान के आधार पर सही ग्रिड उत्सर्जन दर लागू होती है।',
    state_label: 'राज्य',
    district_label: 'जिला',
    select_district: 'जिला चुनें',
    city_label: 'प्रमुख शहर / क्षेत्र',
    select_city: 'शहर चुनें',
    select_district_modal_title: 'जिला चुनें',
    select_state_modal_title: 'राज्य चुनें',
    search_placeholder: 'खोजें...',

    // Step 2: Electricity
    step2_household_title: 'परिवार और बिजली ⚡',
    step2_individual_title: 'कमरा और बिजली ⚡',
    step2_sub: 'घरेलू कार्बन फुटप्रिंट में बिजली सबसे बड़ा कारक होती है।',
    household_members_label: 'आपके घर में कितने सदस्य रहते हैं?',
    room_share_label: 'आपके कमरे / फ्लैट में कितने लोग साथ रहते हैं?',
    is_elec_included_label: 'क्या बिजली किराए में शामिल है?',
    elec_included_yes_title: 'हाँ, शामिल है',
    elec_included_yes_sub: 'निश्चित किराया / मेस फीस',
    elec_included_no_title: 'नहीं, अलग मीटर है',
    elec_included_no_sub: 'मैं यूनिट अनुसार भुगतान करता हूँ',
    how_know_elec: 'आप अपने बिजली उपयोग को कैसे जानते हैं?',
    where_find_this: 'यह कहाँ मिलेगा? ⓘ',
    tile_kwh_title: 'यूनिट (kWh)',
    tile_kwh_sub: 'बिजली बिल से',
    tile_amount_title: 'बिल राशि (₹)',
    tile_amount_sub: 'मासिक रुपया बिल',
    tile_not_sure_title: 'निश्चिंत नहीं',
    tile_not_sure_sub: 'उपकरणों से अनुमान',
    monthly_units_slider_label: 'मासिक बिजली यूनिट्स',
    monthly_units_helper: 'सुझाव: पिछले 2–3 बिलों का औसत सबसे बेहतर रहता है',
    monthly_bill_amt_label: 'औसत मासिक बिल राशि (₹)',
    estimated_kwh_banner: '⚡ अनुमानित: ~{val} kWh/माह',
    not_sure_banner_title: '💡 कोई चिंता नहीं!',
    not_sure_banner_text: 'हम अगले चरण में घरेलू उपकरणों के आधार पर सटीक अनुमान लगाएंगे।',
    solar_title: 'रूफटॉप सोलर लगा है? ☀️',
    solar_sub: 'सोलर उत्पादन से ग्रिड खपत में कटौती करें',
    solar_capacity_label: 'सोलर सिस्टम क्षमता (kW)',
    solar_export_label: 'ग्रिड में निर्यात की गई मासिक यूनिट (kWh)',
    solar_export_helper: 'आपकी कुल ग्रिड खपत से घटा दिया जाएगा',

    // Step 3: Cooking
    step3_title: 'रसोई गैस और ईंधन 🍳',
    step3_sub: 'अपनी रसोई में उपयोग किए जाने वाले सभी ईंधन चुनें।',
    tile_lpg_title: 'एलपीजी सिलेंडर',
    tile_lpg_sub: 'गैस सिलेंडर',
    tile_png_title: 'पीएनजी पाइप गैस',
    tile_png_sub: 'अदाणी / गुजरात गैस',
    tile_induction_title: 'इंडक्शन / इलेक्ट्रिक',
    tile_induction_sub: 'बिजली का चूल्हा',
    tile_other_fuel_title: 'अन्य ईंधन',
    tile_other_fuel_sub: 'बायोगैस / कोयला',
    no_cooking_fuel_btn: 'मैं रसोई ईंधन का उपयोग नहीं करता (0 किग्रा CO₂)',
    no_cooking_fuel_reported: '✓ दर्ज: कोई रसोई ईंधन नहीं',
    lpg_details_title: '🔴 एलपीजी सिलेंडर विवरण',
    lpg_weeks_slider_label: 'एक सिलेंडर कितने सप्ताह चलता है?',
    png_details_title: '🔵 पीएनजी पाइप गैस विवरण',
    png_details_sub: 'गैस बिल से मासिक SCM खपत दर्ज करें।',
    png_scm_label: 'मासिक SCM (मानक घन मीटर)',
    induction_notice_title: '⚡ इलेक्ट्रिक / इंडक्शन रसोई',
    induction_notice_text: 'यह खपत बिजली बिल में पहले से शामिल है। दोहरी गणना से बचने के लिए यहाँ 0 जोड़ा गया है!',

    // Step 4: Travel
    step4_title: 'आपकी दैनिक यात्रा 🚗',
    step4_sub: 'वे वाहन जोड़ें जिनका आप सामान्य सप्ताह में उपयोग करते हैं।',
    no_travel_btn: 'मैं नियमित यात्रा नहीं करता (घर से काम / सेवानिवृत्त)',
    no_travel_reported: '✓ दर्ज: कोई यात्रा नहीं (0 किग्रा CO₂)',
    select_transport_mode: 'परिवहन मोड चुनें:',
    trip_distance_label: 'दैनिक यात्रा दूरी (दोनों तरफ की)',
    days_travelled_label: 'महीने में यात्रा के दिन:',
    add_trip_btn: '+ अन्य वाहन या यात्रा जोड़ें',
    active_travel_title: 'सक्रिय यात्रा बैज',
    active_travel_sub: 'इससे बोनस अंक मिलते हैं और शून्य प्रदूषण होता है।',
    badge_walk: '+ मैं पैदल भी चलता हूँ',
    badge_walk_active: '✓ मैं पैदल भी चलता हूँ',
    badge_cycle: '+ मैं साइकिल भी चलाता हूँ',
    badge_cycle_active: '✓ मैं साइकिल भी चलाता हूँ',
    view_result_btn: 'मेरा फुटप्रिंट परिणाम देखें →',

    // Result Screen
    result_title: 'आपका बेसलाइन फुटप्रिंट',
    per_month: 'प्रति माह',
    per_person: 'प्रति व्यक्ति / माह',
    category_breakdown_title: 'श्रेणीवार विभाजन',
    cat_electricity: 'बिजली',
    cat_cooking: 'रसोई गैस',
    cat_travel: 'दैनिक यात्रा',
    measured: 'मापा गया',
    reported: 'दर्ज किया गया',
    estimated: 'अनुमानित',
    unavailable: 'अनुपलब्ध',
    how_we_calculated: 'हमने इसकी गणना कैसे की',
    start_first_challenge: 'पहली चुनौती शुरू करें 🌿',
    personalise_btn: '✦ घरेलू उपकरणों और आदतों से निजीकृत करें (वैकल्पिक)',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en'); // 'en' | 'gu' | 'hi'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setLanguage = (lang) => {
    if (TRANSLATIONS[lang]) {
      setLanguageState(lang);
    }
  };

  const openLanguageModal = () => setIsModalOpen(true);
  const closeLanguageModal = () => setIsModalOpen(false);

  const t = (key, params = {}) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let text = dict[key] || TRANSLATIONS.en[key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isModalOpen,
        openLanguageModal,
        closeLanguageModal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
