import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Something Vague</h1>
        <p style={styles.subtitle}>Discover amazing music from around the world</p>
        
        <div style={styles.ctaContainer}>
          <Link to="/player" style={styles.primaryButton}>
            Listen Now
          </Link>
          <Link to="/submit" style={styles.secondaryButton}>
            Submit Your Music
          </Link>
        </div>
      </div>

      <div style={styles.features}>
        <div style={styles.featureCard}>
          <h3 style={styles.featureTitle}>Curated Selection</h3>
          <p style={styles.featureText}>Handpicked tracks from emerging artists worldwide</p>
        </div>
        <div style={styles.featureCard}>
          <h3 style={styles.featureTitle}>24/7 Streaming</h3>
          <p style={styles.featureText}>Continuous playback with no interruptions</p>
        </div>
        <div style={styles.featureCard}>
          <h3 style={styles.featureTitle}>Artist Focused</h3>
          <p style={styles.featureText}>Supporting independent creators directly</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    padding: '0 2rem',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '6rem 0 4rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#333',
    marginBottom: '1rem',
    letterSpacing: '-0.05em',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#666',
    marginBottom: '3rem',
    lineHeight: '1.6',
    maxWidth: '600px',
  },
  ctaContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  primaryButton: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '0.8rem 2rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#000',
    padding: '0.8rem 2rem',
    borderRadius: '4px',
    border: '1px solid #000',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    padding: '4rem 0',
    flexWrap: 'wrap',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    flex: '1',
    minWidth: '250px',
    maxWidth: '350px',
    padding: '2rem',
    border: '1px solid #eee',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1rem',
  },
  featureText: {
    color: '#666',
    lineHeight: '1.6',
  },
};

// Add these hover effects to your CSS:
// .primaryButton:hover {
//   background-color: #333;
//   transform: translateY(-2px);
// }
// .secondaryButton:hover {
//   background-color: #f8f8f8;
//   transform: translateY(-2px);
// }
// .featureCard:hover {
//   transform: translateY(-5px);
//   box-shadow: 0 10px 20px rgba(0,0,0,0.05);
// }

export default Home;