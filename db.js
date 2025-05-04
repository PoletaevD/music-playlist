const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к файлу базы данных
const DB_PATH = path.resolve(__dirname, 'db.sqlite');

// Создаем или открываем базу данных
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Ошибка при подключении к базе данных", err);
  } else {
    console.log("База данных подключена");
  }
});

// Создаем таблицы, если они не существуют
db.serialize(() => {
  // Таблица плейлистов
  db.run(`
    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT
    )
  `);

  // Таблица треков
  db.run(`
    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      playlist_id TEXT,
      original_url TEXT,
      votes INTEGER DEFAULT 0,
      dislikes INTEGER DEFAULT 0,
      FOREIGN KEY (playlist_id) REFERENCES playlists (id)
    )
  `);
});

// Экспортируем объект базы данных для использования в сервере
module.exports = db;
