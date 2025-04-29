import React from "react";
import {useNavigate} from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
    const navigate = useNavigate();

    return (<div className="home-container">
        <div className="transparent-box">
            <h2 className="home-title">Welcome to UniPay</h2>
            <p className="home-description">
                UniPay is your campus portal for loading prepaid balance, ordering from restaurants in real time,
                and checking parking availability.
            </p>
            <ul className="features-list">
                <li>
                    <span role="img" aria-label="wallet">💳</span> Load and check your balance
                </li>
                <li>
                    <span role="img" aria-label="restaurant">🍽️</span> Browse campus restaurants and cafes
                </li>
                <li>
                    <span role="img" aria-label="tracking">🚚</span> Real-time order tracking
                </li>
                <li>
                    <span role="img" aria-label="parking">🅿️</span> View parking availability
                </li>
                <li>
                    <span role="img" aria-label="history">📊</span> View transaction and order history
                </li>
            </ul>
            <div className="auth-buttons">
                <button className="home-button" onClick={() => navigate("/login")}>
                    Login
                </button>
                <button className="home-button" onClick={() => navigate("/register")}>
                    Register
                </button>
            </div>
        </div>
    </div>);
};

export default Home;
