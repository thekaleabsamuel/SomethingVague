import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logoContainer}>
        <Link to="/" style={styles.logo}>Something Vague</Link>
      </div>
      
      <div style={styles.linksContainer}>
        <Link to="/" style={styles.navLink}>Home</Link>
        <Link to="/blog" style={styles.navLink}>Blog</Link>
        <Link to="/submit" style={styles.navLink}>Submit</Link>
        <Link to="/help" style={styles.navLink}>Help</Link>
      </div>

      <div style={styles.authContainer}>
        {user ? (
          <div style={styles.userSection}>
            <span style={styles.welcomeText}>Hi, {user.email.split('@')[0]}</span>
            <button onClick={handleLogout} style={styles.authButton}>Logout</button>
          </div>
        ) : (
          <div style={styles.authLinks}>
            <Link to="/login" style={styles.authLink}>Login</Link>
            <span style={styles.divider}>/</span>
            <Link to="/register" style={styles.authLink}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  linksContainer: {
    display: 'flex',
    gap: '2rem',
    flex: 1,
    justifyContent: 'center',
  },
  navLink: {
    color: '#555',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    padding: '0.5rem 0',
    position: 'relative',
  },
  authContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  welcomeText: {
    color: '#666',
    fontSize: '0.9rem',
  },
  authButton: {
    background: 'none',
    border: '1px solid #ddd',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#555',
    transition: 'all 0.2s ease',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  authLink: {
    color: '#555',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  divider: {
    color: '#ccc',
  },
};

// Hover effects (add to your CSS file or style component)
// .navLink:hover { color: #000; }
// .navLink:hover::after {
//   content: '';
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   width: 100%;
//   height: 2px;
//   background-color: #000;
// }
// .authButton:hover {
//   background: #f8f8f8;
//   border-color: #ccc;
// }

export default Navbar;