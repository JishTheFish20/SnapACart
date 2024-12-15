import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './shop.css';

const Shop = () => {
    const [cart, setCart] = useState([]);
    const [cameraOn, setCameraOn] = useState(false);
    const videoRef = useRef(null);

    const items = [
        { id: 1, name: "Oreos", price: "$2.99", img: "/images/oreos.jpg" },
        { id: 2, name: "Water Bottle", price: "$1.50", img: "/images/waterBottle.webp" },
        { id: 3, name: "Chips", price: "$3.00", img: "/images/lays.webp" },
    ];

    const addToCart = (item) => {
        setCart([...cart, item]);
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const toggleCamera = async () => {
        if (cameraOn) {
            // Stop the camera
            const stream = videoRef.current?.srcObject;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
            }
            videoRef.current.srcObject = null;
            setCameraOn(false);
        } else {
            // Start the camera
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setCameraOn(true);
            } catch (error) {
                console.error("Error accessing camera:", error);
                alert("Unable to access the camera. Please ensure camera permissions are enabled.");
            }
        }
    };

    return (
        <div className="shop-container">
            {/* nav bar */}
            <nav className="navbar">
                <Link to="/catalog" className="nav-link">Catalog</Link>
                <Link to="/history" className="nav-link">Order History</Link>
                <Link to="/" className="nav-link">Logout</Link>
            </nav>

            {/* main content */}
            <div className="content">
                <div className="catalog">
                    {items.map((item) => (
                        <div key={item.id} className="item-card" onClick={() => addToCart(item)}>
                            <img src={item.img} alt={item.name} />
                            <h3>{item.name}</h3>
                            <p>{item.price}</p>
                        </div>
                    ))}
                </div>
                <div className="cart">
                    <h2>Cart</h2>
                    {cart.length === 0 ? (
                        <p>Your cart is empty</p>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="cart-item">
                                <img src={item.img} alt={item.name} />
                                <div>
                                    <span>{item.name}</span>
                                    <span>{item.price}</span>
                                </div>
                                <button onClick={() => removeFromCart(index)}>Remove</button>
                            </div>
                        ))
                    )}
                    <button className="checkout-btn">Checkout</button>
                </div>
            </div>

            {/* camera */}
            <div className="camera-section">
                <button className="camera-btn" onClick={toggleCamera}>
                    {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
                </button>
                {cameraOn && (
                    <div className="camera-feed-container">
                        <p>You are viewing yourself:</p>
                        <video ref={videoRef} className="camera-feed" autoPlay playsInline></video>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
