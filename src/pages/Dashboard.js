// src/pages/Dashboard.jsx
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getUserDetails, updatePassword, updatePlate} from "../api";
import "../styles/Dashboard.css";

const Dashboard = ({user, onBalanceUpdate, setUser, addNotification}) => {
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState("password");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [plateInput, setPlateInput] = useState("");

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
                    id: data.id,
                    name: data.username,
                    email: data.email,
                    balance: data.balance,
                    plate: data.plate || ""
                });
            } catch (err) {
                console.error("Error fetching user details:", err);
            }
        };
        fetchUserDetails();
    }, [navigate, setUser]);

    if (!user) {
        return (
            <div className="bg-container">
                <div className="dashboard-container">
                    <h2>Please log in first.</h2>
                    <button onClick={() => navigate("/login")}>Go to Login</button>
                </div>
            </div>
        );
    }

    const isRestaurant =
        user.email === "espressolab@espressolab.com" ||
        user.email === "nero@nero.com";
    const isOtopark = user.email === "otopark@otopark.com";
    const hasPlate = Boolean(user.plate && user.plate.trim());

    const handleSettingsToggle = () => {
        setShowSettings(prev => !prev);
        if (!showSettings) {
            setSettingsTab("password");
            setNewPassword("");
            setConfirmPassword("");
            setPlateInput(user.plate || "");
        }
    };

    const handleSettingsSubmit = async e => {
        e.preventDefault();
        try {
            if (settingsTab === "password") {
                if (newPassword !== confirmPassword) {
                    addNotification("Passwords do not match!", 5000);
                    return;
                }
                await updatePassword({newPassword});
                addNotification("Password updated successfully!", 5000);
            } else {
                await updatePlate({plate: plateInput});
                addNotification("Plate updated successfully!", 5000);
                setUser(u => ({...u, plate: plateInput}));
            }
            setShowSettings(false);
        } catch (error) {
            console.error("Update error:", error);
            addNotification("Failed to update: " + error.message, 5000);
        }
    };

    const handleOrders = () => {
        if (isRestaurant) {
            addNotification("Redirecting to order tracking...", 1500);
            navigate(`/order-tracking-restorans/${user.name.toLowerCase()}`);
        } else {
            addNotification("Redirecting to orders...", 1500);
            navigate("/orders");
        }
    };

    const handleParking = () => {
        if (hasPlate) {
            addNotification("Redirecting to parking entry/exit...", 1500);
            navigate("/parking");
        } else {
            addNotification("Lütfen önce plakanızı ekleyin!", 5000);
        }
    };

    const handleParkingMap = () => {
        if (hasPlate) {
            addNotification("Redirecting to parking status map...", 1500);
            navigate("/parking-status-map");
        } else {
            addNotification("Lütfen önce plakanızı ekleyin!", 5000);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="transparent-box">
                <button
                    className="settings-icon"
                    onClick={handleSettingsToggle}
                    title="Settings"
                >
                    ⚙️
                </button>

                {isRestaurant ? (
                    <div className="user-info">
                        <h2>Welcome, {user.name}</h2>
                        <div className="dashboard-buttons">
                            <button onClick={handleOrders} className="manage-orders-button">
                                Manage Orders
                            </button>
                        </div>
                    </div>
                ) : isOtopark ? (
                    <div className="user-info">
                        <h2>Welcome, {user.name}</h2>
                        <div className="dashboard-buttons">
                            <button
                                onClick={handleParking}
                                className="manage-orders-button"
                            >
                                Manage Parking Spaces
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="user-info">
                        <h2>Welcome, {user.name}</h2>
                        <p>
                            Balance: {user.balance.toFixed(2)}₺
                            <button
                                className="add-balance-icon"
                                onClick={() => navigate("/add-balance")}
                                title="Add Balance"
                            >
                                ➕
                            </button>
                        </p>

                        {hasPlate ? (
                            <p>Plate: {user.plate}</p>
                        ) : (
                            <button
                                className="add-plate-button"
                                onClick={() => {
                                    setShowSettings(true);
                                    setSettingsTab("plate");
                                }}
                            >
                                Plaka ekleyin
                            </button>
                        )}

                        <div className="dashboard-buttons">
                            <button onClick={handleOrders}>Orders</button>
                            <button onClick={handleParking}>Parking</button>
                            <button onClick={handleParkingMap}>Parking Status Map</button>
                        </div>
                    </div>
                )}
            </div>

            {showSettings && (
                <div className="settings-modal">
                    <div className="modal-content">
                        <button
                            className="close-modal"
                            onClick={handleSettingsToggle}
                            title="Close"
                        >
                            ❌
                        </button>

                        <div className="settings-tabs">
                            <button
                                className={settingsTab === "password" ? "active" : ""}
                                onClick={() => setSettingsTab("password")}
                            >
                                Update Password
                            </button>
                            <button
                                className={settingsTab === "plate" ? "active" : ""}
                                onClick={() => setSettingsTab("plate")}
                            >
                                Update Plate
                            </button>
                        </div>

                        <form onSubmit={handleSettingsSubmit}>
                            {settingsTab === "password" && (
                                <>
                                    <h3>Update Your Password</h3>
                                    <label htmlFor="new-password">New Password:</label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        minLength={6}
                                        required
                                    />
                                    <label htmlFor="confirm-password">
                                        Confirm Password:
                                    </label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        minLength={6}
                                        required
                                    />
                                </>
                            )}

                            {settingsTab === "plate" && (
                                <>
                                    <h3>Update Your Plate</h3>
                                    <label htmlFor="plate-input">Plate:</label>
                                    <input
                                        id="plate-input"
                                        type="text"
                                        value={plateInput}
                                        onChange={e => setPlateInput(e.target.value)}
                                        pattern="^[0-9]{2}[A-Za-z]{1,3}[0-9]{2,3}$"
                                        title="Format: 2 digits, 1–3 letters, 2–3 digits"
                                        required
                                    />
                                </>
                            )}

                            <button type="submit">
                                {settingsTab === "password"
                                    ? "Update Password"
                                    : "Update Plate"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
