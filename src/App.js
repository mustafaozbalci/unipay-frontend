// src/App.jsx
import React, {useEffect, useState} from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import AddBalance from "./pages/AddBalance";
import Restaurants from "./pages/Restaurants";
import OrderTrackingUsers from "./pages/OrderTrackingUsers";
import NeroMenu from "./pages/NeroMenu";
import EspressolabMenu from "./pages/EspressolabMenu";
import OrderTrackingRestorans from "./pages/OrderTrackingRestorans";
import ParkingSpaceManagers from "./pages/ParkingSpaceManagers";
import ParkingStatusMap from "./pages/ParkingStatusMap";
import ParkingUsers from "./pages/ParkingUsers";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Notification from "./components/Notification";
import "./App.css";

function App() {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (user) localStorage.setItem("user", JSON.stringify(user)); else localStorage.removeItem("user");
    }, [user]);

    const handleOrderPlaced = total => {
        if (!user) return;
        setUser(u => ({...u, balance: u.balance - total}));
    };

    const handleBalanceUpdate = newBalance => {
        if (!user) return;
        setUser(u => ({...u, balance: newBalance}));
    };

    const [notifications, setNotifications] = useState([]);
    const addNotification = (msg, duration = 5000) => {
        const id = Date.now() + Math.random();
        setNotifications(n => [...n, {id, message: msg, duration}]);
    };
    const removeNotification = id => {
        setNotifications(n => n.filter(x => x.id !== id));
    };

    return (<Router>
        <div className="app-container">
            <Navbar user={user} setUser={setUser}/>
            <div className="notification-wrapper">
                {notifications.map(n => (<Notification
                    key={n.id}
                    message={n.message}
                    duration={n.duration}
                    onClose={() => removeNotification(n.id)}
                />))}
            </div>
            <div className="content">
                <Routes>
                    <Route path="/" element={<Home addNotification={addNotification}/>}/>
                    <Route path="/login" element={<Login setUser={setUser} addNotification={addNotification}/>}/>
                    <Route path="/register" element={<Register addNotification={addNotification}/>}/>
                    <Route path="/dashboard" element={<Dashboard
                        user={user}
                        onBalanceUpdate={handleBalanceUpdate}
                        setUser={setUser}
                        addNotification={addNotification}
                    />}/>
                    <Route path="/add-balance" element={<AddBalance
                        user={user}
                        onBalanceUpdate={handleBalanceUpdate}
                        addNotification={addNotification}
                    />}/>
                    <Route path="/orders" element={<Orders addNotification={addNotification}/>}/>
                    <Route path="/restaurants" element={<Restaurants addNotification={addNotification}/>}/>
                    <Route path="/order-tracking-users"
                           element={<OrderTrackingUsers addNotification={addNotification}/>}/>
                    <Route path="/nero-menu" element={<NeroMenu onOrderPlaced={handleOrderPlaced}
                                                                addNotification={addNotification}/>}/>
                    <Route path="/espressolab-menu" element={<EspressolabMenu onOrderPlaced={handleOrderPlaced}
                                                                              addNotification={addNotification}/>}/>
                    <Route path="/order-tracking-restorans/:restaurantId"
                           element={<OrderTrackingRestorans addNotification={addNotification}/>}/>
                    <Route path="/parking-space-manager" element={<ParkingSpaceManagers/>}/>
                    <Route path="/parking-status" element={<ParkingStatusMap/>}/>
                    <Route path="/parking-status-map" element={<ParkingStatusMap/>}/>
                    <Route path="/parking" element={<ParkingUsers
                        addNotification={addNotification}
                        user={user}
                        onBalanceUpdate={handleBalanceUpdate}
                    />}/>
                    <Route path="*" element={<h2>404 - Page Not Found</h2>}/>
                </Routes>
            </div>
            <Footer/>
        </div>
    </Router>);
}

export default App;
