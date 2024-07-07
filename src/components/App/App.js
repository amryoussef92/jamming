import React, { useState } from "react";
import "./App.css";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";
import Spotify from "../Util/Spotify";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);

  const addTrack = (track) => {
    if (playlistTracks.find((savedTrack) => savedTrack.id === track.id)) {
      return;
    }
    setPlaylistTracks([...playlistTracks, track]);
  };
  const removeTrack = (track) => {
    setPlaylistTracks(
      playlistTracks.filter((currentTrack) => currentTrack.id !== track.id)
    );
  };
  const updatePlaylistName = (name) => {
    setPlaylistName(name);
  };
  const savePlaylist = async () => {
    const trackUris = playlistTracks.map((track) => track.uri);
    await Spotify.savePlaylist(playlistName, trackUris);
    setPlaylistName("New Playlist");
    setPlaylistTracks([]);
  };

  const search = async (term) => {
    const results = await Spotify.search(term);
    setSearchResults(results);
  };

  return (
    <div>
      <h1>Jamming</h1>
      <div className="App">
        <SearchBar onSearch={search} />
        <div className="App-playlist">
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemove={removeTrack}
            onNameChange={updatePlaylistName}
            onSave={savePlaylist}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
