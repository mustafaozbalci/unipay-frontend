import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../api";
import "../styles/Menu.css";

const EspressolabMenu = ({ addNotification }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});

  const menuItems = [
    { id: 1, name: "Espresso", description: "Classic espresso shot", price: 30 },
    { id: 2, name: "Cortado", description: "Espresso with warm milk", price: 35 },
    { id: 3, name: "Flat White", description: "Velvety milk + espresso", price: 40 },
  ];

  const handleAddToCart = (item, quantity) => {
    const parsedQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((c) => c.id === item.id);
      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += parsedQuantity;
        return updatedCart;
      }
      return [...prevCart, { ...item, quantity: parsedQuantity }];
    });
    addNotification(`${item.name} sepete eklendi`, 1500);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    const parsedQuantity = Math.max(0, parseInt(newQuantity, 10) || 0);
    if (parsedQuantity < 1) {
      setCart(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    setCart(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity: parsedQuantity } : item
    ));
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      addNotification("Sipariş için giriş yapmalısınız", 5000);
      navigate("/login");
      return;
    }

    try {
      await placeOrder({
        restaurantId: 2,
        items: cart.map(item => ({
          itemName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: cart.reduce((acc, item) => acc + item.quantity * item.price, 0),
      });

      addNotification("🚀 Siparişiniz başarıyla oluşturuldu!", 5000);
      navigate("/order-tracking-users");
    } catch (err) {
      console.error("Sipariş hatası:", err);
      addNotification("Sipariş başarısız. Lütfen tekrar deneyin.", 5000);
    }
  };

  return (
      <div className="menu-container">
        <h1 className="menu-title">Espressolab Menü</h1>

        <div className="menu-items">
          {menuItems.map((item) => (
              <div key={item.id} className="menu-item">
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <p className="price">{item.price} TL</p>

                <div className="quantity-selector">
                  <label>Adet:</label>
                  <input
                      type="number"
                      min="1"
                      value={quantities[item.id] || 1}
                      onChange={(e) => setQuantities(prev => ({
                        ...prev,
                        [item.id]: e.target.value
                      }))}
                  />
                </div>

                <button onClick={() => handleAddToCart(item, quantities[item.id] || 1)}>
                  Sepete Ekle
                </button>
              </div>
          ))}
        </div>

        {cart.length > 0 && (
            <div className="cart-summary">
              <h3>Sipariş Özeti</h3>
              <ul>
                {cart.map((item) => (
                    <li key={item.id}>
                      <div className="cart-item-header">
                        <span>{item.name}</span>
                        <span>{item.price} TL</span>
                      </div>

                      <div className="cart-item-controls">
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                          -
                        </button>
                        <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                        />
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                          +
                        </button>
                      </div>

                      <div className="cart-item-total">
                        Toplam: {item.quantity * item.price} TL
                      </div>
                    </li>
                ))}
              </ul>

              <div className="cart-total">
                Genel Toplam: {cart.reduce((acc, item) => acc + item.quantity * item.price, 0)} TL
              </div>

              <button className="checkout-button" onClick={handleCheckout}>
                Siparişi Tamamla
              </button>
            </div>
        )}

        <button className="back-button" onClick={() => navigate("/restaurants")}>
          Restoranlara Dön
        </button>
      </div>
  );
};

export default EspressolabMenu;