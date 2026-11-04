/**
 * scripts/generate-solar-yield.js
 *
 * Fetches annual solar photovoltaic yield (kWh per kWp) for all 33 Gujarat district centroids
 * from the official European Commission JRC Photovoltaic Geographical Information System (PVGIS) API.
 * Writes output to shared/engine/data/gujarat-yield.json.
 *
 * Usage: node scripts/generate-solar-yield.js
 */

const fs = require('fs');
const path = require('path');

const DISTRICT_CENTROIDS = {
  Ahmedabad: { lat: 23.0225, lon: 72.5714 },
  Amreli: { lat: 21.6000, lon: 71.2167 },
  Anand: { lat: 22.5645, lon: 72.9289 },
  Aravalli: { lat: 23.4619, lon: 73.3030 },
  Banaskantha: { lat: 24.1722, lon: 72.4344 },
  Bharuch: { lat: 21.7051, lon: 72.9959 },
  Bhavnagar: { lat: 21.7645, lon: 72.1519 },
  Botad: { lat: 22.1700, lon: 71.6600 },
  'Chhota Udaipur': { lat: 22.3108, lon: 74.0117 },
  Dahod: { lat: 22.8369, lon: 74.2547 },
  Dang: { lat: 20.7567, lon: 73.6844 },
  'Devbhoomi Dwarka': { lat: 22.2039, lon: 69.6583 },
  Gandhinagar: { lat: 23.2156, lon: 72.6369 },
  'Gir Somnath': { lat: 20.9500, lon: 70.4000 },
  Jamnagar: { lat: 22.4707, lon: 70.0577 },
  Junagadh: { lat: 21.5222, lon: 70.4579 },
  Kheda: { lat: 22.6916, lon: 72.8634 },
  Kutch: { lat: 23.2420, lon: 69.6669 },
  Mahisagar: { lat: 23.1333, lon: 73.6167 },
  Mehsana: { lat: 23.5880, lon: 72.3693 },
  Morbi: { lat: 22.8173, lon: 70.8377 },
  Narmada: { lat: 21.8711, lon: 73.5028 },
  Navsari: { lat: 20.9467, lon: 72.9520 },
  Panchmahal: { lat: 22.7758, lon: 73.6149 },
  Patan: { lat: 23.8493, lon: 72.1266 },
  Porbandar: { lat: 21.6417, lon: 69.6293 },
  Rajkot: { lat: 22.3039, lon: 70.8022 },
  Sabarkantha: { lat: 23.5977, lon: 72.9698 },
  Surat: { lat: 21.1702, lon: 72.8311 },
  Surendranagar: { lat: 22.7278, lon: 71.6370 },
  Tapi: { lat: 21.1119, lon: 73.3908 },
  Vadodara: { lat: 22.3072, lon: 73.1812 },
  Valsad: { lat: 20.5992, lon: 72.9342 },
};

const SYSTEM_LOSS_PERCENT = 14; // Standard PV system loss assumption
const PEAK_POWER_KW = 1; // 1 kWp nominal system for yield factor

async function fetchDistrictYield(district, lat, lon, retries = 3) {
  const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=${PEAK_POWER_KW}&loss=${SYSTEM_LOSS_PERCENT}&optimalangles=1&outputformat=json`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'EcoPulse-SolarEngine/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        throw new Error(`PVGIS HTTP ${response.status} for ${district} (${lat}, ${lon})`);
      }
      const data = await response.json();
      const yearlyYieldKwh = data?.outputs?.totals?.fixed?.E_y;

      if (typeof yearlyYieldKwh !== 'number') {
        throw new Error(`Invalid or missing E_y in PVGIS response for ${district}`);
      }

      return {
        kwhPerKwpPerYear: Math.round(yearlyYieldKwh * 10) / 10,
        lat,
        lon,
        optimumSlopeDegrees: data?.outputs?.inputs?.mounting_system?.fixed?.slope?.value || null,
        optimumAzimuthDegrees: data?.outputs?.inputs?.mounting_system?.fixed?.azimuth?.value || null,
      };
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function generate() {
  console.log('☀️ Generating Gujarat District Solar Yield Table from PVGIS API...');

  const districtsData = {};
  const entries = Object.entries(DISTRICT_CENTROIDS);

  let successCount = 0;
  for (const [district, { lat, lon }] of entries) {
    try {
      process.stdout.write(`  Fetching ${district} (${lat}, ${lon})... `);
      const res = await fetchDistrictYield(district, lat, lon);
      districtsData[district] = res;
      console.log(`✓ ${res.kwhPerKwpPerYear} kWh/kWp`);
      successCount++;
      // Polite delay between API requests to respect JRC server rate limits
      await new Promise((resolve) => setTimeout(resolve, 350));
    } catch (err) {
      console.error(`✗ Failed: ${err.message}`);
    }
  }

  if (successCount === 0) {
    console.error('\n⚠️  PVGIS API is unreachable. Writing nothing as per specification.');
    console.error('TODO: Check network connection or verify JRC PVGIS service availability.');
    process.exit(1);
  }

  // Calculate Gujarat average yield from fetched districts
  const yieldValues = Object.values(districtsData).map((d) => d.kwhPerKwpPerYear);
  const avgYield = Math.round((yieldValues.reduce((a, b) => a + b, 0) / yieldValues.length) * 10) / 10;

  const outputPayload = {
    source: 'European Commission Joint Research Centre (JRC) - Photovoltaic Geographical Information System (PVGIS-SARAH2 / v5.2)',
    sourceUrl: 'https://re.jrc.ec.europa.eu/pvg_tools/en/',
    fetchedAt: new Date().toISOString(),
    systemLossPercent: SYSTEM_LOSS_PERCENT,
    defaultYieldKwhPerKwp: avgYield || 1550,
    districtCount: Object.keys(districtsData).length,
    districts: districtsData,
  };

  const outputPath = path.resolve(__dirname, '../shared/engine/data/gujarat-yield.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(outputPayload, null, 2), 'utf8');

  console.log(`\n✅ Successfully generated ${outputPath}`);
  console.log(`  Covered ${successCount} districts. Average Gujarat Yield: ${avgYield} kWh/kWp/year.`);
}

if (require.main === module) {
  generate().catch((err) => {
    console.error('Fatal generator error:', err);
    process.exit(1);
  });
}

module.exports = { generate, DISTRICT_CENTROIDS };
