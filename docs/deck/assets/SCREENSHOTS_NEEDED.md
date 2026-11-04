# EcoPulse Pitch Deck — Screen Capture Manifest
*Documentation of mobile viewports (390x844 viewport ratio) captured for Slide 4*

---

### Captured Screens

1. **`screen_onboarding.png` — Onboarding & Baseline Survey**
   - **Component**: `client/src/features/solar/screens/SolarCalcScreen.js` (Step 1 / About you) & `client/src/features/footprint/`
   - **Dimensions**: 390 × 844 (Portrait mobile)
   - **Description**: Demonstrates the citizen registration flow, pre-filled verified inputs, and the friendly EcoMascot conversational guide.
   - **Status Badge**: `Reported`

2. **`screen_home.png` — Home Dashboard & Generation Wave**
   - **Component**: `client/src/features/home/screens/HomeScreen.js`
   - **Dimensions**: 390 × 844 (Portrait mobile)
   - **Description**: Displays the primary household carbon footprint snapshot, solar power generation wave (kWh), and smart daily suggestion cards.
   - **Status Badge**: `Measured`

3. **`screen_activity.png` — Activity Micro-Nudge & Daily Habit**
   - **Component**: `client/src/features/activities/screens/ActivityDetailScreen.js`
   - **Dimensions**: 390 × 844 (Portrait mobile)
   - **Description**: Displays a specific Mission LiFE daily micro-action (Energy, Water, Waste), including day-streak counters, carbon offset impact (kg CO₂e/month), and points claim confirmation.
   - **Status Badge**: `Measured` / `Reported`

4. **`screen_solar.png` — PM Surya Ghar Feasibility & Subsidy Result**
   - **Component**: `client/src/features/solar/screens/SolarCalcScreen.js` (Step 4 / Estimate)
   - **Dimensions**: 390 × 844 (Portrait mobile)
   - **Description**: 4-grid assessment showing system capacity (kW), gross capital cost, MNRE Central Subsidy (up to ₹78,000), concessional loan availability (<6%), and 25-year lifetime savings (₹Lakhs).
   - **Status Badge**: `Estimated` (Backed by GERC tariffs & PVGIS yields)

5. **`screen_vendors.png` — Verified Gujarat Installer Directory**
   - **Component**: `client/src/features/solar/screens/SolarCalcScreen.js` (Step 5 / Recommended Partners)
   - **Dimensions**: 390 × 844 (Portrait mobile)
   - **Description**: Empanelled EPC vendor cards for Gujarat districts with star ratings, direct phone dialer (`tel:`), and prefilled WhatsApp inquiry dispatch.
   - **Status Badge**: `Verified`

---

### Community & Admin Status
- **Community Screen (`client/src/features/community/screens/CommunityScreen.js`)**: Currently placeholder in repository; planned on 3-month roadmap.
- **Admin Dashboard**: Data models (`role: 'admin'`) and aggregation endpoints architected; full web portal scheduled for Phase 2 roadmap.
