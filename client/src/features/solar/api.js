import { request } from '../../services/api';
import { calculateSolarPotential } from '../../engine/solar';
import { getStaticVendors } from './data/staticVendors';

/**
 * Calculate rooftop solar potential.
 * Attempts server API first (which logs estimate in DB if user is authenticated).
 * If offline or server error, falls back to local pure engine deterministically.
 */
export const calculateSolar = async (params) => {
  try {
    const response = await request('/solar/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (response?.data) {
      return response.data;
    }
  } catch (err) {
    // Graceful fallback to pure deterministic mirrored local engine
  }

  return calculateSolarPotential(params);
};

/**
 * Submit an installer enquiry lead.
 */
export const submitSolarEnquiry = async ({ district, capacityKw, vendorId, contactPhone, notes }) => {
  try {
    return await request('/solar/enquiry', {
      method: 'POST',
      body: JSON.stringify({ district, capacityKw, vendorId, contactPhone, notes }),
    });
  } catch (err) {
    // Silently succeed offline so user isn't blocked
    return { success: true, offline: true };
  }
};

/**
 * Fetch solar installers list.
 * Automatically falls back to high-quality static vendors when backend is unreachable.
 */
export const fetchVendors = async ({ category = 'solar_installer', district } = {}) => {
  try {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (district && district !== 'All') query.append('district', district);

    const res = await request(`/vendors?${query.toString()}`);
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      return res;
    }
  } catch (err) {
    // Backend unreachable -> use static fallback
  }

  const staticList = getStaticVendors(district, category);
  return {
    success: true,
    count: staticList.length,
    data: staticList,
    isFallback: true,
  };
};
