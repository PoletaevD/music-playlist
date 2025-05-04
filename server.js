const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

// Создание приложения Express
const app = express();

// Настройка CORS
app.use(cors());

// Парсинг JSON тела запроса
app.use(express.json());

// Настройка подключения к базе данных PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Получение всех плейлистов
app.get('/api/playlists', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM playlists');
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении плейлистов:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение конкретного плейлиста по ID
app.get('/api/playlists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const playlistResult = await pool.query('SELECT * FROM playlists WHERE id = $1', [id]);
    const tracksResult = await pool.query('SELECT * FROM tracks WHERE playlist_id = $1', [id]);

    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Плейлист не найден' });
    }

    const playlist = playlistResult.rows[0];
    const tracks = tracksResult.rows;

    res.json({ ...playlist, tracks });
  } catch (err) {
    console.error('Ошибка при получении плейлиста:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создание нового плейлиста
app.post('/api/playlists', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO playlists (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при создании плейлиста:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавление трека в плейлист
app.post('/api/playlists/:id/tracks', async (req, res) => {
  const { id } = req.params;
  const { url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tracks (playlist_id, original_url) VALUES ($1, $2) RETURNING *',
      [id, url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении трека:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление трека из плейлиста
app.delete('/api/playlists/:playlistId/tracks/:trackId', async (req, res) => {
  const { playlistId, trackId } = req.params;
  try {
    await pool.query('DELETE FROM tracks WHERE id = $1 AND playlist_id = $2', [trackId, playlistId]);
    res.status(204).send();
  } catch (err) {
    console.error('Ошибка при удалении трека:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Голосование за трек (лайк/дизлайк)
app.post('/api/playlists/:playlistId/tracks/:trackId/:type', async (req, res) => {
  const { playlistId, trackId, type } = req.params;
  if (type !== 'vote' && type !== 'dislike') {
    return res.status(400).json({ error: 'Неверный тип голосования' });
  }

  const column = type === 'vote' ? 'votes' : 'dislikes';

  try {
    const result = await pool.query(
      `UPDATE tracks SET ${column} = ${column} + 1 WHERE id = $1 AND playlist_id = $2 RETURNING *`,
      [trackId, playlistId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при голосовании:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Запуск сервера
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Сервер работает на порту ${port}`);
});
