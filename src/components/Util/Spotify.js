const clientId = "c2c3ff3884114bd48ba3d0dd1b3382c0"; // Replace with your client ID
const redirectUri = "http://localhost:3000"; // Your redirect URI
let accessToken;
let userId;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
    }
  },

  async getCurrentUserId() {
    if (userId) {
      return Promise.resolve(userId);
    }

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    const response = await fetch("https://api.spotify.com/v1/me", { headers });
    const jsonResponse = await response.json();
    userId = jsonResponse.id;
    return userId;
  },

  async getUserPlaylists() {
    const userId = await Spotify.getCurrentUserId();
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      { headers }
    );
    const jsonResponse = await response.json();

    if (!jsonResponse.items) {
      return [];
    }

    return jsonResponse.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
    }));
  },

  async savePlaylist(name, trackUris, id = null) {
    if (!name || !trackUris.length) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
    const userId = await Spotify.getCurrentUserId();

    if (id) {
      // Update existing playlist name
      await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists/${id}`,
        {
          headers,
          method: "PUT",
          body: JSON.stringify({ name }),
        }
      );

      // Update playlist tracks
      return fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists/${id}/tracks`,
        {
          headers,
          method: "PUT",
          body: JSON.stringify({ uris: trackUris }),
        }
      );
    } else {
      // Create new playlist
      const createPlaylistResponse = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          headers,
          method: "POST",
          body: JSON.stringify({ name }),
        }
      );
      const createPlaylistJsonResponse = await createPlaylistResponse.json();
      const playlistId = createPlaylistJsonResponse.id;

      return fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
        {
          headers,
          method: "POST",
          body: JSON.stringify({ uris: trackUris }),
        }
      );
    }
  },

  async getPlaylist(id) {
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const userId = await Spotify.getCurrentUserId();

    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists/${id}/tracks`,
      { headers }
    );
    const jsonResponse = await response.json();

    if (!jsonResponse.items) {
      return [];
    }

    return jsonResponse.items.map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      uri: item.track.uri,
    }));
  },

  async search(term) {
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${term}`,
      { headers }
    );
    const jsonResponse = await response.json();

    if (!jsonResponse.tracks) {
      return [];
    }

    return jsonResponse.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      uri: track.uri,
    }));
  },
};

export default Spotify;
