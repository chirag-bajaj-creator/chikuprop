import API from "./api";

export const getNotifications = (params) =>
  API.get("/notifications", { params });

export const getUnreadCount = async () => {
  const response = await API.get("/notifications/unread-count");
  return response.data.data.count;
};

export const markAsRead = (id) =>
  API.put(`/notifications/${id}/read`);

export const markAllRead = () =>
  API.put("/notifications/read-all");
