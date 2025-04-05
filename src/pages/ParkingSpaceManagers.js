// src/pages/ParkingSpaceManagers.jsx
import React, { useEffect, useState } from "react";
import "../styles/Parking.css";
import otoparkMap from "../styles/assets/otoparklar.png";
import { getParkingAreas, updateParkingStatus } from "../api";

const getColor = (status) => {
    switch (status) {
        case "AVAILABLE": return "green";
        case "FULL": return "red";
        case "CLOSED": return "black";
        default: return "gray";
    }
};

const ParkingSpaceManagers = () => {
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


    const cycleStatus = (current) => {
        if (current === "AVAILABLE") return "FULL";
        if (current === "FULL") return "CLOSED";
        return "AVAILABLE";
    };

    const handleStatusChange = async (area) => {
        const newStatus = cycleStatus(area.status);
        try {
            await updateParkingStatus(area.id, newStatus);
            setParkingAreas((prev) =>
                prev.map((a) =>
                    a.id === area.id ? { ...a, status: newStatus } : a
                )
            );
        } catch (err) {
            console.error("Failed to update parking status", err);
        }
    };

    return (
        <div className="map-wrapper">
            <img src={otoparkMap} alt="Otopark Haritası" className="map-image" />
            {parkingAreas.map((area) => (
                <button
                    key={area.id}
                    className="parking-button"
                    style={{
                        top: area.topPercent,
                        left: area.leftPercent,
                        backgroundColor: getColor(area.status),
                    }}
                    onClick={() => handleStatusChange(area)}
                    title={`${area.name}: ${area.status}`}
                >
                    {area.name}
                </button>
            ))}
        </div>
    );
};

export default ParkingSpaceManagers;
