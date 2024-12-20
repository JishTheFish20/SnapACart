import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./shop.css";

const Shop = () => {
    const [cart, setCart] = useState([]);
    const [showVideo, setShowVideo] = useState(false);
    const [predictedItem, setPredictedItem] = useState("");
    const [loading, setLoading] = useState(false); // For loading state when calling API
    const videoRef = useRef(null); // Ref to hold the video element
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const response = await fetch("/catalog");
                const data = await response.json();
                console.log("Fetched Catalog Data:", data);
                setItems(data);
            } catch (error) {
                console.error("Error fetching catalog:", error);
            }
        };

        fetchCatalog();
    }, []);

    const addToCart = (item) => {
        setCart((prevCart) => [...prevCart, item]);
    };

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
        return imageData; // Send this image to the backend for inference
    };

    // Send Frame to Backend for Inference
    const sendFrameToBackend = async (imageData) => {
        setLoading(true); // Set loading state to true when making API request
        try {
            const response = await fetch("/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image: imageData }), // Send the image as base64
            });

            if (!response.ok) {
                throw new Error("Failed to fetch item from the backend");
            }

            const data = await response.json();
            if (data.item) {
                if (data.item !== "No Item") {
                    fetch(`/getItem?name=${data.item}`)
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error("Network response was not ok");
                            }
                            return response.json();
                        })
                        .then((item) => {
                            // Assuming the API returns the item details
                            const itemJson = {
                                id: item.id,
                                name: item.name,
                                price: `$${item.price.toFixed(2)}`,
                                img: item.img,
                            };

                            addToCart(itemJson);
                            const sound = new Audio("/checkoutSound.mp3");
                            sound.play();
                        });
                }
            } else {
                console.error("No item received");
            }
        } catch (error) {
            console.error("Error sending frame to backend:", error);
        } finally {
            setLoading(false); // Set loading state to false after the API call
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
            tracks.forEach((track) => track.stop()); // Stop all media tracks
            videoRef.current.srcObject = null;
        }
    };

    // Checkout Functionality
    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert("Your cart is empty. Add items before checking out.");
            return;
        }

        try {
            const response = await fetch("/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Assuming the auth token is stored
                },
                body: JSON.stringify({ cart }), // Send the cart data
            });

            if (!response.ok) {
                throw new Error("Checkout failed.");
            }

            const data = await response.json();
            setCart([]); // Clear the cart after successful checkout
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("Checkout failed. Please try again.");
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
                {/* Catalog Section */}
                <div className="catalog">
                    {items.map((item) => (
                        <div key={item.id} className="item-card" onClick={() => addToCart(item)}>
                            <img src={item.img} alt={item.name} />
                            <h3>{item.name}</h3>
                            <p>{item.price}</p>
                        </div>
                    ))}
                </div>

                {/* Right Side (Video Feed + Cart) */}
                <div className="right-side">
                    {/* Video Feed Section */}
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
                        <button onClick={handleCheckout} className="checkout-btn">Checkout</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
