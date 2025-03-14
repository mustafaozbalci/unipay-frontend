import React, { useEffect, useState } from 'react';
import '../styles/Notification.css';

const Notification = ({ message, duration = 5000, onClose, count = 1 }) => {
    const initialSeconds = Math.floor(duration / 1000);
    const [progress, setProgress] = useState(100);
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    useEffect(() => {
        const intervalTime = 100;
        const decrement = 100 / (duration / intervalTime);

        const progressInterval = setInterval(() => {
            setProgress(prev => Math.max(prev - decrement, 0));
        }, intervalTime);

        const secondInterval = setInterval(() => {
            setSecondsLeft(prev => Math.max(prev - 1, 0));
        }, 1000);

        const timeout = setTimeout(() => {
            clearInterval(progressInterval);
            clearInterval(secondInterval);
            onClose();
        }, duration);

        return () => {
            clearInterval(progressInterval);
            clearInterval(secondInterval);
            clearTimeout(timeout);
        };
    }, [duration, onClose]);

    return (
        <div className="notification-container slide-in">
            <div className="notification-content">
                <div className="notification-message">
                    {message}
                    {count > 1 && <span className="notification-counter">{count}</span>}
                </div>
                <div className="notification-countdown">{secondsLeft} saniye</div>
            </div>
            <div className="notification-progress">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

export default Notification;
