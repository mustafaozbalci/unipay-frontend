import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserOrdersById } from "../api"; // getUserOrdersById fonksiyonunu import ettik
import "../styles/OrderTrackingUsers.css";

// CountdownTimer bileşeni: orderTime ve prepTime (dakika) alır
const CountdownTimer = ({ orderTime, prepTime }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const targetTime = new Date(orderTime).getTime() + prepTime * 60 * 1000;
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = targetTime - now;
            if (diff <= 0) {
                setTimeLeft("Time is up!");
                clearInterval(interval);
            } else {
                const minutes = Math.floor(diff / (60 * 1000));
                const seconds = Math.floor((diff % (60 * 1000)) / 1000);
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [orderTime, prepTime]);

    return <span>{timeLeft}</span>;
};

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
        <div className="orders-table-container">
            <div className="table-content">
                <h2 className="order-tracking-header">Your Orders</h2>
                {error && <p className="error-message">{error}</p>}
                <button
                    className="history-toggle-button"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    {showHistory ? "Back to Active Orders" : "View Order History"}
                </button>

                <div className="order-table">
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
                                        <td>{new Date(order.orderTime).toLocaleString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-orders-text">No history orders found.</p>
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
                                            {order.estimatedPreparationTime != null ? (
                                                <CountdownTimer
                                                    orderTime={order.orderTime}
                                                    prepTime={order.estimatedPreparationTime}
                                                />
                                            ) : (
                                                "N/A"
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-orders-text">No active orders found.</p>
                        )
                    )}
                </div>

                <button className="back-button" onClick={handleBack}>
                    Back
                </button>
            </div>
        </div>
    );

};

export default OrderTrackingUsers;
