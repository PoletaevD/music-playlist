const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Подключение к базе данных SQLite
const db = new sqlite3.Database('db.sqlite');

// Создание таблиц, если они не существуют
db.serialize(() => {
  // Создание таблицы для плейлистов
  db.run(`
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
    )
  `);

  // Создание таблицы для треков
  db.run(`
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER,
      original_url TEXT,
      votes INTEGER DEFAULT 0,
      dislikes INTEGER DEFAULT 0,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id)
    )
  `);
});

// Подключение middleware для обработки JSON данных
app.use(bodyParser.json());

// Получить все плейлисты
app.get('/api/playlists', (req, res) => {
  db.all('SELECT * FROM playlists', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Получить конкретный плейлист по ID
app.get('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM playlists WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      if (row) {
        db.all('SELECT * FROM tracks WHERE playlist_id = ?', [id], (err, tracks) => {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            row.tracks = tracks;
            res.json(row);
          }
        });
      } else {
        res.status(404).json({ message: 'Плейлист не найден' });
      }
    }
  });
});

// Создать новый плейлист
app.post('/api/playlists', (req, res) => {
  const { name } = req.body;
  db.run('INSERT INTO playlists (name) VALUES (?)', [name], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID, name });
    }
  });
});

// Добавить трек в плейлист
app.post('/api/playlists/:id/tracks', (req, res) => {
  const { id } = req.params;
  const { url } = req.body;
  db.run('INSERT INTO tracks (playlist_id, original_url) VALUES (?, ?)', [id, url], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID, playlist_id: id, original_url: url });
    }
  });
});

// Удалить трек из плейлиста
app.delete('/api/playlists/:id/tracks/:trackId', (req, res) => {
  const { id, trackId } = req.params;
  db.run('DELETE FROM tracks WHERE id = ? AND playlist_id = ?', [trackId, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Трек удален' });
    }
  });
});

// Проголосовать за трек (лайк)
app.post('/api/playlists/:id/tracks/:trackId/vote', (req, res) => {
  const { id, trackId } = req.params;
  db.run('UPDATE tracks SET votes = votes + 1 WHERE id = ? AND playlist_id = ?', [trackId, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Трек оценен' });
    }
  });
});

// Проголосовать за трек (дизлайк)
app.post('/api/playlists/:id/tracks/:trackId/dislike', (req, res) => {
  const { id, trackId } = req.params;
  db.run('UPDATE tracks SET dislikes = dislikes + 1 WHERE id = ? AND playlist_id = ?', [trackId, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Трек не понравился' });
    }
  });
});

// Запуск сервера
app.listen(4000, () => {
  console.log('API на порту 4000');
});
