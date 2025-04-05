import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/auth.css';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we were redirected from another page
  const from = location.state?.from?.pathname || '/';

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Check if this is an admin login
    const isAdminEmail = email.endsWith('@admin.com');

    // In a real app, you would validate credentials with your backend
    // This is just a placeholder
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    try {
      // Mock authentication logic
      // In a real app, this would be an API call
      const mockUser = { 
        email,
        displayName: email.split('@')[0],
        // Set admin flag if it's an admin email
        isAdmin: isAdminEmail
      };
      
      setUser(mockUser);
      
      // If admin, redirect to blog admin, else go to requested page or home
      if (isAdminEmail) {
        navigate('/blog-admin');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError('Login failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        <button type="submit">Login</button>
        <p>Don't have an account? <a href="/register">Register</a></p>
        
        {/* Add admin login hint */}
        <div className="login-hint">
          {/* <p>For admin access, use an email ending with @admin.com</p> */}
        </div>
      </form>
    </div>
  );
}

export default Login;