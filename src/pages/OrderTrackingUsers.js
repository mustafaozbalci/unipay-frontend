import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserOrdersById } from "../api"; // getUserOrdersById fonksiyonunu import ettik
import "../styles/OrderTrackingUsers.css";

const OrderTrackingUsers = ({ addNotification }) => {
    const navigate = useNavigate();
    const [activeOrders, setActiveOrders] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [error, setError] = useState("");
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("authToken");

        if (!userId || !token) {
            addNotification("Please log in to view your orders.", 5000);
            navigate("/login");
            return;
        }

        getUserOrdersById(userId)
            .then((data) => {
                const ordersWithDefaults = data.map((order) => ({
                    ...order,
                    items: order.items || [],
                    totalAmount: order.totalAmount || 0,
                }));
                const active = ordersWithDefaults.filter(
                    (order) => order.status !== "COMPLETED" && order.status !== "REJECTED"
                );
                const history = ordersWithDefaults.filter(
                    (order) => order.status === "COMPLETED" || order.status === "REJECTED"
                );
                setActiveOrders(active);
                setHistoryOrders(history);
            })
            .catch((err) => {
                console.error(err);
                setError("An error occurred while fetching orders.");
                addNotification("An error occurred while fetching orders.", 5000);
            });
    }, [navigate, addNotification]);

    const handleBack = () => {
        navigate("/orders");
    };

    return (
        <div className="bg-container">
            <div className="transparent-box order-tracking-container compact-container">
                <h2 className="order-tracking-header">Your Orders</h2>
                {error && <p className="error-message">{error}</p>}
                <button
                    className="history-toggle-button"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    {showHistory ? "Back to Active Orders" : "View Order History"}
                </button>
                {showHistory ? (
                    historyOrders.length > 0 ? (
                        <table className="order-tracking-table">
                            <thead>
                            <tr>
                                <th>Restaurant</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {historyOrders.map((order) => (
                                <tr key={order.orderId}>
                                    <td>{order.restaurantName}</td>
                                    <td>
                                        {(order.items || []).map((item, index) => (
                                            <div key={index}>
                                                {item.itemName} x {item.quantity}
                                            </div>
                                        ))}
                                    </td>
                                    <td>{Number(order.totalAmount).toFixed(2)}₺</td>
                                    <td>{order.status}</td>
                                    <td>{order.orderTime}</td>

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No history orders found.</p>
                    )
                ) : (
                    activeOrders.length > 0 ? (
                        <table className="order-tracking-table">
                            <thead>
                            <tr>
                                <th>Restaurant</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Prep Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {activeOrders.map((order) => (
                                <tr key={order.orderId}>
                                    <td>{order.restaurantName}</td>
                                    <td>
                                        {(order.items || []).map((item, index) => (
                                            <div key={index}>
                                                {item.itemName} x {item.quantity}
                                            </div>
                                        ))}
                                    </td>
                                    <td>{Number(order.totalAmount).toFixed(2)}₺</td>
                                    <td>{order.status}</td>
                                    <td>
                                        {order.estimatedPreparationTime != null
                                            ? `${order.estimatedPreparationTime} min`
                                            : "N/A"}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No orders found.</p>
                    )
                )}
                <button className="back-button" onClick={handleBack}>
                    Back
                </button>
            </div>
        </div>
    );
};

export default OrderTrackingUsers;
