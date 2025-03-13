// src/pages/Restaurants.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRestaurantsList } from "../api";
import "../styles/Restaurants.css";

import neroIcon from "../styles/assets/nero.png";
import espressolabIcon from "../styles/assets/espressolab.jpg";

const iconMap = {
    "Nero": neroIcon,
    "Espressolab": espressolabIcon,
    // Diğer restoranlar...
};

const Restaurants = ({ addNotification }) => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [error, setError] = useState("");

    const routeMap = {
        "Nero": "/nero-menu",
        "Espressolab": "/espressolab-menu",
        // Diğer restoranlar...
    };

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await getRestaurantsList();
                setRestaurants(data);
            } catch (err) {
                console.error(err);
                const errorMessage = "An error occurred while fetching restaurant list.";
                setError(errorMessage);
                addNotification(errorMessage, 5000);
            }
        };

        fetchRestaurants();
    }, [addNotification]);

    const handleRestaurantClick = (restaurantName) => {
        if (routeMap[restaurantName]) {
            addNotification(`Navigating to ${restaurantName} menu...`, 1500);
            navigate(routeMap[restaurantName]);
        } else {
            addNotification(`No specific menu found for "${restaurantName}".`, 5000);
        }
    };

    const handleBackToOrders = () => {
        addNotification("Redirecting to orders...", 1500);
        navigate("/orders");
    };

    return (
        <div className="restaurants-list">
            <div className="transparent-box">
                <h2>Available Restaurants</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}

                {/* UL yerine div-based grid/flex de kullanabilirsiniz, ama UL/Li de sorun yok. */}
                <ul className="restaurant-list">
                    {restaurants.map((restaurantName, index) => {
                        const iconSrc = iconMap[restaurantName];
                        return (
                            <li key={index} className="restaurant-item">
                                <button onClick={() => handleRestaurantClick(restaurantName)}>
                                    {/* İkon + Metin Wrapper */}
                                    <div className="restaurant-icon-wrapper">
                                        {/* Eğer iconSrc tanımlıysa göster, yoksa placeholder bir ikon */}
                                        {iconSrc && (
                                            <img
                                                src={iconSrc}
                                                alt={restaurantName}
                                                className="restaurant-icon"
                                            />
                                        )}
                                        <span>{restaurantName}</span>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>

                <button className="back-button" onClick={handleBackToOrders}>
                    Back to Orders
                </button>
            </div>
        </div>
    );
};

export default Restaurants;
