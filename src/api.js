// src/api.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

async function request(path, {method = "GET", body, auth = true} = {}) {
    const headers = {};
    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    if (auth) {
        const token = localStorage.getItem("authToken");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const opts = {method, headers};
    if (body !== undefined) {
        opts.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE_URL}${path}`, opts);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
    }
    return res.status === 204 ? null : res.json();
}

// --- Auth ---
export const login = creds => request("/auth/login", {method: "POST", body: creds, auth: false});
export const register = data => request("/auth/register", {method: "POST", body: data, auth: false});
export const getUserDetails = () => request("/auth/details", {method: "GET"});
export const updatePassword = req => request("/auth/updatePassword", {method: "PUT", body: req});
export const updatePlate = req => request("/auth/updatePlate", {method: "PUT", body: req});
// --- Payment ---
export const depositPayment = req => request("/payment/deposit", {method: "POST", body: req});

// --- Orders ---
export const placeOrder = req => request("/orders/place", {method: "POST", body: req});
export const getRestaurantOrders = name => request("/orders/restaurant/orders", {method: "POST", body: {name}});
export const updateOrderStatus = (orderId, status, prepTime = null) => request("/orders/update-status", {
    method: "POST", body: {orderId, status, estimatedPreparationTime: prepTime}
});
export const getUserOrdersById = () => request("/orders/user/orders", {method: "GET"});

// --- Restaurants ---
export const getRestaurantsList = () => request("/restaurants/list", {method: "POST", auth: false});
export const addRestaurant = name => request("/restaurants/add", {method: "POST", body: {name}});
export const updateRestaurant = (id, name) => request(`/restaurants/update/${id}`, {method: "POST", body: {name}});
export const deleteRestaurant = id => request(`/restaurants/delete/${id}`, {method: "POST"});

// --- Parking Areas & Sessions (admin) ---
export const getParkingAreas = () => request("/parking-areas", {method: "GET"});
// Send the status as raw string so backend’s `@RequestBody String newStatus` maps correctly to the enum
export const updateParkingStatus = (id, status) => request(`/parking-areas/${id}`, {method: "PUT", body: status});
export const getAdminHistory = () => request("/parking/admin/history", {method: "GET"});

// --- Parking Sessions (user) ---
export const enterParking = areaId => request(`/parking/enter?parkingAreaId=${areaId}`, {method: "POST"});
export const exitParking = sessionId => request(`/parking/exit?sessionId=${sessionId}`, {method: "POST"});
export const getCurrentFee = sessionId => request(`/parking/current-fee?sessionId=${sessionId}`, {method: "GET"});
export const getParkingHistory = () => request("/parking/history", {method: "GET"});
