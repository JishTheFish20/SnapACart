import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./shop.css";

const Shop = () => {
    const [cart, setCart] = useState([]);
    const [showVideo, setShowVideo] = useState(false);
    const [predictedItem, setPredictedItem] = useState('');
    const [loading, setLoading] = useState(false);  // For loading state when calling API
    const videoRef = useRef(null);  // Ref to hold the video element
    const [listID, setListID] = useState(1); // Track the listID
    //const username = "current_user"; // Replace with the actual username from your auth context
    const username = localStorage.getItem("username"); // Retrieve the username

    // const items = [
    //     { id: 1, name: "Oreos", price: "$2.99", img: "/images/oreos.jpg" },
    //     { id: 2, name: "Water Bottle", price: "$1.50", img: "/images/waterBottle.webp" },
    //     { id: 3, name: "Chips", price: "$3.00", img: "/images/lays.webp" },
    // ];
    const Shop = () => {
        const username = localStorage.getItem("username"); // Get username from localStorage
    
        return (
            <div className="shop-container">
                {/* Access the username and use it in your JSX */}
                <h1>Welcome, {username}</h1>
                {/* Other content */}
            </div>
        );
    };
    
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

    const addToCart = async (item) => {
        const username = localStorage.getItem("username"); // Assuming username is stored in localStorage
        const listID = localStorage.getItem("listID") || 1; // Default to 1 if not set
    
        try {
            // Update the backend
            await fetch("/update_cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    itemid: item.id,
                    listID: listID,
                }),
            });
            
            // Update the cart locally
            setCart((prevCart) => [...prevCart, item]);
        } catch (error) {
            console.error("Error updating cart:", error);
            console.log("Sending to backend:", { username, itemid: item.id, listID });

        }
    }
    
    const handleCheckout = async () => {
        const username = localStorage.getItem("username");
        const listID = localStorage.getItem("listID") || 1;
    
        try {
            // Send a checkout request to the backend
            await fetch("/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    listID: listID,
                }),
            });
    
            // Clear the cart locally
            setCart([]);
    
            // Increment the listID and store it
            localStorage.setItem("listID", parseInt(listID) + 1);
        } catch (error) {
            console.error("Error during checkout:", error);
            console.log("Sending checkout request:", { username, listID });

        }
    };
    // const addToCart = (item) => {
    //     setCart((prevCart) => [...prevCart, item]);
    // };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    // Capture Frame from Video Feed
    const captureFrame = () => {
        if (!videoRef.current) {
            console.error("Video element not available");
            return;
        }
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Set canvas dimensions to video element's dimensions
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw the current video frame onto the canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert canvas to base64-encoded image (JPEG or PNG)
        const imageData = canvas.toDataURL("image/jpeg");
        return imageData;  // Send this image to the backend for inference
    };

    // Send Frame to Backend for Inference
    const sendFrameToBackend = async (imageData) => {
        setLoading(true);  // Set loading state to true when making API request
        try {
            const token = localStorage.getItem('authToken');  // Assuming the token is stored in localStorage
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: imageData }), // Send the image as base64
            });

            if (!response.ok) {
                throw new Error("Failed to fetch item from the backend");
            }

            const data = await response.json();
            if (data.item) {
                setPredictedItem(data.item); // Handle the response (detected objects and confidence)
                // { id: 3, name: "Chips", price: "$3.00", img: "/images/lays.webp" }
                if(data.item != "No Item"){
                    var itemJson = {id: 4, name: data.item, price: "$2.00", img: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/230ac8d3-54fe-47f6-8c5a-8e7e383080df/dfs0z7t-3aac49bd-c9e3-4ec7-b68b-d3eb03276cd6.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzIzMGFjOGQzLTU0ZmUtNDdmNi04YzVhLThlN2UzODMwODBkZlwvZGZzMHo3dC0zYWFjNDliZC1jOWUzLTRlYzctYjY4Yi1kM2ViMDMyNzZjZDYucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.t4TM9ftTTxg_ywYMczWBNbX2Ww9xtQ8lnXrEc1I-ysA"};
                    addToCart(itemJson);
                    const sound = new Audio('/checkoutSound.mp3');
                    sound.play();
                }
                
            } else {
                console.error("No item received");
            }
        } catch (error) {
            console.error("Error sending frame to backend:", error);
        } finally {
            setLoading(false);  // Set loading state to false after the API call
        }
    };

    // Start Video Feed and Capture Frames
    const handleStartVideo = async () => {
        setShowVideo(true);
        try {
            // Request access to the webcam
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;

            // Capture and send a frame every 2 seconds
            setInterval(() => {
                const imageData = captureFrame();
                sendFrameToBackend(imageData);
            }, 2000);
        } catch (error) {
            console.error("Error accessing webcam: ", error);
        }
    };

    const handleStopVideo = () => {
        setShowVideo(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());  // Stop all media tracks
            videoRef.current.srcObject = null;
        }
    };

    return (
        <div className="shop-container">
            {/* Navbar */}
            <nav className="navbar">
                <Link to="/catalog" className="nav-link">Catalog</Link>
                <Link to="/history" className="nav-link">Order History</Link>
                <Link to="/" className="nav-link">Logout</Link>
            </nav>

            {/* Main Content */}
            <div className="content">
                {/* items list */}
                    <div className="item-grid">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="item-card"
                                onClick={() => addToCart(item)} // Add to cart on click
                            >
                                <img 
                                    src={item.img}
                                    alt={item.name}
                                    onError={(e) => { e.target.src = '/images/default.jpg'; }}
                                    className="item-image"
                                />
                                <h3>{item.name}</h3>
                                <p>${item.price.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                {/* Right Side (Video Feed + Cart) */}
                <div className="right-side">
                    {/* Video Feed Section */}
                     {/* Detected Objects Section */}
                     <div className="detections">
                        <h2>Detected Objects</h2>
                        <p>{predictedItem}</p>
                    </div>
                    <div className="video-section">
                        <h1>Live Video Feed</h1>
                        {!showVideo ? (
                            <button onClick={handleStartVideo} className="start-video-btn">
                                Start Video Feed
                            </button>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    width="100%"
                                    height="auto"
                                    autoPlay
                                    style={{
                                        border: "1px solid #ddd",
                                        marginBottom: "20px",
                                    }}
                                />
                                <button onClick={handleStopVideo} className="stop-video-btn">
                                    Stop Video Feed
                                </button>
                            </>
                        )}
                    </div>

                    {/* Cart Section */}
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
                        <button onClick={handleCheckout} className="checkout-btn">
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
