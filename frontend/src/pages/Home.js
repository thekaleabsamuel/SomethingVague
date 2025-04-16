import React from 'react';
// import { Link } from 'react-router-dom'; // No longer needed
import Player from '../components/Player'; // Import the Player component

const fontFaceStyles = `
  @font-face {
    font-family: 'Daydream';
    src: url('/fonts/Daydream.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: fontFaceStyles }} />

      {/* Main container - transparent, allows body background through */}
      <div style={styles.container}>

        {/* Header Section */}
        <div style={styles.hero}>
          <h1 style={styles.title}>Something Vague</h1>
          <p style={styles.subtitle}>Hear something new</p>
        </div>

     

      </div>
    </>
  );
}

const styles = {
  container: {
    // REMOVED backgroundColor
    minHeight: '10vh', // Full viewport height
    width: '100%', // Full width
    padding: '40px 20px', // Add padding for spacing from edges
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center header and player horizontally
    justifyContent: 'flex-start', // Align items to the top, add gap later if needed
    // Or use 'center' if vertical centering is desired
    // Or 'space-around'/'space-evenly'
    gap: '2rem', // Add space between header and player
  },
  hero: { // Styles for the header section container
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    maxWidth: '600px', // Keep max width if desired
    width: '100%', // Occupy available width within alignment constraints
    // marginBottom: '2rem', // Add space below hero if not using gap on container
    color: '#ffffff', // Default text color for hero
  },
  title: {
    fontFamily: "'Daydream', sans-serif",
    fontSize: '2rem',
    fontWeight: 'normal',
    color: '#dddddd', // Light grey/white text
    marginBottom: '0.5rem',
    letterSpacing: '1px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.6)', // Text shadow for contrast
  },
  subtitle: {
    fontFamily: "'Daydream', sans-serif",
    fontSize: '1rem',
    color: '#dddddd', // Light grey/white text
    marginBottom: '0', // Remove bottom margin if container handles spacing
    lineHeight: '1.6',
    fontWeight: '300',
    textShadow: '1px 1px 3px rgba(0,0,0,0.6)', // Text shadow
  },
  // REMOVE unused styles: ctaContainer, primaryButton, nowPlaying, etc.
};

export default Home;