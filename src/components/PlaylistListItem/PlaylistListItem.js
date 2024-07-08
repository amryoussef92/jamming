import React from "react";
import "./PlaylistListItem.css";

const PlaylistListItem = ({ id, name, onSelect }) => {
  const handleClick = () => {
    onSelect(id);
  };

  return (
    <div className="PlaylistListItem" onClick={handleClick}>
      <p>{name}</p>
    </div>
  );
};

export default PlaylistListItem;
