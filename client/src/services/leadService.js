import API from "./api";

export const unlockContact = (propertyId) =>
  API.post(`/leads/unlock/${propertyId}`);

export const checkUnlockStatus = (propertyId) =>
  API.get(`/leads/check/${propertyId}`);

export const getVendorLeads = (params) =>
  API.get("/leads/vendor", { params });

export const getBuyerLeads = (params) =>
  API.get("/leads/buyer", { params });
