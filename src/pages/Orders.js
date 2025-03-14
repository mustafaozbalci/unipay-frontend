import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Orders.css";

const Orders = ({ addNotification }) => {
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    addNotification("Redirecting to restaurant list...", 1500);
    navigate("/restaurants");
  };

  const handleTrackOrders = () => {
    addNotification("Redirecting to order tracking...", 1500);
    navigate("/order-tracking-users");
  };

  const handleBackToDashboard = () => {
    addNotification("Redirecting to dashboard...", 1500);
    navigate("/dashboard");
  };

  return (
      <div className="orders-container">
        <div className="transparent-box">
          <h2>Orders</h2>
          <div className="order-buttons">
            <button onClick={handlePlaceOrder}>Place Order</button>
            <button onClick={handleTrackOrders}>Track Your Orders</button>
          </div>
          <button className="back-button" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
  );
};

export default Orders;
