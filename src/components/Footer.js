import React from "react";
import "../styles/Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <p>© {new Date().getFullYear()} UniPay. Tüm hakları saklıdır.</p>
        </footer>
    );
};

export default Footer;
