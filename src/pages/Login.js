// src/pages/Login.jsx
import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import "../styles/Login.css";

const Login = ({ setUser, addNotification }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await login({
                email: formData.email,
                password: formData.password,
            });

            localStorage.setItem("authToken", data.token);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("userEmail",data.user.email);

            setUser({
                id: data.user.id,
                name: data.user.username,
                email: data.user.email,
                balance: data.user.balance,
            });

            addNotification("Login successful!", 5000);
            navigate("/dashboard");
        } catch (error) {
            addNotification("Login failed: " + error.message, 5000);
            console.error("Login error:", error);
        }
    };

    return (
        <div className="bg-container">
            <div className="transparent-box">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <label>Email:</label>
                    <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
