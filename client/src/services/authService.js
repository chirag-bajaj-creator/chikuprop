import API from "./api";

export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data.data;
};

export const registerUser = async ({ name, email, password, phone }) => {
  const response = await API.post("/auth/signup", {
    name,
    email,
    password,
    phone,
  });
  return response.data.data;
};

export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  return response.data.data;
};

export const adminSignup = async ({ name, email, password, phone, secretKey }) => {
  const response = await API.post("/auth/admin-signup", {
    name,
    email,
    password,
    phone,
    secretKey,
  });
  return response.data.data;
};

