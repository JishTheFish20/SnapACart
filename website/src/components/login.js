import React from 'react';
import './login.css';

const Login = () => {
    return (
        <div className="login-container">
            <h1>Login</h1>
            <form>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" />
                
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" />
                
                <button type="submit">Login</button>
                <button type="button" onClick={() => window.location.href = '/register'}>
                    Register
                </button>
            </form>
        </div>
    );
};

export default Login;
