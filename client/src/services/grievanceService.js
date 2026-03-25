import API from "./api";

/**
 * Submit a new grievance.
 */
export const createGrievance = async ({ subject, message, category }) => {
  const response = await API.post("/grievances", { subject, message, category });
  return response.data;
};
