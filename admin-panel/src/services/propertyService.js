import API from "./api";

/**
 * Upload images to Cloudinary via backend.
 * Expects a FileList or array of File objects.
 * Returns array of uploaded image URLs.
 */
export const uploadImages = async (files, onProgress) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("images", file);
  });

  const response = await API.post("/upload/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return response.data.data.urls;
};

/**
 * Upload a single video to Cloudinary via backend.
 * Returns the uploaded video URL.
 */
export const uploadVideo = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("video", file);

  const response = await API.post("/upload/video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return response.data.data.url;
};

/**
 * Create a new property listing.
 * Returns minimal data: { _id, vendorId, title, status, createdAt }
 */
export const createProperty = async (propertyData) => {
  const response = await API.post("/properties", propertyData);
  return response.data.data;
};

/**
 * Get all properties for the logged-in user.
 * Returns array of listing card data.
 */
export const getMyProperties = async () => {
  const response = await API.get("/properties/my");
  return response.data.data;
};

/**
 * Get full property details by ID (for editing).
 */
export const getPropertyById = async (id) => {
  const response = await API.get(`/properties/${id}`);
  return response.data.data;
};

/**
 * Update a property by ID.
 * Returns updated property data.
 */
export const updateProperty = async (id, propertyData) => {
  const response = await API.put(`/properties/${id}`, propertyData);
  return response.data.data;
};

/**
 * Delete a property by ID.
 */
export const deleteProperty = async (id) => {
  const response = await API.delete(`/properties/${id}`);
  return response.data.data;
};

/**
 * Toggle property status between active and paused.
 */
export const togglePropertyStatus = async (id, status) => {
  const response = await API.patch(`/properties/${id}/status`, { status });
  return response.data.data;
};
