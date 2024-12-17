// import React from 'react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './catalog.css';

const Catalog = () => {
    // const items = [
    //     { id: 1, name: "Oreos", price: "$2.99", img: "/images/oreos.jpg" },
    //     { id: 2, name: "Water Bottle", price: "$1.50", img: "/images/waterBottle.webp" },
    //     { id: 3, name: "Chips", price: "$3.00", img: "/images/lays.webp" }
    // ];
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/catalog'); 
                const data = await response.json();
                console.log("Fetched Catalog Data:", data); 
                setItems(data);
            } catch (error) {
                console.error("Error fetching catalog:", error);
            }
        };
    
        fetchCatalog();
    }, []);
    

    return (
        <div className="catalog-container">
            {/* nav bar */}
            <nav className="navbar">
                <Link to="/shop" className="nav-link">Shop</Link>
                <Link to="/history" className="nav-link">Order History</Link>
                <Link to="/" className="nav-link">Logout</Link>
            </nav>

            <h1>Catalog</h1>

            {/* items list */}
            <div className="item-grid">
                {items.map(item => (
                    <div key={item.id} className="item-card">
                        <img 
                        src={item.img} 
                        alt={item.name} 
                        onError={(e) => {e.target.src = '/images/default.jpg';}}
                        className="item-image"
                        />
                        <h3>{item.name}</h3>
                        <p>${item.price.toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Catalog;
