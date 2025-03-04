# Spotify Data Retrieval

This project provides a set of Node.js scripts to interact with the Spotify API. The scripts allow you to retrieve your liked songs, playlists, and tracks within a playlist. The data can be displayed in the browser or saved to JSON files for further analysis.  Note this tool does NOT retrieve actual audio files, just playlist data.

## Why It's Useful

- **Liked Songs**: Retrieve and display all your liked songs.
- **Playlists**: Retrieve and display all your playlists.
- **Playlist Tracks**: Retrieve and display all tracks within a specific playlist.
- **Data Storage**: Optionally save the retrieved data to JSON files for further analysis or backup.

## Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/pocketcalculator/spotify-data-retrieval.git
cd spotify-data-retrieval
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add your Spotify client ID and client secret:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

### 4. Create Data Directory (Optional)

Create the `data` directory in your project root:

```sh
mkdir data
```

### 5. Usage Instructions

#### Default (index.js)

Retrieve and display all your liked songs in the browser.

```sh
node index.js
```

Open the URL `http://localhost:8888/login` in your browser to authenticate with Spotify. After authentication, the liked songs will be displayed in the browser.

#### Get Playlists (getPlaylists.js)

Retrieve and display all your playlists. Optionally save the playlists to a JSON file.

```sh
node getPlaylists.js [--save]
```

Open the URL `http://localhost:8888/login` in your browser to authenticate with Spotify. After authentication, the playlists and their IDs will be displayed in the browser. If the `--save` option is provided, the playlists and playlist IDs will be saved to a JSON file in the `data` directory.

#### Get Playlist Tracks (getPlaylistTracks.js)

Retrieve and display all tracks within a specific playlist. Optionally save the tracks to a JSON file.

```sh
node getPlaylistTracks.js <playlist_id> [--save]
```

Replace `<playlist_id>` with the ID of the playlist you want to retrieve tracks from. Open the URL `http://localhost:8888/login` in your browser to authenticate with Spotify. After authentication, the tracks will be displayed in the browser. If the `--save` option is provided, the tracks will be saved to a JSON file in the `data` directory.

#### Liked Songs (likedSongs.js)

Retrieve and display all your liked songs. Optionally save the liked songs to a JSON file.

```sh
node likedSongs.js [--save]
```

Open the URL `http://localhost:8888/login` in your browser to authenticate with Spotify. After authentication, the liked songs will be displayed in the browser.  If the `--save` option is provided, the tracks will be saved to a JSON file in the `data` directory.

## License

This project is licensed under the MIT License.
