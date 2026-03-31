import API from "./api";

export const updateProfile = async (data) => {
  const response = await API.put("/profile", data);
  return response.data.data;
};

export const changePassword = async (data) => {
  const response = await API.put("/profile/password", data);
  return response.data.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await API.put("/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};
