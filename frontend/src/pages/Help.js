// src/pages/Games.js
import React, { useState } from 'react';
import '../styles/Games.css';

// Sample game data - would be moved to a service in a real implementation
const sampleGames = [
  {
    id: 1,
    title: "Pixel Runner",
    creator: "Admin",
    description: "A fast-paced pixelated runner game where you dodge obstacles and collect coins.",
    thumbnail: "https://placehold.co/300x200/333/FFF?text=Pixel+Runner",
    url: "/games/pixel-runner"
  },
  {
    id: 2,
    title: "Beat Match",
    creator: "Chico Mcgee",
    description: "Match the beats to the music in this rhythm game. Features tracks from our station!",
    thumbnail: "https://placehold.co/300x200/503/FFF?text=Beat+Match",
    url: "/games/beat-match"
  },
  {
    id: 3,
    title: "Music Quiz",
    creator: "Admin",
    description: "Test your music knowledge with this trivia game about artists and songs.",
    thumbnail: "https://placehold.co/300x200/305/FFF?text=Music+Quiz",
    url: "/games/music-quiz"
  },
  {
    id: 4,
    title: "Synth Puzzle",
    creator: "Something Vague",
    description: "Solve puzzles by creating the right sound patterns with virtual synthesizers.",
    thumbnail: "https://placehold.co/300x200/530/FFF?text=Synth+Puzzle",
    url: "/games/synth-puzzle"
  }
];

function Games() {
  const [selectedGame, setSelectedGame] = useState(null);

  const handlePlayGame = (game) => {
    setSelectedGame(game);
    // In a real implementation, this would load the game in an iframe or redirect
    console.log(`Loading game: ${game.title}`);
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
  };

  return (
    <div className="games-page">
      {selectedGame ? (
        // Game player view
        <div className="game-player">
          <div className="game-player-header">
            <button className="back-button" onClick={handleBackToGames}>← Back to Games</button>
            <h2>{selectedGame.title}</h2>
            <p>Created by: {selectedGame.creator}</p>
          </div>
          
          <div className="game-container">
            {/* This would be an iframe or canvas element in a real implementation */}
            <div className="game-placeholder">
              <img src={selectedGame.thumbnail} alt={selectedGame.title} />
              <p>Game would load here. This is just a placeholder.</p>
            </div>
          </div>
          
          <div className="game-description">
            <p>{selectedGame.description}</p>
            <p className="game-controls">
              <strong>Controls:</strong> Use arrow keys or WASD to move, spacebar to jump/interact.
            </p>
          </div>
        </div>
      ) : (
        // Games catalog view
        <>
          <div className="games-header">
            <h1>Browser Games</h1>
            <p>Play these pixel-perfect games created by our admin team and featured artists!</p>
          </div>
          
          <div className="games-grid">
            {sampleGames.map(game => (
              <div className="game-card" key={game.id}>
                <div className="game-thumbnail">
                  <img src={game.thumbnail} alt={game.title} />
                </div>
                <div className="game-info">
                  <h3>{game.title}</h3>
                  <p className="game-creator">by {game.creator}</p>
                  <p className="game-description">{game.description}</p>
                  <button 
                    className="play-button" 
                    onClick={() => handlePlayGame(game)}
                  >
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="games-footer">
            <p>Are you an artist who wants to submit a game? <a href="/submit">Contact us!</a></p>
          </div>
        </>
      )}
    </div>
  );
}

export default Games;