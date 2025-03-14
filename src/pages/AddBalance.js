import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {depositPayment} from "../api";
import "../styles/AddBalance.css";

const AddBalance = ({user, onBalanceUpdate, addNotification}) => {
    const [amount, setAmount] = useState("");
    const [cardHolderName, setCardHolderName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expireMonth, setExpireMonth] = useState("");
    const [expireYear, setExpireYear] = useState("");
    const [cvc, setCvc] = useState("");

    const navigate = useNavigate();

    const handleAddBalance = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("authToken");
            const username = localStorage.getItem("username");
            if (!token || !username) {
                addNotification("Please log in before depositing.", 5000);
                return;
            }

            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                addNotification("Please enter a valid numeric amount.", 5000);
                return;
            }

            const requestBody = {
                price: numericAmount, paidPrice: numericAmount, paymentCard: {
                    cardHolderName, cardNumber, expireMonth, expireYear, cvc,
                },
            };

            const paymentResult = await depositPayment(requestBody);

            if (paymentResult.status === "success" || paymentResult.status === "SUCCESS") {
                addNotification("Payment successful!", 5000);

                if (onBalanceUpdate) {
                    onBalanceUpdate(user.balance + numericAmount);
                }

                navigate("/dashboard");
            } else {
                addNotification(paymentResult.errorMessage || "Payment failed.", 5000);
            }
        } catch (error) {
            addNotification(`Error: ${error.message}`, 5000);
            console.error("AddBalance Error:", error);
        }
    };

    return (<div className="add-balance-container">
        <div className="transparent-box">
            <h2 className="add-balance-title">Add Balance</h2>
            <form onSubmit={handleAddBalance}>
                <div className="add-balance-input-group">
                    <label htmlFor="amount" className="add-balance-label">
                        Amount (₺):
                    </label>
                    <input
                        type="number"
                        id="amount"
                        className="add-balance-input"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        required
                    />
                </div>

                <div className="add-balance-input-group">
                    <label htmlFor="cardHolderName" className="add-balance-label">
                        Card Holder Name:
                    </label>
                    <input
                        type="text"
                        id="cardHolderName"
                        className="add-balance-input"
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div className="add-balance-input-group">
                    <label htmlFor="cardNumber" className="add-balance-label">
                        Card Number:
                    </label>
                    <input
                        type="text"
                        id="cardNumber"
                        className="add-balance-input"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="5528790000000008"
                        required
                    />
                </div>

                <div className="add-balance-input-row">
                    <div className="add-balance-input-group">
                        <label htmlFor="expireMonth" className="add-balance-label">
                            Expire Month:
                        </label>
                        <input
                            type="text"
                            id="expireMonth"
                            className="add-balance-input"
                            value={expireMonth}
                            onChange={(e) => setExpireMonth(e.target.value)}
                            placeholder="12"
                            required
                        />
                    </div>

                    <div className="add-balance-input-group">
                        <label htmlFor="expireYear" className="add-balance-label">
                            Expire Year:
                        </label>
                        <input
                            type="text"
                            id="expireYear"
                            className="add-balance-input"
                            value={expireYear}
                            onChange={(e) => setExpireYear(e.target.value)}
                            placeholder="2030"
                            required
                        />
                    </div>
                </div>

                <div className="add-balance-input-group">
                    <label htmlFor="cvc" className="add-balance-label">
                        CVC:
                    </label>
                    <input
                        type="text"
                        id="cvc"
                        className="add-balance-input"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="123"
                        required
                    />
                </div>

                <button className="submit">
                    Pay Now & Add Balance
                </button>
            </form>
            <button
                type="button"
                className="back-button"
                onClick={() => navigate("/dashboard")}
            >
                Back to Dashboard
            </button>

        </div>
    </div>);
};

export default AddBalance;