const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

async function request(path, {method = "GET", body, auth = true} = {}) {
    const headers = {};
    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    if (auth) {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");
        const username = localStorage.getItem("username");
        if (token) headers["Authorization"] = `Bearer ${token}`;
        if (userId) headers["userId"] = userId;
        if (username) headers["username"] = username;
    }
    const opts = {method, headers};
    if (body !== undefined) opts.body = JSON.stringify(body);

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
export const getUserDetails = () => request("/auth/details", {method: "POST"});
export const updatePassword = req => request("/auth/updatePassword", {method: "PUT", body: req});

// --- Payment ---
export const depositPayment = req => request("/payment/deposit", {method: "POST", body: req});

// --- Orders ---
export const placeOrder = req => request("/orders/place", {method: "POST", body: req});
export const getRestaurantOrders = name => request("/orders/restaurant/orders", {method: "POST", body: {name}});
export const updateOrderStatus = (orderId, status, prepTime = null) => request("/orders/update-status", {
    method: "POST", body: {orderId, status, estimatedPreparationTime: prepTime}
});
export const getUserOrdersById = userId => request("/orders/user/orders", {method: "GET"});              // <-- changed to GET, no body

// --- Restaurants ---
export const getRestaurantsList = () => request("/restaurants/list", {method: "POST", auth: false});
export const addRestaurant = name => request("/restaurants/add", {method: "POST", body: {name}});
export const updateRestaurant = (id, name) => request(`/restaurants/update/${id}`, {method: "POST", body: {name}});
export const deleteRestaurant = id => request(`/restaurants/delete/${id}`, {method: "POST"});

// --- Parking ---
export const getParkingAreas = () => request("/parking-areas", {method: "GET", auth: true});
export const updateParkingStatus = (id, status) => request(`/parking-areas/${id}`, {method: "PUT", body: {status}});
// --- Parking session (user) ---
export const enterParking = parkingAreaId => request(`/parking/enter?parkingAreaId=${parkingAreaId}`, {method: "POST"});

export const exitParking = sessionId => request(`/parking/exit?sessionId=${sessionId}`, {method: "POST"});

export const getParkingHistory = () => request("/parking/history", {method: "GET"});
