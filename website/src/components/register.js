import React from 'react';
import './register.css';

const Register = () => {
    return (
        <div className="register-container">
            <h1>Register</h1>
            <form>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" />
                
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" />
                
                <button type="button" onClick={() => window.location.href = '/login'}>
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
