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

const saveToFile = process.argv.includes('--save');
const dataDir = path.join(__dirname, 'data');

app.get('/login', (req, res) => {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    try {
        const code = req.query.code || null;
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
        const playlists = await getPlaylists(accessToken);
        playlists.forEach(playlist => {
            console.log(`Name: ${playlist.name}, ID: ${playlist.id}`);
        });

        if (saveToFile) {
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = path.join(dataDir, `playlists-${timestamp}.json`);
            fs.writeFileSync(filename, JSON.stringify(playlists, null, 2));
            console.log(`Playlists saved to ${filename}`);
            res.send(`Playlists saved to ${filename}`);
        } else {
            res.send(`<pre>${JSON.stringify(playlists.map(playlist => ({ Name: playlist.name, ID: playlist.id })), null, 2)}</pre>`);
        }
    } catch (error) {
        console.error('Error retrieving playlists:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function getPlaylists(accessToken) {
    try {
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        return response.data.items;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        throw error;
    }
}

app.listen(8888, () => {
    console.log('Server is running on http://localhost:8888');
    console.log('Open http://localhost:8888/login to authenticate');
});
