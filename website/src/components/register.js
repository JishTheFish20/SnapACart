// import React from 'react';
import React, {useState} from 'react';
import './register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        const response = await fetch('http://127.0.0.1:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = '/';
        }
        else {
            alert(data.error);
        }
    };

    return (
        <div className="register-container">
            <div className='register-box'>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                
                <button type="submit" onClick={() => window.location.href = '/'}>
                    Register
                </button>
            </form>
            </div>
        </div>
    );
};

export default Register;
