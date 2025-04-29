// src/pages/ParkingUsers.jsx
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {enterParking, exitParking, getParkingAreas, getParkingHistory} from "../api";
import "../styles/ParkingUsers.css";

const ParkingUsers = ({addNotification, user, onBalanceUpdate}) => {
    const navigate = useNavigate();
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState("");
    const [sessions, setSessions] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // load available areas
    useEffect(() => {
        getParkingAreas().then(setAreas).catch(err => console.error("Load areas:", err));
    }, []);

    // load user's parking sessions
    const refreshHistory = () => {
        getParkingHistory().then(setSessions).catch(err => {
            console.error("Load history:", err);
            addNotification("Failed to load parking history", 5000);
        });
    };
    useEffect(refreshHistory, [addNotification]);

    // helpers
    const findAreaName = areaId => {
        const area = areas.find(a => a.id === areaId);
        return area ? area.name : `#${areaId}`;
    };
    const getPaidValue = s => {
        for (let c of [s.paidPrice, s.price, s.paid_price, s.amount, s.paidAmount, s.fee]) {
            if (c != null && !isNaN(parseFloat(c))) return parseFloat(c);
        }
        return 0;
    };
    const selectedAreaObj = areas.find(a => String(a.id) === String(selectedArea));

    // actions
    const handleEnter = () => {
        if (!selectedArea) {
            addNotification("Lütfen bir otopark seçin", 3000);
            return;
        }
        if (selectedAreaObj?.status === "CLOSED") {
            addNotification("Bu otopark şu anda kapalı, giriş yapamazsınız.", 5000);
            return;
        }
        enterParking(selectedArea)
            .then(() => {
                addNotification("Araç girişi kaydedildi", 5000);
                refreshHistory();
            })
            .catch(err => {
                console.error(err);
                addNotification("Giriş başarısız: " + err.message, 5000);
            });
    };

    const handleExit = sessionId => {
        exitParking(sessionId)
            .then(session => {
                addNotification("Araç çıkışı kaydedildi", 5000);
                const paid = getPaidValue(session);
                if (user && onBalanceUpdate) {
                    onBalanceUpdate(user.balance - paid);
                }
                refreshHistory();
            })
            .catch(err => {
                console.error(err);
                addNotification("Çıkış başarısız: " + err.message, 5000);
            });
    };

    const activeSessions = sessions.filter(s => !s.exitTime);
    const historySessions = sessions.filter(s => s.exitTime);

    return (<div className="parking-users-container">
        <h2>Otopark Kullanımı</h2>
        <div className="transparent-box">

            {/* only show entry controls when no active session */}
            {activeSessions.length === 0 && (<div className="parking-action">
                <label>Otopark Seç:</label>
                <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)}>
                    <option value="">-- Seçiniz --</option>
                    {areas.map(a => (<option key={a.id} value={a.id} disabled={a.status === "CLOSED"}>
                        {a.name} ({a.status})
                    </option>))}
                </select>
                <button onClick={handleEnter}>Giriş Yap</button>
            </div>)}

            {/* history toggle */}
            <div className="parking-table-controls">
                <button
                    className="history-toggle-button"
                    onClick={() => setShowHistory(p => !p)}
                >
                    {showHistory ? "Aktif Oturumları Göster" : "Geçmişi Göster"}
                </button>
            </div>

            {/* sessions table */}
            {showHistory ? (<>
                <h3>Geçmiş Oturumlar</h3>
                {historySessions.length > 0 ? (<table className="parking-history-table">
                    <thead>
                    <tr>
                        <th>Alan</th>
                        <th>Giriş Zamanı</th>
                        <th>Çıkış Zamanı</th>
                        <th>Ödenen Tutar (₺)</th>
                        <th>Durum</th>
                    </tr>
                    </thead>
                    <tbody>
                    {historySessions.map(s => {
                        const paid = getPaidValue(s);
                        return (<tr key={s.id}>
                            <td>{findAreaName(s.parkingAreaId)}</td>
                            <td>{new Date(s.enterTime).toLocaleString()}</td>
                            <td>{new Date(s.exitTime).toLocaleString()}</td>
                            <td>{paid.toFixed(2)}₺</td>
                            <td>Tamamlandı</td>
                        </tr>);
                    })}
                    </tbody>
                </table>) : (<p>Hiç geçmiş oturum bulunamadı.</p>)}
            </>) : (activeSessions.length > 0 && (<>
                <h3>Aktif Oturumlar</h3>
                <table className="parking-history-table">
                    <thead>
                    <tr>
                        <th>Alan</th>
                        <th>Giriş Zamanı</th>
                        <th>Ücret (₺)</th>
                        <th>İşlem</th>
                    </tr>
                    </thead>
                    <tbody>
                    {activeSessions.map(s => {
                        const paid = getPaidValue(s);
                        return (<tr key={s.id}>
                            <td>{findAreaName(s.parkingAreaId)}</td>
                            <td>{new Date(s.enterTime).toLocaleString()}</td>
                            <td>{paid.toFixed(2)}₺</td>
                            <td>
                                <button onClick={() => handleExit(s.id)}>
                                    Çıkış Yap
                                </button>
                            </td>
                        </tr>);
                    })}
                    </tbody>
                </table>
            </>))}

            <div className="alt-taraf">
                <button className="show-status-button" onClick={() => navigate("/parking-status-map")}>
                    Show Parking Area Status
                </button>
            </div>
            <button className="back-button" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
            </button>
        </div>
    </div>);
};

export default ParkingUsers;
