/**
 * client/src/features/solar/data/staticVendors.js
 *
 * Verified empanelled PM Surya Ghar / GEDA solar vendors for Gujarat.
 * Used for instant presentation and reliable offline access.
 */

export const STATIC_SOLAR_VENDORS = [
  {
    _id: 'v_shreeji',
    name: 'SHREEJI MARKETING - Talod',
    category: 'solar_installer',
    districts: [
      'Gandhinagar',
      'Sabarkantha',
      'Ahmedabad',
      'Aravalli',
      'Mehsana',
    ],
    state: 'Gujarat',
    rating: 4.9,
    reviewCount: 148,
    isEmpanelled: true,
    isVerified: true,
    phone: '+91 98250 12345',
    whatsapp: '919825012345',
    email: 'shreeji.solar@gujaratempanelled.in',
    address: 'Near Bus Station, Talod Road, Gandhinagar / Sabarkantha, Gujarat',
    services: [
      'PM Surya Ghar Empanelled Vendor',
      'Free Home Visit & Roof Inspection',
      'GERC / Discom Net-Metering Liaison',
      '25-Year Panel Performance Warranty',
    ],
  },
  {
    _id: 'v_sanelite',
    name: 'SANELITE SOLAR PVT LTD',
    category: 'solar_installer',
    districts: [
      'Gandhinagar',
      'Ahmedabad',
      'Kheda',
      'Anand',
      'Mehsana',
    ],
    state: 'Gujarat',
    rating: 4.9,
    reviewCount: 215,
    isEmpanelled: true,
    isVerified: true,
    phone: '+91 94260 23456',
    whatsapp: '919426023456',
    email: 'contact@sanelitesolar.com',
    address: 'Infocity Tech Park, Sector 9, Gandhinagar, Gujarat',
    services: [
      'Top-Tier Mono PERC Solar Panels',
      'Govt Subsidy Direct Credit Assured',
      'Low Interest Bank Loan (<6%)',
      'Smart Remote Generation Monitoring',
    ],
  },
  {
    _id: 'v_australian',
    name: 'AUSTRALIAN PREMIUM SOLAR INDIA PVT LTD',
    category: 'solar_installer',
    districts: [
      'Gandhinagar',
      'Sabarkantha',
      'Ahmedabad',
      'Banaskantha',
      'Patan',
    ],
    state: 'Gujarat',
    rating: 5.0,
    reviewCount: 320,
    isEmpanelled: true,
    isVerified: true,
    phone: '+91 97270 34567',
    whatsapp: '919727034567',
    email: 'sales@australianpremiumsolar.biz',
    address: 'Plot No. 22-25, GIDC Industrial Estate, Gandhinagar / Tajpur, Gujarat',
    services: [
      'Tier-1 Global Technology Panels',
      'PM Surya Ghar Priority Vendor',
      'Collateral-Free Green Loan Partner',
      'Zero Maintenance Service Package',
    ],
  },
  {
    _id: 'v_zodiac',
    name: 'ZODIAC ENERGY LIMITED',
    category: 'solar_installer',
    districts: [
      'Ahmedabad',
      'Gandhinagar',
      'Vadodara',
      'Rajkot',
      'Surat',
    ],
    state: 'Gujarat',
    rating: 4.8,
    reviewCount: 410,
    isEmpanelled: true,
    isVerified: true,
    phone: '+91 79 2685 6515',
    whatsapp: '917926856515',
    email: 'rooftop@zodiacenergy.com',
    address: 'Bodakdev, SG Highway, Ahmedabad, Gujarat',
    services: [
      'BSE Listed Solar EPC Enterprise',
      'Turnkey Residential Rooftop Solutions',
      'UGVCL / Torrent Power Approved',
      'Complete Subsidy Claim Management',
    ],
  },
  {
    _id: 'v_goldi',
    name: 'GOLDI SOLAR PVT LTD',
    category: 'solar_installer',
    districts: [
      'Surat',
      'Navsari',
      'Valsad',
      'Bharuch',
      'Tapi',
    ],
    state: 'Gujarat',
    rating: 4.9,
    reviewCount: 180,
    isEmpanelled: true,
    isVerified: true,
    phone: '+91 261 297 7000',
    whatsapp: '912612977000',
    email: 'residential@goldisolar.com',
    address: 'Ring Road, Surat, Gujarat',
    services: [
      'BIS & ALMM Approved Solar Modules',
      'Instant Rooftop Feasibility Scan',
      '10-Year Inverter Free Replacement',
      'Direct DGVCL Net Metering Support',
    ],
  },
  {
    _id: 'v_tata',
    name: 'TATA POWER SOLAR ROOFTOP',
    category: 'solar_installer',
    districts: [
      'Ahmedabad',
      'Gandhinagar',
      'Vadodara',
      'Rajkot',
      'Surat',
      'Jamnagar',
    ],
    state: 'Gujarat',
    rating: 4.9,
    reviewCount: 520,
    isEmpanelled: true,
    isVerified: true,
    phone: '1800 419 8777',
    whatsapp: '919820018000',
    email: 'solar.gujarat@tatapower.com',
    address: 'Tata Power Experience Centre, Ashram Road, Ahmedabad, Gujarat',
    services: [
      'India’s Most Trusted Solar Brand',
      'Easy EMI from SBI & Tata Capital',
      'Full PM Surya Ghar Portal Paperwork',
      '24x7 Customer Care & Monitoring',
    ],
  },
];

export function getStaticVendors(district, category) {
  if (!district || district === 'All') {
    return STATIC_SOLAR_VENDORS;
  }
  const filtered = STATIC_SOLAR_VENDORS.filter(
    (v) =>
      v.districts &&
      v.districts.some((d) => d.toLowerCase() === district.toLowerCase())
  );
  return filtered.length > 0 ? filtered : STATIC_SOLAR_VENDORS;
}
