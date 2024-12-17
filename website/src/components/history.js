import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import './history.css';

const History = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/transactions', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || "Failed to fetch order history.");
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("An unexpected error occurred.");
            }
        };

        fetchOrders();
    }, []);

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <Link to="/shop" className="nav-link">Shop</Link>
                <Link to="/catalog" className="nav-link">Catalog</Link>
                <Link to="/" className="nav-link">Logout</Link>
            </nav>
            <div className="history-container">
                
                <h1>Order History</h1>
                <ul>
                    {orders.map(order => (
                        <li key={order.id} className="order-group">
                            <h2>Order #{order.id}</h2>
                            <span>Items: {order.items.join(", ")}</span>
                            <span>Total: ${order.total.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        
    );
};

export default History;
