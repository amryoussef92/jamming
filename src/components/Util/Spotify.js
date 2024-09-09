const clientId = "c2c3ff3884114bd48ba3d0dd1b3382c0"; // Replace with your client ID
const redirectUri = "https://jammingwithabsaleka.netlify.app/"; // Your redirect URI
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
      console.log("Access Token obtained:", accessToken);
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      console.log("Redirecting to Spotify for authentication:", accessUrl);
      window.location = accessUrl;
    }
  },

  async getCurrentUserId() {
    if (userId) {
      return userId;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user ID");
      }
      const jsonResponse = await response.json();
      userId = jsonResponse.id;
      return userId;
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  },

  async getUserPlaylists() {
    const userId = await Spotify.getCurrentUserId();
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        { headers }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user playlists");
      }
      const jsonResponse = await response.json();

      if (!jsonResponse.items) {
        return [];
      }

      return jsonResponse.items.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        images: playlist.images, // Return playlist images
        tracks: playlist.tracks,
      }));
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  },

  async savePlaylist(name, trackUris, id = null) {
    if (!name || !trackUris.length) {
      console.warn("No playlist name or tracks provided");
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
    try {
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
        await fetch(
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
        if (!createPlaylistResponse.ok) {
          throw new Error("Failed to create playlist");
        }
        const createPlaylistJsonResponse = await createPlaylistResponse.json();
        const playlistId = createPlaylistJsonResponse.id;

        await fetch(
          `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
          {
            headers,
            method: "POST",
            body: JSON.stringify({ uris: trackUris }),
          }
        );
      }
    } catch (error) {
      console.error("Error saving playlist:", error);
    }
  },
  async getPlaylist(id) {
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const userId = await Spotify.getCurrentUserId();
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists/${id}/tracks`,
        { headers }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch playlist");
      }
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
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
    }
  },

  async search(term) {
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?type=track&q=${term}`,
        { headers }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
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
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  },
};

export default Spotify;
