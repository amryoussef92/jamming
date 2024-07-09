import React, { useState, useEffect } from "react";
import "./App.css";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";
import Spotify from "../Util/Spotify";
import PlaylistList from "../PlaylistList/PlaylistList";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);

  useEffect(() => {
    // Fetch user's playlists on component mount
    fetchUserPlaylists();
  }, []);

  const fetchUserPlaylists = async () => {
    const playlists = await Spotify.getUserPlaylists();
    console.log(playlists);
  };

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
    await Spotify.savePlaylist(playlistName, trackUris, playlistId);
    setPlaylistName("New Playlist");
    setPlaylistTracks([]);
    setPlaylistId(null);
  };

  const search = async (term) => {
    const results = await Spotify.search(term);
    setSearchResults(results);
  };

  const selectPlaylist = async (id) => {
    const tracks = await Spotify.getPlaylist(id);
    const selectedPlaylist = await Spotify.getUserPlaylists().then(
      (playlists) => playlists.find((playlist) => playlist.id === id)
    );
    setPlaylistId(id);
    setPlaylistName(selectedPlaylist.name);
    setPlaylistTracks(tracks);
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
          <PlaylistList onSelectPlaylist={selectPlaylist} />
        </div>
      </div>
    </div>
  );
}

export default App;
