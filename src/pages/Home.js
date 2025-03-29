import React from 'react';
import { Link } from 'react-router-dom';

// --- STEP 1: Define the @font-face rule as a CSS string ---
// Make sure the path '/fonts/Daydream.ttf' is correct relative to your public folder
const fontFaceStyles = `
  @font-face {
    font-family: 'Daydream';
    src: url('/fonts/Daydream.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;
// --- End of CSS String ---

function Home() {
  return (
    // --- STEP 2: Use a Fragment to wrap style and content ---
    <>
      {/* --- STEP 3: Inject the @font-face rule --- */}
      <style dangerouslySetInnerHTML={{ __html: fontFaceStyles }} />

      {/* Your existing component structure */}
      <div style={styles.container}>
        <div style={styles.hero}>
          {/* The title style is updated below in the styles object */}
          <h1 style={styles.title}>Something Vague</h1>
          <p style={styles.subtitle}>Hear something new</p>

          {/* Commented out sections remain */}
          {/* <div style={styles.ctaContainer}> ... </div> */}
          {/* <div style={styles.nowPlaying}> ... </div> */}
        </div>
      </div>
    </> // --- End of Fragment ---
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    minHeight: '10vh',
    padding: '0 2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    // --- STEP 4: Apply the custom font using fontFamily ---
    fontFamily: "'Daydream', sans-serif", // Use the defined name, add fallback
    fontSize: '3rem', // Adjust size as needed for the new font
    fontWeight: 'normal', // Often needed for custom fonts (instead of '300')
    color: '#333',
    marginBottom: '0.5rem',
    letterSpacing: '1px',
  },
  subtitle: {
    fontFamily: "'Daydream', sans-serif", // Use the defined name, add fallback
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '3rem',
    lineHeight: '1.6',
    fontWeight: '300',
  },
  // ... (rest of your styles object remains the same)
  ctaContainer: {
    margin: '2rem 0 3rem',
  },
  primaryButton: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '1rem 3rem',
    borderRadius: '0',
    textDecoration: 'none',
    fontWeight: '400',
    letterSpacing: '1px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    display: 'inline-block',
  },
  nowPlaying: {
    marginTop: '3rem',
    padding: '1.5rem 2rem',
    borderTop: '1px solid #eee',
    borderBottom: '1px solid #eee',
  },
  nowPlayingText: {
    color: '#999',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    letterSpacing: '1px',
  },
  currentTrack: {
    fontSize: '1.2rem',
    fontWeight: '400',
    color: '#333',
    margin: '0 0 0.25rem 0',
  },
  genre: {
    color: '#999',
    fontSize: '0.9rem',
    margin: 0,
    fontStyle: 'italic',
  },
};


export default Home;