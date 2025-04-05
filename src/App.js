import React, { useState } from 'react';
import { 
  Routes, 
  Route, 
  Navigate,
  useLocation,
  Outlet
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Player from './components/Player';
import Blog from './pages/Blog';
import Games from './pages/Help';
import Login from './components/AuthSystem/Login';
import Register from './components/AuthSystem/Register';
import Profile from './components/AuthSystem/Profile';
import Submit from './pages/Submit';
import SubmitPostForm from './components/SubmitPostForm';
import './App.css';

const checkAdminStatus = (user) => {
  // In a real app, you would check for admin privileges from your auth system
  // For now, we'll check for a specific email domain or admin flag
  if (!user) return false;
  return user.email?.endsWith('@admin.com') || user.isAdmin === true;
};

// Layout wrapper for routes that need content container
const ContentLayout = () => {
  return (
    <div className="content-wrapper">
      <Outlet />
    </div>
  );
};

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const bottomPlayerBarHeight = '56px'; // Match the height in bottomPlayerBar.css

  const [user, setUser] = useState(null);
  const isAdmin = checkAdminStatus(user);

  // Function to update user data (for profile changes)
  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <div className="App">
      <Navbar user={user} setUser={setUser} isAdmin={isAdmin} />
      <div
        style={{ 
          flex: 1,
          width: '100%',
          paddingBottom: !isHomePage ? bottomPlayerBarHeight : '0' 
        }}
      >
        <Routes>
          {/* Home page doesn't need content wrapper as it has its own layout */}
          <Route path="/" element={<Home />} />
          
          {/* Routes with content wrapper */}
          <Route element={<ContentLayout />}>
            <Route path="/blog" element={<Blog />} />
            <Route path="/games" element={<Games />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route 
              path="/profile" 
              element={
                user ? (
                  <Profile user={user} updateUser={updateUser} />
                ) : (
                  <Navigate to="/login" replace state={{ from: location }} />
                )
              } 
            />
            <Route
              path="/blog-admin"
              element={
                isAdmin ? (
                  <SubmitPostForm />
                ) : (
                  <Navigate to="/login" replace state={{ from: location }} />
                )
              }
            />
          </Route>
          
          {/* Submit page has its own container styles */}
          <Route path="/submit" element={<Submit />} />
          
          {/* Add a 404 route if needed */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
      <Player user={user} />
    </div>
  );
}

export default App;