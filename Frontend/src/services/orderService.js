import api from "./api";

export const getOrders = () =>
  api.get("/orders");

export const createOrder = (data) =>
  api.post("/orders", data);

export const getOrderById = (id) =>
  api.get(`/orders/${id}`);

export const deleteOrder = (id) =>
  api.delete(`/orders/${id}`);