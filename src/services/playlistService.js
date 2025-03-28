// src/services/playlistService.js

const playlistService = (() => {
    let playlist = [
      {
        id: 1,
        title: "fukdafrailshi",
        artist: "Chico Mcgee",
        url: "public/tracks/fukdafrailshii .wav", // Local file path
        artwork: "public/artwork/artwork.PNG",
      },
      {
        id: 2,
        title: "Benjaminz",
        artist: "Chico Mcgee",
        url: "public/tracks/benzjamins ROUGH - MASTER.mp3",
        artwork: "/public/artwork/IMG_5336.jpeg",
      },
    ];
  
    return {
      getPlaylist: () => playlist,
  
      addTrack: (track) => {
        track.id = playlist.length ? playlist[playlist.length - 1].id + 1 : 1;
        playlist.push(track);
      },
  
      removeTrack: (id) => {
        playlist = playlist.filter((track) => track.id !== id);
      },
  
      getTrackById: (id) => {
        return playlist.find((track) => track.id === id);
      },
    };
  })();
  
  export default playlistService;
  