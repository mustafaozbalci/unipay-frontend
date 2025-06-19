// src/pages/ParkingUsers.jsx

import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {enterParking, exitParking, getCurrentFee, getParkingAreas, getParkingHistory} from "../api";
import "../styles/ParkingUsers.css";

const ParkingUsers = ({addNotification, user, onBalanceUpdate}) => {
    const navigate = useNavigate();
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState("");
    const [sessions, setSessions] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        getParkingAreas()
            .then(setAreas)
            .catch(err => console.error("Load areas:", err));
    }, []);

    const refreshHistory = () => {
        getParkingHistory()
            .then(raw => {
                const withFee = raw.map(s => ({
                    ...s, currentFee: s.exitTime ? s.fee : 0
                }));
                setSessions(withFee);

                withFee
                    .filter(s => !s.exitTime)
                    .forEach(s => {
                        getCurrentFee(s.id)
                            .then(fee => setSessions(prev => prev.map(x => x.id === s.id ? {
                                ...x, currentFee: fee
                            } : x)))
                            .catch(err => console.error(`Fee fetch failed for session ${s.id}:`, err));
                    });
            })
            .catch(err => {
                console.error("Load history:", err);
                addNotification("Failed to load parking history", 5000);
            });
    };
    useEffect(refreshHistory, [addNotification]);

    const activeSessions = sessions.filter(s => !s.exitTime);
    useEffect(() => {
        if (activeSessions.length === 0) return;
        const intervalId = setInterval(() => {
            activeSessions.forEach(s => {
                getCurrentFee(s.id)
                    .then(fee => setSessions(prev => prev.map(x => x.id === s.id ? {...x, currentFee: fee} : x)))
                    .catch(err => console.error(`Polling fee failed for session ${s.id}:`, err));
            });
        }, 30000);

        return () => clearInterval(intervalId);
    }, [activeSessions]);

    const findAreaName = areaId => {
        const area = areas.find(a => a.id === areaId);
        return area ? area.name : `#${areaId}`;
    };
    const selectedAreaObj = areas.find(a => String(a.id) === String(selectedArea));

    const handleEnter = () => {
        if (!selectedArea) {
            addNotification("Lütfen bir otopark seçin", 3000);
            return;
        }
        if (selectedAreaObj?.status === "CLOSED") {
            addNotification("Bu otopark şu anda kapalı, giriş yapamazsınız.", 5000);
            return;
        }
        if (selectedAreaObj?.status === "FULL") {
            addNotification("Bu otopark dolu, giriş yapamazsınız.", 5000);
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
                const paid = session.currentFee ?? session.fee ?? 0;
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

    const historySessions = sessions.filter(s => s.exitTime);

    return (<div className="parking-users-container">
        <h2>Otopark Kullanımı</h2>
        <div className="transparent-box">

            {activeSessions.length === 0 && (<div className="parking-action">
                <label>Otopark Seç:</label>
                <select
                    value={selectedArea}
                    onChange={e => setSelectedArea(e.target.value)}
                >
                    <option value="">-- Seçiniz --</option>
                    {areas.map(a => (<option
                        key={a.id}
                        value={a.id}
                        disabled={a.status === "CLOSED"}
                    >
                        {a.name} ({a.status})
                    </option>))}
                </select>
                <button onClick={handleEnter}>Giriş Yap</button>
            </div>)}

            <div className="parking-table-controls">
                <button onClick={() => setShowHistory(p => !p)}>
                    {showHistory ? "Aktif Oturumları Göster" : "Geçmişi Göster"}
                </button>
            </div>

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
                    {historySessions.map(s => (<tr key={s.id}>
                        <td>{findAreaName(s.parkingAreaId)}</td>
                        <td>
                            {new Date(s.enterTime).toLocaleString()}
                        </td>
                        <td>
                            {new Date(s.exitTime).toLocaleString()}
                        </td>
                        <td>{s.currentFee.toFixed(2)}₺</td>
                        <td>Tamamlandı</td>
                    </tr>))}
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
                    {activeSessions.map(s => (<tr key={s.id}>
                        <td>{findAreaName(s.parkingAreaId)}</td>
                        <td>
                            {new Date(s.enterTime).toLocaleString()}
                        </td>
                        <td>{s.currentFee.toFixed(2)}₺</td>
                        <td>
                            <button onClick={() => handleExit(s.id)}>
                                Çıkış Yap
                            </button>
                        </td>
                    </tr>))}
                    </tbody>
                </table>
            </>))}

            <div className="alt-taraf">
                <button onClick={() => navigate("/parking-status-map")}>
                    Show Parking Area Status
                </button>
            </div>
            <button
                className="back-button"
                onClick={() => navigate("/dashboard")}
            >
                Back to Dashboard
            </button>
        </div>
    </div>);
};

export default ParkingUsers;
