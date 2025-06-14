// src/pages/OrderTrackingRestorans.jsx
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {getRestaurantOrders, updateOrderStatus as apiUpdateOrderStatus,} from "../api";
import "../styles/OrderTrackingRestorans.css";

const CountdownTimer = ({orderTime, prepTime, startTime}) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTimeLeft = () => {
            // Eğer startTime varsa ondan, yoksa orderTime'dan başla
            const base = startTime ? new Date(startTime).getTime() : new Date(orderTime).getTime();
            const target = base + prepTime * 60 * 1000;
            const now = Date.now();
            const diff = target - now;
            if (diff <= 0) return "Time is up!";
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            return `${m}m ${s}s left`;
        };

        setTimeLeft(calculateTimeLeft());
        const iv = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(iv);
    }, [orderTime, startTime, prepTime]);

    return <span className="countdown-timer">{timeLeft}</span>;
};

const OrderTrackingRestorans = ({addNotification}) => {
    const {restaurantId} = useParams();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const [modalOrderId, setModalOrderId] = useState(null);
    const [modalMinutes, setModalMinutes] = useState("");

    const formatOrderTime = (t) => new Date(t).toLocaleString("en-US", {
        dateStyle: "medium", timeStyle: "short",
    });

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const userEmail = localStorage.getItem("userEmail");
        const allowed = {
            "espressolab@espressolab.com": "espressolab", "nero@nero.com": "nero",
        };

        if (!token || !userEmail) {
            addNotification("Please log in with a restaurant account.", 5000);
            return navigate("/login");
        }
        if (allowed[userEmail] !== restaurantId) {
            addNotification("Unauthorized for this restaurant.", 5000);
            return navigate("/");
        }

        (async () => {
            try {
                const data = await getRestaurantOrders(restaurantId);
                setOrders(data.filter((o) => o.status !== "COMPLETED" && o.status !== "REJECTED"));
                setDeliveredOrders(data.filter((o) => o.status === "COMPLETED" || o.status === "REJECTED"));
            } catch {
                addNotification("Failed to fetch orders.", 5000);
            }
        })();
    }, [restaurantId, navigate, addNotification]);

    const handleUpdate = async (id, status, prep = null) => {
        try {
            const updated = await apiUpdateOrderStatus(id, status, prep);

            // "PREPARING" durumuna geçtiği anda prepStartTime ekleyelim
            if (updated.status === "PREPARING") {
                updated.prepStartTime = new Date().toISOString();
            }

            if (updated.status === "COMPLETED" || updated.status === "REJECTED") {
                setDeliveredOrders((d) => [...d, updated]);
                setOrders((o) => o.filter((x) => x.orderId !== id));
            } else {
                setOrders((o) => o.map((x) => (x.orderId === id ? updated : x)));
            }

            addNotification("Order status updated.", 5000);
            return updated;
        } catch {
            addNotification("Error updating status.", 5000);
        }
    };

    const openPrepModal = (id) => {
        setModalOrderId(id);
        setModalMinutes("");
    };
    const confirmPrep = async () => {
        const mins = parseInt(modalMinutes, 10);
        if (isNaN(mins) || mins < 0) {
            addNotification("Enter a valid minute.", 5000);
            return;
        }
        await handleUpdate(modalOrderId, "PREPARING", mins);
        setModalOrderId(null);
    };
    const cancelPrep = () => setModalOrderId(null);

    return (<div className="orders-table-container">
        <div className="table-content">
            <h1 className="restaurant-name">Restaurant {restaurantId}</h1>
            <button
                className="history-button"
                onClick={() => setShowHistory((h) => !h)}
            >
                {showHistory ? "Back to Orders" : "View Order History"}
            </button>

            {showHistory ? (<table>
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
                {deliveredOrders.map((o) => (<tr key={o.orderId}>
                    <td>{o.orderId}</td>
                    <td>{formatOrderTime(o.orderTime)}</td>
                    <td>
                        {o.items.map((i, idx) => (<div key={idx}>
                            {i.itemName} x {i.quantity}
                        </div>))}
                    </td>
                    <td>{o.customerUsername || "N/A"}</td>
                    <td>{o.totalAmount}₺</td>
                    <td>{o.status}</td>
                </tr>))}
                </tbody>
            </table>) : (<table>
                <thead>
                <tr>
                    <th>Order No</th>
                    <th>Content</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Order Time</th>
                    <th>Status</th>
                    <th>Estimated Prep Time</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {orders.map((o) => (<tr key={o.orderId}>
                    <td>{o.orderId}</td>
                    <td>
                        {o.items.map((i, idx) => (<div key={idx}>
                            {i.itemName} x {i.quantity}
                        </div>))}
                    </td>
                    <td>{o.customerUsername || "N/A"}</td>
                    <td>{o.totalAmount}₺</td>
                    <td>{formatOrderTime(o.orderTime)}</td>
                    <td>{o.status}</td>
                    <td>
                        {o.status === "PREPARING" && o.estimatedPreparationTime ? (<CountdownTimer
                            orderTime={o.orderTime}
                            startTime={o.prepStartTime}
                            prepTime={o.estimatedPreparationTime}
                        />) : o.estimatedPreparationTime ? (`${o.estimatedPreparationTime} minutes`) : ("N/A")}
                    </td>
                    <td>
                        <button
                            className="approve-button"
                            onClick={() => openPrepModal(o.orderId)}
                            disabled={o.status !== "PENDING"}
                        >
                            ✅ Approve
                        </button>
                        <button
                            className="reject-button"
                            onClick={() => handleUpdate(o.orderId, "REJECTED")}
                            disabled={o.status !== "PENDING"}
                        >
                            ❌ Reject
                        </button>
                        <button
                            className="close-button"
                            onClick={() => handleUpdate(o.orderId, "COMPLETED")}
                            disabled={o.status === "COMPLETED"}
                        >
                            🚚 Mark as Delivered
                        </button>
                    </td>
                </tr>))}
                </tbody>
            </table>)}

            <button
                className="back-button"
                onClick={() => navigate("/dashboard")}
            >
                ← Back to Dashboard
            </button>
        </div>

        {modalOrderId !== null && (<div className="custom-prompt-overlay">
            <div className="custom-prompt-modal">
                <h3>Estimated Prep Time</h3>
                <div className="form-group">
                    <label>Minutes:</label>
                    <input
                        type="number"
                        value={modalMinutes}
                        onChange={(e) => setModalMinutes(e.target.value)}
                        min="0"
                    />
                </div>
                <div className="modal-buttons">
                    <button className="btn-confirm" onClick={confirmPrep}>
                        Confirm
                    </button>
                    <button className="btn-cancel" onClick={cancelPrep}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>)}
    </div>);
};

export default OrderTrackingRestorans;
