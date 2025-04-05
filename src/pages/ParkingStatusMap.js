// src/pages/ParkingStatusMap.jsx
import React, { useEffect, useState } from "react";
import "../styles/Parking.css";
import otoparkMap from "../styles/assets/otoparklar.png";
import { getParkingAreas } from "../api";

const getColor = (status) => {
    switch (status) {
        case "AVAILABLE": return "green";
        case "FULL": return "red";
        case "CLOSED": return "black";
        default: return "gray";
    }
};

const ParkingStatusMap = () => {
    const [parkingAreas, setParkingAreas] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getParkingAreas();
                console.log("Otopark verisi:", data); // log ile bak
                setParkingAreas(data);
            } catch (err) {
                console.error("Error fetching parking areas:", err);
            }
        };
        fetchData();
    }, []);


    return (
        <div className="map-wrapper">
            <img src={otoparkMap} alt="Otopark Haritası" className="map-image" />
            {parkingAreas.map((area) => (
                <div
                    key={area.id}
                    className="parking-button"
                    style={{
                        top: area.topPercent,
                        left: area.leftPercent,
                        backgroundColor: getColor(area.status),
                        cursor: "default",
                    }}
                    title={`${area.name}: ${area.status}`}
                >
                    {area.name}
                </div>
            ))}
        </div>
    );
};

export default ParkingStatusMap;
