import React, { useState } from 'react';
import './register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';
        try {
            const response = await fetch(`${baseUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json().catch(() => ({
                error: "Failed to parse response. Please try again.",
            }));

            if (response.ok) {
                alert(data.message);
                window.location.href = '/';
            } else {
                alert(data.error || "Registration failed.");
            }
        } catch (error) {
            alert("An error occurred. Please try again later.");
            console.error("Error:", error);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h1>Register</h1>
                <form onSubmit={handleRegister}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
