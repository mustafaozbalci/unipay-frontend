import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRestaurantOrders, updateOrderStatus as apiUpdateOrderStatus } from "../api";
import "../styles/OrderTrackingRestorans.css";

const OrderTrackingRestorans = ({ addNotification }) => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userEmail = localStorage.getItem("userEmail");

    // Mapping: her email için uygun restoran kimliğini belirliyoruz
    const allowedMapping = {
      "espressolab@espressolab.com": "espressolab",
      "nero@nero.com": "nero"
    };

    // Kullanıcı giriş yapmamışsa veya email bulunmuyorsa yönlendir
    if (!token || !userEmail) {
      addNotification("Please log in with a restaurant account.", 5000);
      navigate("/login");
      return;
    }

    // Giriş yapan kullanıcının email adresi, verilen restaurantId ile eşleşmiyorsa erişim engellensin
    if (!allowedMapping[userEmail] || allowedMapping[userEmail] !== restaurantId) {
      addNotification("You are not authorized to view orders for this restaurant.", 5000);
      navigate("/");
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await getRestaurantOrders(restaurantId);
        // Aktif siparişler: COMPLETED veya REJECTED olmayanlar
        const activeOrders = data.filter(
            (order) => order.status !== "COMPLETED" && order.status !== "REJECTED"
        );
        // Geçmiş siparişler: COMPLETED veya REJECTED durumundakiler
        const historyOrders = data.filter(
            (order) => order.status === "COMPLETED" || order.status === "REJECTED"
        );
        setOrders(activeOrders);
        setDeliveredOrders(historyOrders);
      } catch (err) {
        console.error("Fetch orders error:", err);
        addNotification("Failed to fetch orders.", 5000);
      }
    };

    fetchOrders();
  }, [restaurantId, navigate, addNotification]);

  // Countdown hesaplaması: order.orderTime'a girilen dakika eklenip kalan süre hesaplanıyor.
  const calculateCountdown = (orderTime, estimatedMinutes) => {
    if (!estimatedMinutes) return "N/A";
    const startTime = new Date(orderTime).getTime();
    const targetTime = startTime + estimatedMinutes * 60 * 1000;
    const now = Date.now();
    const diff = targetTime - now;
    if (diff <= 0) return "Time is up!";
    const minutes = Math.floor(diff / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    return `${minutes} minutes ${seconds} seconds left`;
  };

  // API çağrısını yapıp siparişin durumunu günceller; COMPLETED/REJECTED ise history'ye taşır.
  const handleUpdateOrderStatus = async (orderId, newStatus, estimatedPrepTime = null) => {
    try {
      const updatedOrder = await apiUpdateOrderStatus(orderId, newStatus, estimatedPrepTime);
      if (updatedOrder.status === "COMPLETED" || updatedOrder.status === "REJECTED") {
        setDeliveredOrders((prev) => [...prev, updatedOrder]);
        setOrders((prev) => prev.filter((order) => order.orderId !== updatedOrder.orderId));
      } else {
        setOrders((prev) =>
            prev.map((order) =>
                order.orderId === updatedOrder.orderId ? updatedOrder : order
            )
        );
      }
      addNotification("Order status updated successfully.", 5000);
      return updatedOrder;
    } catch (err) {
      console.error("Update order status error:", err);
      addNotification("An error occurred while updating order status.", 5000);
    }
  };

  // Approve: Girilen dakika değeri (ör. 25) alınır, sayısal değere çevrilir ve API'ye gönderilir.
  // Sipariş PENDING durumunda ise onaylama yapılabilir.
  const handleApprove = async (orderId) => {
    const input = prompt("Enter the estimated preparation time in minutes:");
    if (input && !isNaN(input)) {
      const minutes = parseInt(input, 10);
      await handleUpdateOrderStatus(orderId, "PREPARING", minutes);
    } else {
      addNotification("Invalid time input. Please enter a valid number.", 5000);
    }
  };

  const handleReject = async (orderId) => {
    await handleUpdateOrderStatus(orderId, "REJECTED");
    addNotification("Order rejected successfully.", 5000);
  };

  const handleOrderClose = async (orderId) => {
    const updated = await handleUpdateOrderStatus(orderId, "COMPLETED");
    if (updated) {
      addNotification("Order marked as delivered.", 5000);
    }
  };

  /* Dinamik arka plan resmi kodu kaldırıldı; tüm restoranlar varsayılan arka planı görecek */
  return (
      <div
          className="orders-table-container"
          style={{
            backgroundImage: "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
      >
        <div className="table-content">
          <h1 className="restaurant-name">Restaurant {restaurantId}</h1>
          <button className="history-button" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? "Back to Orders" : "View Order History"}
          </button>

          {showHistory ? (
              <div>
                <h2>Delivered / Rejected Orders</h2>
                <table>
                  <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Order Time</th>
                    <th>Content</th>
                    <th>Customer</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                  </thead>
                  <tbody>
                  {deliveredOrders.map((order) => (
                      <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{order.orderTime}</td>
                        <td>
                          {order.items?.map((item, i) => (
                              <div key={i}>
                                {item.itemName} x {item.quantity}
                              </div>
                          ))}
                        </td>
                        {/* Customer username OrderResponse'dan geliyor */}
                        <td>{order.customerUsername || "N/A"}</td>
                        <td>{order.totalAmount}₺</td>
                        <td>{order.status}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          ) : (
              <table>
                <thead>
                <tr>
                  <th>Order No</th>
                  <th>Content</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Delivery Time</th>
                  <th>Status</th>
                  <th>Estimated Prep Time</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {orders.map((order) => (
                    <tr key={order.orderId}>
                      <td>{order.orderId}</td>
                      <td>
                        {order.items?.map((item, i) => (
                            <div key={i}>
                              {item.itemName} x {item.quantity}
                            </div>
                        ))}
                      </td>
                      {/* Customer username OrderResponse'dan geliyor */}
                      <td>{order.customerUsername || "N/A"}</td>
                      <td>{order.totalAmount}₺</td>
                      <td>
                        {order.status === "PREPARING" && order.estimatedPreparationTime
                            ? calculateCountdown(order.orderTime, order.estimatedPreparationTime)
                            : order.orderTime}
                      </td>
                      <td>{order.status}</td>
                      <td>
                        {order.status === "PREPARING" && order.estimatedPreparationTime
                            ? calculateCountdown(order.orderTime, order.estimatedPreparationTime)
                            : (order.estimatedPreparationTime ? `${order.estimatedPreparationTime} minutes` : "N/A")}
                      </td>
                      <td>
                        <button
                            className="approve-button"
                            onClick={() => handleApprove(order.orderId)}
                            disabled={order.status !== "PENDING"}
                        >
                          <span role="img" aria-label="approve">✅</span> Approve
                        </button>
                        <button
                            className="reject-button"
                            onClick={() => handleReject(order.orderId)}
                            disabled={order.status !== "PENDING"}
                        >
                          <span role="img" aria-label="reject">❌</span> Reject
                        </button>
                        <button
                            className="close-button"
                            onClick={() => handleOrderClose(order.orderId)}
                            disabled={order.status === "COMPLETED"}
                        >
                          <span role="img" aria-label="delivered">🚚</span> Mark as Delivered
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
          )}
        </div>
      </div>
  );
};

export default OrderTrackingRestorans;
