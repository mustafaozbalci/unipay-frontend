// src/pages/ParkingSpaceManagers.jsx
import React, {useEffect, useState} from "react";
import "../styles/Parking.css";
import otoparkMap from "../styles/assets/otoparklar.png";
import {exitParking, getAdminHistory, getParkingAreas, updateParkingStatus} from "../api";
import {useNavigate} from "react-router-dom";

export default function ParkingSpaceManagers() {
    const [areas, setAreas] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const a = await getParkingAreas();
                setAreas(a);
                const s = await getAdminHistory();
                setSessions(s);
            } catch (err) {
                console.error("Load history:", err);
            }
        })();
    }, []);

    const getColor = status => {
        if (status === "AVAILABLE") return "green";
        if (status === "FULL") return "red";
        if (status === "CLOSED") return "black";
        return "gray";
    };

    const cycle = status =>
        status === "AVAILABLE" ? "FULL" : status === "FULL" ? "CLOSED" : "AVAILABLE";

    const handleStatusChange = async area => {
        const newStatus = cycle(area.status);
        await updateParkingStatus(area.id, newStatus);
        setAreas(prev =>
            prev.map(a => (a.id === area.id ? {...a, status: newStatus} : a))
        );
    };

    const handleExit = async id => {
        await exitParking(id);
        setSessions(await getAdminHistory());
    };

    // filter active sessions
    const activeSessions = sessions.filter(s => !s.exitTime);
    const pastSessions = sessions.filter(s => s.exitTime);

    return (
        <div className="map-container">
            <div className="transparent-box">
                <h2>Otopark Personel Paneli</h2>
                {/* Map and status buttons */}
                <div className="map-wrapper" style={{position: "relative"}}>
                    <img src={otoparkMap} alt="Otopark Haritası" className="map-image"/>
                    {areas.map(area => (
                        <button
                            key={area.id}
                            className="parking-button"
                            style={{
                                position: "absolute",
                                top: area.topPercent,
                                left: area.leftPercent,
                                width: "100px",
                                height: "100px",
                                backgroundColor: getColor(area.status),
                                color: "black",
                                border: "1px solid #333",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                            onClick={() => handleStatusChange(area)}
                        >
                            {area.name}
                        </button>
                    ))}
                </div>
                <section className="sessions-list">
                    <h3>Aktif Oturumlar</h3>
                    <div className="sessions-wrapper">
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Otopark Kodu</th>
                                <th>Plaka</th>
                                <th>Giriş</th>
                                <th>İşlem</th>
                            </tr>
                            </thead>
                            <tbody>
                            {activeSessions.map(s => (
                                <tr key={s.id} className="active-session">
                                    <td>{s.id}</td>
                                    <td>{s.parkingAreaId}</td>
                                    <td>{s.plate}</td>
                                    <td>{new Date(s.enterTime).toLocaleString()}</td>
                                    <td>
                                        <button onClick={() => handleExit(s.id)}>Çıkış</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Show/hide past history */}
                <button
                    className="toggle-button"
                    onClick={() => setShowHistory(h => !h)}
                >
                    {showHistory ? "Geçmişi Gizle" : "Geçmişi Göster"}
                </button>

                {showHistory && (
                    <section className="sessions-list">
                        <h3>Geçmiş Oturumlar</h3>
                        <div className="sessions-wrapper">
                            <table>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Otopark Kodu</th>
                                    <th>Plaka</th>
                                    <th>Giriş</th>
                                    <th>Çıkış</th>
                                    <th>Ücret</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pastSessions.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td>{s.parkingAreaId}</td>
                                        <td>{s.plate}</td>
                                        <td>{new Date(s.enterTime).toLocaleString()}</td>
                                        <td>{new Date(s.exitTime).toLocaleString()}</td>
                                        <td>{s.fee}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
                <div>
                    <button className="back-button" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
                </div>
            </div>
        </div>

    );
}