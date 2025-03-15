import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();

    // Restoran hesaplarını kontrol etmek için:
    const isRestaurant =
        user && (user.email === "espressolab@espressolab.com" || user.email === "nero@nero.com");

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-logo">
                    <Link to={user ? "/dashboard" : "/"}>UniPay</Link>
                </div>
                <ul className="navbar-links">
                    {user ? (
                        <>
                            {isRestaurant ? (
                                <>
                                    <li>
                                        <Link to="/dashboard">Dashboard</Link>
                                    </li>
                                    <li>
                                        <Link to={`/order-tracking-restorans/${user.name.toLowerCase()}`}>
                                            Manage Orders
                                        </Link>
                                    </li>
                                    <li>
                                        <button className="logout-button" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link to="/dashboard">Dashboard</Link>
                                    </li>
                                    <li>
                                        <Link to="/orders">Orders</Link>
                                    </li>
                                    <li>
                                        <Link to="/add-balance">Add Balance</Link>
                                    </li>
                                    <li>
                                        <Link to="/order-tracking-users">Track Your Orders</Link>
                                    </li>
                                    <li>
                                        <button className="logout-button" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </li>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                            <li>
                                <Link to="/register">Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
