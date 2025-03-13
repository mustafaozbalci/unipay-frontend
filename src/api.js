const API_BASE_URL = "http://localhost:8080/api";

// Ortak header bilgilerini oluşturur
const getAuthHeaders = (includeContentType = true) => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const headers = {};
    if (includeContentType) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (userId) headers["userId"] = userId; // Backend Long olarak alacak, fakat otomatik dönüşüm oluyor
    if (username) headers["Username"] = username;
    return headers;
};
// Temel fetch wrapper'ı, hata yönetimi dahil
const request = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return response.json();
};
// Kullanıcı girişi (Login)
export const login = async (credentials) => {
    return await request(`${API_BASE_URL}/auth/login`, {
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(credentials),
    });
};

// Kullanıcı kaydı (Register)
export const register = async (userData) => {
    return await request(`${API_BASE_URL}/auth/register`, {
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(userData),
    });
};

// Kullanıcı detaylarını alma
export const getUserDetails = async () => {
    return await request(`${API_BASE_URL}/auth/details`, {
        method: "POST", headers: getAuthHeaders(),
    });
};
//KULLANICI PAROLA GÜNCELLEME
export const updatePassword = async (data) => {
    return await request(`${API_BASE_URL}/auth/updatePassword`, {
        method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(data),
    });
};


// Ödeme (Bakiye yükleme) işlemi
export const depositPayment = async (requestBody) => {
    return await request(`${API_BASE_URL}/payment/deposit`, {
        method: "POST", headers: getAuthHeaders(), body: JSON.stringify(requestBody),
    });
};

// Sipariş verme
export const placeOrder = async (orderRequest) => {
    return await request(`${API_BASE_URL}/orders/place`, {
        method: "POST", headers: getAuthHeaders(), body: JSON.stringify(orderRequest),
    });
};

// Restorana ait siparişleri alma
export const getRestaurantOrders = async (restaurantId) => {
    return await request(`${API_BASE_URL}/orders/restaurant/orders`, {
        method: "POST", headers: getAuthHeaders(), body: JSON.stringify({restaurantId}),
    });
};

// Sipariş durumunu güncelleme
export const updateOrderStatus = async (orderId, status, estimatedPreparationTime = null) => {
    return await request(`${API_BASE_URL}/orders/update-status`, {
        method: "POST", headers: getAuthHeaders(), body: JSON.stringify({orderId, status, estimatedPreparationTime}),
    });
};


// Restoran listesini alma
export const getRestaurantsList = async () => {
    return await request(`${API_BASE_URL}/restaurants/list`, {
        method: "POST", headers: {"Content-Type": "application/json"},
    });
};
// Kullanıcının siparişlerini (userId üzerinden) alma
export const getUserOrdersById = async (userId) => {
    return await request(`${API_BASE_URL}/orders/user/orders`, {
        method: "POST", headers: getAuthHeaders(), body: JSON.stringify(userId),
    });
};

