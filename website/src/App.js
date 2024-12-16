import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import Catalog from './components/catalog';
import History from './components/history';
import Shop from './components/shop';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/history" element={<History />} />
                <Route path="/shop" element={<Shop />} />
            </Routes>
        </Router>
    );
};

export default App;
