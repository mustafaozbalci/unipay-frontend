// src/pages/Dashboard.jsx
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getUserDetails, updatePassword} from "../api";
import "../styles/Dashboard.css";

const Dashboard = ({user, onBalanceUpdate, setUser, addNotification}) => {
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const userId = localStorage.getItem("userId");

                if (!token || !userId) {
                    navigate("/login");
                    return;
                }

                const data = await getUserDetails();
                setUser({
                    id: data.id, name: data.username, email: data.email, balance: data.balance,
                });
            } catch (err) {
                console.error("Error fetching user details:", err);
            }
        };

        fetchUserDetails();
    }, [navigate, setUser]);

    if (!user) {
        return (<div className="bg-container">
            <div className="dashboard-container">
                <h2>Please log in first.</h2>
                <button onClick={() => navigate("/login")}>Go to Login</button>
            </div>
        </div>);
    }

    const isRestaurant = user.email === "espressolab@espressolab.com" || user.email === "nero@nero.com";

    const isOtopark = user.email === "otopark@otopark.com";

    const handleSettingsToggle = () => {
        setShowSettings((prev) => !prev);
        if (!showSettings) {
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            addNotification("Passwords do not match!", 5000);
            return;
        }
        try {
            const token = localStorage.getItem("authToken");
            const userId = localStorage.getItem("userId");
            if (!token || !userId) {
                addNotification("Please log in again.", 5000);
                navigate("/login");
                return;
            }
            const updatedUser = await updatePassword({newPassword});
            addNotification("Password updated successfully!", 5000);
            setUser({
                id: updatedUser.id, name: updatedUser.username, email: updatedUser.email, balance: updatedUser.balance,
            });
            setShowSettings(false);
        } catch (error) {
            console.error("Update password error:", error);
            addNotification("Failed to update password: " + error.message, 5000);
        }
    };

    const handleOrders = () => {
        if (isRestaurant) {
            const restaurantName = user.name.toLowerCase();
            addNotification("Redirecting to order tracking...", 1500);
            navigate(`/order-tracking-restorans/${restaurantName}`);
        } else {
            addNotification("Redirecting to orders...", 1500);
            navigate("/orders");
        }
    };

    const handleParkingManage = () => {
        addNotification("Redirecting to parking space manager...", 1500);
        navigate("/parking-space-manager");
    };

    const handleParkingMap = () => {
        addNotification("Redirecting to parking status map...", 1500);
        navigate("/parking-status-map");
    };

    const handleParkingUsers = () => {
        addNotification("Redirecting to parking entry/exit...", 1500);
        navigate("/parking");
    };

    return (<div className="dashboard-container">
        <div className="transparent-box">
            <button
                className="settings-icon"
                onClick={handleSettingsToggle}
                title="Settings"
            >
          <span role="img" aria-label="settings">
            ⚙️
          </span>
            </button>

            {isRestaurant ? (<div className="user-info">
                <h2>Welcome, {user.name || "No Name"}</h2>
                <div className="dashboard-buttons">
                    <button
                        onClick={handleOrders}
                        className="manage-orders-button"
                    >
                        Manage Orders
                    </button>
                </div>
            </div>) : isOtopark ? (<div className="user-info">
                <h2>Welcome, {user.name || "No Name"}</h2>
                <div className="dashboard-buttons">
                    <button
                        onClick={handleParkingManage}
                        className="manage-orders-button"
                    >
                        Manage Parking Spaces
                    </button>
                </div>
            </div>) : (<div className="user-info">
                <h2>Welcome, {user.name || "No Name"}</h2>
                <p>
                    Balance: {Number(user.balance).toFixed(2)}₺
                    <button
                        className="add-balance-icon"
                        onClick={() => navigate("/add-balance")}
                        title="Add Balance"
                    >
                <span role="img" aria-label="add-balance">
                  ➕
                </span>
                    </button>
                </p>
                <div className="dashboard-buttons">
                    <button onClick={handleOrders}>Orders</button>
                    <button onClick={handleParkingUsers}>Parking</button>
                    <button onClick={handleParkingMap}>Parking Status Map</button>
                </div>
            </div>)}
        </div>

        {showSettings && (<div className="settings-modal">
            <div className="modal-content">
                <button
                    className="close-modal"
                    onClick={handleSettingsToggle}
                    title="Close"
                >
              <span role="img" aria-label="close">
                ❌
              </span>
                </button>
                <h3>Update Your Password</h3>
                <form onSubmit={handleSettingsSubmit}>
                    <label htmlFor="new-password">New Password:</label>
                    <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={6}
                        required
                    />

                    <label htmlFor="confirm-password">Confirm Password:</label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={6}
                        required
                    />

                    <button type="submit">Update</button>
                </form>
            </div>
        </div>)}
    </div>);
};

export default Dashboard;
