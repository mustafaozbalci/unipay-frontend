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
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Notification from "./components/Notification";
import "./App.css";

function App() {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);
    //SİPARİŞ GİRİLDİĞİNDE BAKİYE DÜŞÜREN FONKS.
    const handleOrderPlaced = (orderTotal) => {
        if (!user) return;
        setUser((prevUser) => ({
            ...prevUser, balance: prevUser.balance - orderTotal,
        }));
    };
    //BAKİYE  SİPARİŞİ GÜNCELLEYEN FONKS.
    const handleBalanceUpdate = (newBalance) => {
        if (!user) return;
        setUser((prevUser) => ({
            ...prevUser, balance: newBalance,
        }));
    };

    // Global bildirim state’i
    const [notifications, setNotifications] = useState([]);

    // Bildirim ekleme fonksiyonu
    const addNotification = (message, duration = 5000) => {
        const id = Date.now();
        const newNotification = {id, message, duration};
        setNotifications((prev) => [...prev, newNotification]);
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (<Router>
        <div className="app-container">
            <Navbar user={user} setUser={setUser}/>

            {/* Bildirimlerin görüntüleneceği container */}
            <div className="notification-wrapper">
                {notifications.map((notification) => (<Notification
                    key={notification.id}
                    message={notification.message}
                    duration={notification.duration}
                    onClose={() => removeNotification(notification.id)}
                />))}
            </div>

            <div className="content">
                <Routes>
                    <Route path="/" element={<Home addNotification={addNotification}/>}/>
                    <Route path="/login" element={<Login setUser={setUser} addNotification={addNotification}/>}/>
                    <Route path="/register" element={<Register addNotification={addNotification}/>}/>
                    <Route
                        path="/dashboard"
                        element={<Dashboard
                            user={user}
                            onBalanceUpdate={handleBalanceUpdate}
                            setUser={setUser}
                            addNotification={addNotification}
                        />}
                    />
                    <Route
                        path="/add-balance"
                        element={<AddBalance user={user} onBalanceUpdate={handleBalanceUpdate}
                                             addNotification={addNotification}/>}
                    />
                    <Route path="/orders" element={<Orders addNotification={addNotification}/>}/>
                    <Route path="/restaurants" element={<Restaurants addNotification={addNotification}/>}/>
                    <Route path="/order-tracking-users"
                           element={<OrderTrackingUsers addNotification={addNotification}/>}/>
                    <Route path="/nero-menu" element={<NeroMenu onOrderPlaced={handleOrderPlaced}
                                                                addNotification={addNotification}/>}/>
                    <Route
                        path="/espressolab-menu"
                        element={<EspressolabMenu onOrderPlaced={handleOrderPlaced}
                                                  addNotification={addNotification}/>}
                    />
                    <Route
                        path="/order-tracking-restorans/:restaurantId"
                        element={<OrderTrackingRestorans addNotification={addNotification}/>}
                    />
                    <Route path="*" element={<h2>404 - Page Not Found</h2>}/>
                </Routes>
            </div>
            <Footer/>
        </div>
    </Router>);
}

export default App;
