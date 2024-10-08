import React, { useState, useEffect } from "react";
import Spotify from "../Util/Spotify";
import PlaylistListItem from "../PlaylistListItem/PlaylistListItem";
import "./PlaylistList.css";

const PlaylistList = ({ onSelectPlaylist }) => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const userPlaylists = await Spotify.getUserPlaylists();
      setPlaylists(userPlaylists);
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="PlaylistList">
      {playlists.map((playlist) => (
        <PlaylistListItem
          key={playlist.id}
          id={playlist.id}
          name={playlist.name}
          image={playlist.images[0]?.url} // Get the first image if available
          trackCount={playlist.tracks.total}
          onSelect={onSelectPlaylist}
        />
      ))}
    </div>
  );
};

export default PlaylistList;
