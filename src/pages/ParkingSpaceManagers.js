import React, {useEffect, useState} from "react";
import "../styles/Parking.css";
import otoparkMap from "../styles/assets/otoparklar.png";
import {getParkingAreas, updateParkingStatus} from "../api";
import {useNavigate} from "react-router-dom";

const getColor = (status) => {
    switch (status) {
        case "AVAILABLE":
            return "green";
        case "FULL":
            return "red";
        case "CLOSED":
            return "black";
        default:
            return "gray";
    }
};

const ParkingSpaceManagers = () => {
    const [parkingAreas, setParkingAreas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getParkingAreas();
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
            setParkingAreas((prev) => prev.map((a) => a.id === area.id ? {...a, status: newStatus} : a));
        } catch (err) {
            console.error("Failed to update parking status", err);
        }
    };

    return (<div className="map-container">
        <div className="map-info">
            Otoparklar vize/final haftaları ve özel günler hariç her gün 22:00’de otomatik olarak kapanır, 05:00’de
            tekrar açılır.
        </div>
        <div className="map-wrapper">
            <img src={otoparkMap} alt="Otopark Haritası" className="map-image"/>
            {parkingAreas.map((area) => (<button
                key={area.id}
                className="parking-button"
                style={{
                    top: area.topPercent, left: area.leftPercent, backgroundColor: getColor(area.status),
                }}
                onClick={() => handleStatusChange(area)}
                title={`${area.name}: ${area.status}`}
            >
                {area.name}
            </button>))}
        </div>
        <div className="legend">
            <h4>Renk Efsanesi</h4>
            <div className="legend-item">
                <span className="legend-color available"/> Boş (AVAILABLE)
            </div>
            <div className="legend-item">
                <span className="legend-color full"/> Dolu (FULL)
            </div>
            <div className="legend-item">
                <span className="legend-color closed"/> Kapalı (CLOSED)
            </div>
        </div>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
        </button>
    </div>);
};

export default ParkingSpaceManagers;
