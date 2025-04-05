import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Inline styles for consistent rendering
const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '60px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    padding: '0 20px',
    boxSizing: 'border-box',
    zIndex: 100
  },
  logoContainer: {
    marginRight: '20px',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#333',
    textDecoration: 'none'
  },
  linksContainer: {
    display: 'flex',
    gap: '20px'
  },
  navLink: {
    fontSize: '0.9rem',
    color: '#555',
    textDecoration: 'none',
  },
  adminLink: {
    color: '#f50',
    fontWeight: 'bold',
  },
  authContainer: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#555',
    textDecoration: 'none'
  },
  profileIcon: {
    fontSize: '1rem'
  },
  welcomeText: {
    fontSize: '0.85rem',
    color: '#666'
  },
  authButton: {
    background: 'none',
    border: '1px solid #ddd',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#555',
    cursor: 'pointer'
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  authLink: {
    fontSize: '0.85rem',
    color: '#555',
    textDecoration: 'none'
  },
  divider: {
    color: '#ccc'
  },
  // Mobile styles
  mobileNavbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 'auto',
    padding: '10px 15px'
  },
  mobileLinksContainer: {
    order: 3,
    width: '100%',
    marginTop: '10px',
    justifyContent: 'space-between',
    overflowX: 'auto',
    paddingBottom: '5px'
  }
};

function Navbar({ user, setUser, isAdmin }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  // Apply mobile styles when needed
  const navbarStyle = {...styles.navbar, ...(isMobile ? styles.mobileNavbar : {})};
  const linksContainerStyle = {...styles.linksContainer, ...(isMobile ? styles.mobileLinksContainer : {})};

  return (
    <nav style={navbarStyle}>
      <div style={styles.logoContainer}>
        <Link to="/" style={styles.logo}>Something Vague</Link>
      </div>
      
      <div style={linksContainerStyle}>
        <Link to="/" style={styles.navLink}>Home</Link>
        <Link to="/blog" style={styles.navLink}>Blog</Link>
        <Link to="/submit" style={styles.navLink}>Submit</Link>
        <Link to="/games" style={styles.navLink}>Games</Link>
        {isAdmin && (
          <Link to="/blog-admin" style={{...styles.navLink, ...styles.adminLink}}>Admin</Link>
        )}
      </div>

      <div style={styles.authContainer}>
        {user ? (
          <div style={styles.userSection}>
            <Link to="/profile" style={styles.profileLink}>
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  style={{width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover'}}
                />
              ) : (
                <span style={styles.profileIcon}>👤</span>
              )}
              {!isMobile && (
                <span style={styles.welcomeText}>
                  {user.displayName || user.email.split('@')[0]}
                </span>
              )}
            </Link>
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