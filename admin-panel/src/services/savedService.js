import API from "./api";

/**
 * Toggle save/unsave a property.
 * If already saved, unsaves it; otherwise saves it.
 */
export const saveProperty = async (propertyId) => {
  const response = await API.post(`/saved/${propertyId}`);
  return response.data;
};

/**
 * Explicitly unsave a property.
 */
export const unsaveProperty = async (propertyId) => {
  const response = await API.delete(`/saved/${propertyId}`);
  return response.data;
};

/**
 * Get all saved properties for the logged-in user (paginated).
 */
export const getSavedProperties = async (params) => {
  const response = await API.get("/saved", { params });
  return response.data;
};

/**
 * Check if a single property is saved by the current user.
 * Returns { saved: true/false }
 */
export const checkSaved = async (propertyId) => {
  const response = await API.get(`/saved/check/${propertyId}`);
  return response.data.data;
};

/**
 * Batch check saved status for multiple property IDs.
 * Returns a map of { propertyId: true } for saved ones.
 */
export const checkSavedBatch = async (ids) => {
  const response = await API.get("/saved/check-batch", {
    params: { ids: ids.join(",") },
  });
  return response.data.data;
};
