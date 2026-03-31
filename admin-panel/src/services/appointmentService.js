import API from "./api";

export const createAppointment = async ({ description, appointmentType }) => {
  const response = await API.post("/appointments", { description, appointmentType });
  return response.data;
};

export const getMyAppointments = async () => {
  const response = await API.get("/appointments/my");
  return response.data;
};
