const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = 'http://localhost:8888/callback';
const scopes = 'user-library-read';

const express = require('express');
const app = express();

const saveToFile = process.argv.includes('--save');

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
        const likedSongs = await getAllLikedSongs(accessToken);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const dataDir = path.join(__dirname, 'data');
        const filename = path.join(dataDir, `likedSongs-${timestamp}.json`);

        if (saveToFile) {
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }
            fs.writeFileSync(filename, JSON.stringify(likedSongs, null, 2));
            const songCount = likedSongs.length;
            console.log(`Liked songs saved to ${filename}. Total songs: ${songCount}`);
            res.send(`Liked songs saved to ${filename}. Total songs: ${songCount}`);
        } else {
            res.send(`<pre>${JSON.stringify(likedSongs.map(song => ({ Artist: song.track.artists.map(artist => artist.name).join(', '), Title: song.track.name })), null, 2)}</pre>`);
        }
    } catch (error) {
        console.error('Error retrieving liked songs:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function getAllLikedSongs(accessToken) {
    let allSongs = [];
    let url = `https://api.spotify.com/v1/me/tracks`;
    while (url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
            allSongs = allSongs.concat(response.data.items);
            url = response.data.next; // URL for the next page of results
        } catch (error) {
            console.error('Error fetching liked songs:', error);
            break;
        }
    }
    return allSongs;
}

app.listen(8888, () => {
    console.log('Server is running on http://localhost:8888');
    console.log('Open http://localhost:8888/login to authenticate');
});
