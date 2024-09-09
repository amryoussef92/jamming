import React from "react";
import "./PlaylistListItem.css";

const PlaylistListItem = ({ id, name, image, trackCount, onSelect }) => {
  const handleClick = () => {
    onSelect(id);
  };

  return (
    <div className="PlaylistListItem" onClick={handleClick}>
      {image && (
        <img src={image} alt={`${name} cover`} className="PlaylistImage" />
      )}
      <div className="PlaylistDetails">
        <p>{name}</p>
        <p>{trackCount} songs</p>
      </div>
    </div>
  );
};

export default PlaylistListItem;
