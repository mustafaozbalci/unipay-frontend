import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {register as apiRegister} from "../api";
import "../styles/Register.css";

const Register = ({addNotification}) => {
  const [formData, setFormData] = useState({
    name: "", email: "", studentNumber: "", password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (formData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters long.";
    }
    if (formData.studentNumber.trim()) {
      if (!/^\d{9}$/.test(formData.studentNumber.trim())) {
        errors.studentNumber = "Student Number must be 9 or left blank .";
      }
    }
    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
    return errors;
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setErrors({...errors, [e.target.name]: ""});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const requestBody = {
      username: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      studentNumber: formData.studentNumber.trim() ? formData.studentNumber.trim() : null,
    };

    try {
      const data = await apiRegister(requestBody);
      addNotification(`Registration successful! Welcome, ${data.username} 🎉`, 5000);
      navigate("/login");
    } catch (error) {
      addNotification("Registration failed: " + error.message, 5000);
      console.error("Registration error:", error);
    }
  };

  return (<div className="register-container">
    <div className="transparent-box">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={3}
        />
        {errors.name && <p className="error-message">{errors.name}</p>}

        <label>Email:</label>
        <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
        />
        {errors.email && <p className="error-message">{errors.email}</p>}

        <label>Student Number (optional):</label>
        <input
            type="text"
            name="studentNumber"
            value={formData.studentNumber}
            onChange={handleChange}
            placeholder="9 digits, or leave blank"
        />
        {errors.studentNumber && (<p className="error-message">{errors.studentNumber}</p>)}

        <label>Password:</label>
        <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
        />
        {errors.password && (<p className="error-message">{errors.password}</p>)}

        <button className="submit">Register</button>
      </form>
    </div>
  </div>);
};

export default Register;
