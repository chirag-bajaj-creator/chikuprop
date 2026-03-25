import API from "./api";

/**
 * Get vendor dashboard stats (totalListings, totalViews, totalLeads, totalUnlocks).
 */
export const getVendorStats = async () => {
  const response = await API.get("/dashboard/vendor");
  return response.data.data;
};

/**
 * Get properties the buyer has unlocked contact for (paginated).
 */
export const getBuyerContacted = async (params) => {
  const response = await API.get("/dashboard/buyer", { params });
  return response.data;
};

/**
 * Get wanted properties that match vendor's active listings.
 */
export const getMatchingBuyers = async () => {
  const response = await API.get("/dashboard/matching-buyers");
  return response.data.data;
};
