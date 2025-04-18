// src/pages/ParkingStatusMap.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Parking.css";
import otoparkMap from "../styles/assets/otoparklar.png";
import { getParkingAreas } from "../api";

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

const ParkingStatusMap = () => {
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
        // Belirli aralıklarla polling: 15 saniyede bir güncelle
        const intervalId = setInterval(fetchData, 15000);

        // Temizlik
        return () => clearInterval(intervalId);
    }, []);

    const handleBackToDashboard = () => {
        navigate("/dashboard");
    };

    return (
        <div className="map-container">


            {/* Bilgi Metni */}
            <div className="map-info">
                Otoparklar vize/final haftaları ve özel günler hariç her gün 22:00’de otomatik olarak kapanır, 05:00’de tekrar açılır.
            </div>



            {/* Harita ve Durum Gösterimi */}
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
            {/* Renk Efsanesi */}
            <div className="legend">
                <h4>Renk Efsanesi</h4>
                <div className="legend-item">
                    <span className="legend-color available" /> Boş (AVAILABLE)
                </div>
                <div className="legend-item">
                    <span className="legend-color full" /> Dolu (FULL)
                </div>
                <div className="legend-item">
                    <span className="legend-color closed" /> Kapalı (CLOSED)
                </div>
            </div>
            {/* Back Button */}
            <button className="back-button" onClick={handleBackToDashboard}>
                Back to Dashboard
            </button>
        </div>
    );
};

export default ParkingStatusMap;
