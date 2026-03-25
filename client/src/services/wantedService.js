import API from "./api";

export const getWantedProperties = (params) =>
  API.get("/wanted", { params });

export const createWantedProperty = (data) =>
  API.post("/wanted", data);

export const getMyWantedProperties = () =>
  API.get("/wanted/mine");

export const updateWantedProperty = (id, data) =>
  API.put(`/wanted/${id}`, data);

export const deleteWantedProperty = (id) =>
  API.delete(`/wanted/${id}`);
