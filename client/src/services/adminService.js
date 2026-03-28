import API from "./api";

/**
 * Get admin dashboard stats (totalUsers, totalListings, etc.).
 */
export const getAdminStats = async () => {
  const response = await API.get("/admin/stats");
  return response.data.data;
};

/**
 * Get paginated list of users with optional search.
 */
export const getUsers = async (params) => {
  const response = await API.get("/admin/users", { params });
  return response.data;
};

/**
 * Toggle block/unblock a user.
 */
export const blockUser = async (userId, isBlocked) => {
  const response = await API.patch(`/admin/users/${userId}/block`, { isBlocked });
  return response.data;
};

/**
 * Get paginated list of properties with optional status filter and search.
 */
export const getAdminProperties = async (params) => {
  const response = await API.get("/admin/properties", { params });
  return response.data;
};

/**
 * Update a property's status (active, paused, flagged, rejected).
 */
export const updatePropertyStatus = async (propertyId, status) => {
  const response = await API.patch(`/admin/properties/${propertyId}/status`, { status });
  return response.data;
};

/**
 * Hard delete a property.
 */
export const deleteAdminProperty = async (propertyId) => {
  const response = await API.delete(`/admin/properties/${propertyId}`);
  return response.data;
};

/**
 * Get paginated list of grievances with optional status filter.
 */
export const getGrievances = async (params) => {
  const response = await API.get("/admin/grievances", { params });
  return response.data;
};

/**
 * Update a grievance's status.
 */
export const updateGrievanceStatus = async (grievanceId, status) => {
  const response = await API.patch(`/admin/grievances/${grievanceId}/status`, { status });
  return response.data;
};

/**
 * Get paginated list of appointments with optional status filter.
 */
export const getAppointments = async (params) => {
  const response = await API.get("/admin/appointments", { params });
  return response.data;
};

/**
 * Update an appointment's status (approve/reject).
 */
export const updateAppointmentStatus = async (appointmentId, status, adminNotes) => {
  const response = await API.patch(`/admin/appointments/${appointmentId}/status`, { status, adminNotes });
  return response.data;
};
