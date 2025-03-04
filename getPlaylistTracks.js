const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = 'http://localhost:8888/callback';
const scopes = 'playlist-read-private';

const express = require('express');
const app = express();

const playlistId = process.argv[2];
const saveToFile = process.argv.includes('--save');

if (!playlistId) {
    console.error('Please provide a playlist ID as a command line argument.');
    process.exit(1);
}

app.get('/login', (req, res) => {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${playlistId}`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    try {
        const code = req.query.code || null;
        const playlistId = req.query.state || null;
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const accessToken = response.data.access_token;
        const playlistTracks = await getAllPlaylistTracks(accessToken, playlistId);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const dataDir = path.join(__dirname, 'data');
        const filename = path.join(dataDir, `${playlistId}-${timestamp}.json`);

        if (saveToFile) {
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }
            fs.writeFileSync(filename, JSON.stringify(playlistTracks, null, 2));
            const trackCount = playlistTracks.length;
            console.log(`Tracks saved to ${filename}. Total tracks: ${trackCount}`);
            res.send(`Tracks saved to ${filename}. Total tracks: ${trackCount}`);
        } else {
            res.send(`<pre>${JSON.stringify(playlistTracks.map(track => ({ Artist: track.track.artists.map(artist => artist.name).join(', '), Title: track.track.name })), null, 2)}</pre>`);
        }
    } catch (error) {
        console.error('Error retrieving playlist tracks:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function getAllPlaylistTracks(accessToken, playlistId) {
    let allTracks = [];
    let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    while (url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
            allTracks = allTracks.concat(response.data.items);
            url = response.data.next; // URL for the next page of results
        } catch (error) {
            console.error('Error fetching playlist tracks:', error);
            break;
        }
    }
    return allTracks;
}

app.listen(8888, () => {
    console.log('Server is running on http://localhost:8888');
    console.log('Open http://localhost:8888/login to authenticate');
});
