const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

let playlists = [];

// Загрузка данных из файла при старте
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE);
    playlists = JSON.parse(raw);
  }
}

// Сохранение данных в файл
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(playlists, null, 2));
}

loadData();

// Получить все плейлисты
app.get('/api/playlists', (req, res) => {
  res.json(playlists);
});

// Создать новый плейлист
app.post('/api/playlists', (req, res) => {
  const newPlaylist = {
    id: Date.now().toString(),
    name: req.body.name || 'Без названия',
    tracks: [],
  };
  playlists.push(newPlaylist);
  saveData();
  res.json(newPlaylist);
});

// Получить конкретный плейлист
app.get('/api/playlists/:id', (req, res) => {
  const playlist = playlists.find(p => p.id === req.params.id);
  if (!playlist) return res.status(404).send('Not found');
  res.json(playlist);
});

// Добавить трек в плейлист
app.post('/api/playlists/:id/tracks', (req, res) => {
  const playlist = playlists.find(p => p.id === req.params.id);
  if (!playlist) return res.status(404).send('Not found');
  const newTrack = {
    id: Date.now().toString(),
    original_url: req.body.url,
    votes: 0,
    dislikes: 0,
  };
  playlist.tracks.push(newTrack);
  saveData();
  res.json(newTrack);
});

// Удалить трек из плейлиста
app.delete('/api/playlists/:id/tracks/:trackId', (req, res) => {
  const playlist = playlists.find(p => p.id === req.params.id);
  if (!playlist) return res.status(404).send('Not found');
  const trackIndex = playlist.tracks.findIndex(t => t.id === req.params.trackId);
  if (trackIndex === -1) return res.status(404).send('Track not found');
  playlist.tracks.splice(trackIndex, 1);
  saveData();
  res.sendStatus(200);
});

// Лайк треку
app.post('/api/playlists/:id/tracks/:trackId/vote', (req, res) => {
  const playlist = playlists.find(p => p.id === req.params.id);
  const track = playlist?.tracks.find(t => t.id === req.params.trackId);
  if (!track) return res.status(404).send('Not found');
  track.votes += 1;
  saveData();
  res.sendStatus(200);
});

// Дизлайк треку
app.post('/api/playlists/:id/tracks/:trackId/dislike', (req, res) => {
  const playlist = playlists.find(p => p.id === req.params.id);
  const track = playlist?.tracks.find(t => t.id === req.params.trackId);
  if (!track) return res.status(404).send('Not found');
  track.dislikes += 1;
  saveData();
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`API на порту ${PORT}`);
});
