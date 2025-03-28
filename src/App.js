import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Player from './components/Player';
import Blog from './pages/Blog';
import Submit from './pages/Submit';
import Help from './pages/Help';
import Login from './components/AuthSystem/Login';
import Register from './components/AuthSystem/Register';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="app-container">
      <Navbar user={user} setUser={setUser} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/help" element={<Help />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
      </Routes>
      
      <Player />
    </div>
  );
}

export default App;