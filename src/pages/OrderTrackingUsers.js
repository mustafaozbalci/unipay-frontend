// src/pages/OrderTrackingUsers.jsx
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getUserOrdersById} from "../api";
import "../styles/OrderTrackingUsers.css";

const CountdownTimer = ({orderTime, prepTime}) => {
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        const target = new Date(orderTime).getTime() + prepTime * 60_000;
        const iv = setInterval(() => {
            const diff = target - Date.now();
            if (diff <= 0) {
                setTimeLeft("Time is up!");
                clearInterval(iv);
            } else {
                const m = Math.floor(diff / 60000), s = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${m}m ${s}s`);
            }
        }, 1000);
        return () => clearInterval(iv);
    }, [orderTime, prepTime]);
    return <span>{timeLeft}</span>;
};

const OrderTrackingUsers = ({addNotification}) => {
    const navigate = useNavigate();
    const [activeOrders, setActiveOrders] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [error, setError] = useState("");
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            addNotification("Please log in to view your orders.", 5000);
            navigate("/login");
            return;
        }
        getUserOrdersById()
            .then(data => {
                const withDefaults = data.map(o => ({
                    ...o, items: o.items || [], totalAmount: o.totalAmount || 0,
                }));
                setActiveOrders(withDefaults.filter(o => !["COMPLETED", "REJECTED"].includes(o.status)));
                setHistoryOrders(withDefaults.filter(o => ["COMPLETED", "REJECTED"].includes(o.status)));
            })
            .catch(err => {
                console.error(err);
                setError("An error occurred while fetching orders.");
                addNotification("An error occurred while fetching orders.", 5000);
            });
    }, [navigate, addNotification]);

    return (<div className="orders-table-container">
        <div className="table-content">
            <h2 className="order-tracking-header">Your Orders</h2>
            {error && <p className="error-message">{error}</p>}
            <button className="history-toggle-button" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? "Back to Active Orders" : "View Order History"}
            </button>

            {showHistory ? (historyOrders.length > 0 ? (<table className="order-tracking-table">
                <thead>
                <tr>
                    <th>Restaurant</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Order Time</th>
                </tr>
                </thead>
                <tbody>
                {historyOrders.map(order => (<tr key={order.orderId}>
                    <td>{order.restaurantName}</td>
                    <td>{order.items.map((i, idx) => <div
                        key={idx}>{i.itemName} x {i.quantity}</div>)}</td>
                    <td>{order.totalAmount.toFixed(2)}₺</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.orderTime).toLocaleString()}</td>
                </tr>))}
                </tbody>
            </table>) : <p className="no-orders-text">No history orders found.</p>) : (activeOrders.length > 0 ? (
                <table className="order-tracking-table">
                    <thead>
                    <tr>
                        <th>Restaurant</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Prep Time</th>
                        <th>Order Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {activeOrders.map(order => (<tr key={order.orderId}>
                        <td>{order.restaurantName}</td>
                        <td>{order.items.map((i, idx) => <div
                            key={idx}>{i.itemName} x {i.quantity}</div>)}</td>
                        <td>{order.totalAmount.toFixed(2)}₺</td>
                        <td>{order.status}</td>
                        <td>
                            {order.estimatedPreparationTime != null ? <CountdownTimer orderTime={order.orderTime}
                                                                                      prepTime={order.estimatedPreparationTime}/> : "N/A"}
                        </td>
                        <td>{new Date(order.orderTime).toLocaleString()}</td>
                    </tr>))}
                    </tbody>
                </table>) : <p className="no-orders-text">No active orders found.</p>)}

            <button className="back-button" onClick={() => navigate("/orders")}>Back</button>
        </div>
    </div>);
};

export default OrderTrackingUsers;
