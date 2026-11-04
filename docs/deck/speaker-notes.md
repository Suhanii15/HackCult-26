# EcoPulse Pitch Deck — Speaker Notes
*2 to 3 Minute HackCult '26 Video Presentation Script (Two Sentences Per Slide)*

---

### Slide 1: Title
"Welcome to EcoPulse, our citizen-centric carbon accounting and rooftop solar adoption platform engineered for HackCult '26 under track HC26-GEDA01. Built specifically for Gujarat households, EcoPulse bridges the critical gap between climate awareness and verifiable everyday sustainability."

---

### Slide 2: The Problem
"While citizens widely recognize climate urgency, they lack transparent, localized tools to measure their domestic footprint, evaluate solar ROI, or sustain daily green habits. This creates a data blindspot for urban households, housing communities, and state administrators working toward Mission LiFE targets."

---

### Slide 3: The Solution
"EcoPulse delivers four unified capabilities: a deterministic household carbon calculator, daily micro-habit nudges, an interactive PM Surya Ghar rooftop solar wizard, and community gamification. Every calculation runs on audited scientific standards, giving citizens verifiable metrics rather than vague environmental estimates."

---

### Slide 4: Product Walkthrough
"Our mobile-first application features a tri-lingual interface supporting English, Gujarati, and Hindi with clear status badges indicating whether data is measured, reported, or estimated. From a four-step onboarding baseline to tactile solar bill sliders and direct contact with verified empanelled installers, the user journey is frictionless and intuitive."

---

### Slide 5: System Architecture
"Our dual-engine architecture mirrors the deterministic calculation logic between the React Native client and Express backend, guaranteeing instant on-device previews while enforcing authoritative server-side validation. Secured by stateless JWT authentication, the API persists auditable calculation snapshots to MongoDB Atlas before returning verified verdicts."

---

### Slide 6: Calculation Engine & Standards
"Every emission and solar formula in EcoPulse is strictly config-driven and backed by verified benchmarks, including CEA Baseline Database Version 19, GERC residential tariff slabs, and JRC PVGIS solar yields across all thirty-three Gujarat districts. Our pure calculation engine is validated by twenty-four automated unit tests with zero runtime network dependencies or inline magic numbers."

---

### Slide 7: Database Schema
"Our MongoDB data model is engineered for auditability, pairing relational indexing with an append-only points ledger that prevents duplicate reward payouts. Furthermore, every citizen's baseline footprint snapshot is stored as an immutable record, ensuring historical emission reductions remain mathematically uncompromised."

---

### Slide 8: Tech Stack
"We selected a modern, unified JavaScript stack featuring React Native Expo for cross-platform mobile delivery, Express on Node 20 LTS for high-concurrency API performance, and MongoDB Atlas for nested survey storage. TanStack Query provides optimistic offline caching, ensuring the application remains fully functional even in low-connectivity environments."

---

### Slide 9: Value & Scalability
"EcoPulse directly empowers citizens to unlock up to seventy-eight thousand rupees in PM Surya Ghar subsidies and up to nine point eight lakh rupees in lifetime bill savings, while providing state administrators with aggregated adoption signals. The architecture scales effortlessly via stateless workers, client compute offloading, and indexed document queries."

---

### Slide 10: Limitations & Roadmap
"We maintain full transparency: our current release relies on self-reported utility inputs and benchmark solar EPC costs pending formal GEDA tender rate discoveries. Over the next two weeks to twelve months, our phased roadmap expands from finalizing full Gujarati translations and launching the GEDA administrative dashboard to integrating automated GUVNL smart-meter synchronization."
