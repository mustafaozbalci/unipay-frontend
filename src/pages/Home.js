import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
      <div className="home-container">
        <div className="transparent-box">
          <h2 className="home-title">Welcome to Unipay</h2>
          <p className="home-description">
            UniPay is your one-stop solution for restaurant ordering and payments.
          </p>
          <ul className="features-list">
            <li>
              <span role="img" aria-label="pin">📌</span> Browse available restaurants
            </li>
            <li>
              <span role="img" aria-label="clipboard">📋</span> Explore restaurant menus
            </li>
            <li>
              <span role="img" aria-label="lightning">⚡</span> Place orders quickly
            </li>
            <li>
              <span role="img" aria-label="chart">📊</span> Track your order history
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
      </div>
  );
};

export default Home;
