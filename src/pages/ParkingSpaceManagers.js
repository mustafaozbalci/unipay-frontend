// src/pages/ParkingSpaceManagers.jsx
import React, {useEffect, useState} from "react";
import "../styles/Parking.css";
import otoparkMap from "../styles/assets/otoparklar.png";
import {exitParking, getAdminHistory, getCurrentFee, getParkingAreas, updateParkingStatus,} from "../api";
import {useNavigate} from "react-router-dom";

export default function ParkingSpaceManagers() {
    const [areas, setAreas] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [sortKey, setSortKey] = useState("exitTime");
    const navigate = useNavigate();

    const refreshData = async () => {
        try {
            const [areasData, rawSessions] = await Promise.all([getParkingAreas(), getAdminHistory(),]);

            const sessionsWithFee = await Promise.all(rawSessions.map(async (s) => {
                if (!s.exitTime) {
                    const fee = await getCurrentFee(s.id);
                    return {...s, currentFee: fee};
                }
                return {...s, currentFee: s.fee};
            }));

            setAreas(areasData);
            setSessions(sessionsWithFee);
        } catch (err) {
            console.error("Refresh data failed:", err);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const getColor = (status) => status === "AVAILABLE" ? "green" : status === "FULL" ? "red" : status === "CLOSED" ? "black" : "gray";

    const cycleStatus = (status) => status === "AVAILABLE" ? "FULL" : status === "FULL" ? "CLOSED" : "AVAILABLE";

    const handleStatusChange = async (area) => {
        try {
            const newStatus = cycleStatus(area.status);
            await updateParkingStatus(area.id, newStatus);
            await refreshData();
        } catch (err) {
            console.error("Status update failed:", err);
        }
    };

    const handleExit = async (sessionId) => {
        try {
            await exitParking(sessionId);
            await refreshData();
        } catch (err) {
            console.error("Exit failed:", err);
        }
    };

    const findAreaName = (id) => {
        const area = areas.find((a) => a.id === id);
        return area ? area.name : `#${id}`;
    };

    const activeSessions = sessions.filter((s) => !s.exitTime);
    const pastSessions = sessions.filter((s) => s.exitTime);

    const sortedPastSessions = [...pastSessions].sort((a, b) => {
        const da = new Date(a[sortKey]);
        const db = new Date(b[sortKey]);
        return db - da;
    });

    return (<div className="map-container">
        <div className="transparent-box">
            <h2>Otopark Personel Paneli</h2>

            <div className="map-wrapper" style={{position: "relative"}}>
                <img src={otoparkMap} alt="Otopark Haritası" className="map-image"/>
                {areas.map((area) => (<button
                    key={area.id}
                    className="parking-button"
                    style={{
                        position: "absolute",
                        top: area.topPercent,
                        left: area.leftPercent,
                        backgroundColor: getColor(area.status),
                    }}
                    onClick={() => handleStatusChange(area)}
                >
                    {area.name}
                </button>))}
            </div>

            <section className="sessions-list">
                <h3>Aktif Oturumlar</h3>
                <div className="sessions-wrapper">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Otopark Adı</th>
                            <th>Plaka</th>
                            <th>Giriş</th>
                            <th>Ücret (₺)</th>
                            <th>İşlem</th>
                        </tr>
                        </thead>
                        <tbody>
                        {activeSessions.map((s) => (<tr key={s.id} className="active-session">
                            <td>{s.id}</td>
                            <td>{findAreaName(s.parkingAreaId)}</td>
                            <td>{s.plate}</td>
                            <td>{new Date(s.enterTime).toLocaleString()}</td>
                            <td>{Number(s.currentFee).toFixed(2)}</td>
                            <td>
                                <button onClick={() => handleExit(s.id)}>Çıkış</button>
                            </td>
                        </tr>))}
                        </tbody>
                    </table>
                </div>
            </section>

            <button
                className="toggle-button"
                onClick={() => setShowHistory((h) => !h)}
            >
                {showHistory ? "Geçmişi Gizle" : "Geçmişi Göster"}
            </button>

            {showHistory && (<section className="sessions-list">
                <h3>Geçmiş Oturumlar</h3>
                <div style={{margin: "8px 0"}}>
                    <label style={{marginRight: "8px"}}>Sırala:</label>
                    <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                    >
                        <option value="exitTime">Çıkış Zamanına Göre</option>
                        <option value="enterTime">Giriş Zamanına Göre</option>
                    </select>
                </div>
                <div className="sessions-wrapper">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Otopark Adı</th>
                            <th>Plaka</th>
                            <th>Giriş</th>
                            <th>Çıkış</th>
                            <th>Ücret (₺)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedPastSessions.map((s) => (<tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{findAreaName(s.parkingAreaId)}</td>
                            <td>{s.plate}</td>
                            <td>{new Date(s.enterTime).toLocaleString()}</td>
                            <td>{new Date(s.exitTime).toLocaleString()}</td>
                            <td>{Number(s.fee).toFixed(2)}</td>
                        </tr>))}
                        </tbody>
                    </table>
                </div>
            </section>)}

            <div>
                <button
                    className="back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    </div>);
}
