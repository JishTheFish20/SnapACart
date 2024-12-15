import React from 'react';
import './history.css';

const History = () => {
    const orders = [
        { id: 1, date: "2024-12-01", items: ["Oreos", "Water Bottle"], total: "$4.49" },
        { id: 2, date: "2024-12-05", items: ["Chips"], total: "$3.00" }
    ];

    return (
        <div className="history-container">
            <h1>Order History</h1>
            <ul>
                {orders.map(order => (
                    <li key={order.id}>
                        <span>{order.date}</span>
                        <span>{order.items.join(", ")}</span>
                        <span>{order.total}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default History;
