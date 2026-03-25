import API from "./api";

/**
 * Record a property view for the logged-in user (upsert).
 */
export const recordView = async (propertyId) => {
  const response = await API.post(`/recently-viewed/${propertyId}`);
  return response.data;
};

/**
 * Get recently viewed properties for the logged-in user.
 */
export const getRecentlyViewed = async (params) => {
  const response = await API.get("/recently-viewed", { params });
  return response.data;
};
