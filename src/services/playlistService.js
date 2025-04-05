// src/services/playlistService.js

const playlistService = (() => {
    let playlist = [
      {
        id: 1,
        title: "fukdafrailshi",
        artist: "Chico Mcgee",
        url: "/tracks/fukdafrailshii .wav", // Use root-relative path with leading slash
        artwork: "/artwork/artwork.PNG",
      },
      {
        id: 2,
        title: "Benjaminz",
        artist: "Chico Mcgee",
        url: "/tracks/benzjamins ROUGH - MASTER.mp3",
        artwork: "/artwork/IMG_5336.jpeg",
      },
      {
        id: 3,
        title: "Track 3",
        artist: "Something Vague",
        url: "/tracks/track3.mp3",
        artwork: "/artwork/cover3.jpg",
      },
      {
        id: 4,
        title: "Track 2",
        artist: "Something Vague",
        url: "/tracks/track2.mp3",
        artwork: "/artwork/cover2.jpg",
      },
      {
        id: 5,
        title: "Track 1",
        artist: "Chico Mcgee",
        url: "/tracks/track1.mp3",
        artwork: "/artwork/cover1.jpg",
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
  