import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth.css';

function Register({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Clear any previous errors
    setError('');
    
    try {
      const response = await fetch('http://localhost:5001/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set the user in the app state
      setUser({
        ...data.user,
        isAdmin: data.user.role === 'ADMIN'
      });
      
      navigate('/profile');
    } catch (err) {
      setError('Registration failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleRegister}>
        <h2>Register</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <input 
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
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
        
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required 
        />
        
        <button type="submit">Register</button>
        <p>Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
}

export default Register;