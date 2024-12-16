// import React from 'react';
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './login.css';
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
    
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';
        try {
            const response = await fetch(`${baseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert(data.message);
                navigate('/catalog');
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('An error occurred while logging in. Please try again.');
        }
    };

    return (
        <div className="login-container">
             <div className="login-box">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                
                <button type="submit">Login</button>
                <button type="button" onClick={() => navigate('/register')}>
                    Register
                </button>
            </form>
            </div>
        </div>
    );
};

export default Login;
