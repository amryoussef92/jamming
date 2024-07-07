const clientId = "c2c3ff3884114bd48ba3d0dd1b3382c0"; // Replace with your client ID
const redirectUri = "http://localhost:3000"; // Your redirect URI
let accessToken;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    // Check for access token match in URL
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);

      // Clear the access token after it expires
      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
    }
  },

  async search(term) {
    const accessToken = Spotify.getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${term}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
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

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    let userId;

    const response = await fetch("https://api.spotify.com/v1/me", { headers });
    const jsonResponse = await response.json();
    userId = jsonResponse.id;

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
  },
};

export default Spotify;
