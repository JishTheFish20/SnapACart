import React, { useEffect, useState } from 'react';
import './history.css';

const History = ({ username }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`/history/${username}`);
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data);
                } else {
                    console.error("Failed to fetch history.");
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [username]);

    if (loading) {
        return <div>Loading order history...</div>;
    }

    if (history.length === 0) {
        return <div>No order history found.</div>;
    }

    return (
        <div className="history-container">
            <h1>Order History</h1>
            <ul>
                {history.map(order => (
                    <li key={order.listID} className="order-group">
                        <h2>Order #{order.listID}</h2>
                        <ul>
                            {order.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                        <p><strong>Total Price:</strong> {order.total}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default History;

