import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './Playlist.css';

function TrackIframe({ url, refreshKey }) {
  if (url.includes('spotify.com')) {
    const match = url.match(/track\/([A-Za-z0-9]+)/);
    if (!match) return null;
    const trackId = match[1];
    return (
      <iframe
        key={refreshKey} // 🔄 ключ для перерисовки
        src={`https://open.spotify.com/embed/track/${trackId}`}
        width="100%"
        height="90"
        frameBorder="0"
        allow="encrypted-media"
        style={{ border: 'none' }}
      ></iframe>
    );
  }

  if (url.includes('yandex.ru')) {
    const match = url.match(/album\/(\d+)\/track\/(\d+)/);
    if (!match) return null;
    const [_, albumId, trackId] = match;
    return (
      <iframe
        key={refreshKey} // 🔄 ключ для перерисовки
        frameBorder="0"
        allow="clipboard-write"
        width="100%"
        height="90"
        src={`https://music.yandex.ru/iframe/album/${albumId}/track/${trackId}`}
        style={{ border: 'none' }}
      ></iframe>
    );
  }

  return null;
}

export default function Playlist() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [trackUrl, setTrackUrl] = useState('');
  const [refreshKey, setRefreshKey] = useState(null); // ключ для перерисовки iframe

  const fetchPlaylist = async () => {
    const res = await axios.get(`/api/playlists/${id}`);
    setPlaylist(res.data);
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const addTrack = async () => {
    if (!trackUrl.trim()) return;
    await axios.post(`/api/playlists/${id}/tracks`, { url: trackUrl.trim() });
    setTrackUrl('');
    fetchPlaylist();
  };

  const deleteTrack = async (trackId) => {
    await axios.delete(`/api/playlists/${id}/tracks/${trackId}`);
    fetchPlaylist();
  };

  const vote = async (trackId, type) => {
    await axios.post(`/api/playlists/${id}/tracks/${trackId}/${type}`);
    fetchPlaylist();
  };

  const handleTrackClick = (trackId) => {
    setRefreshKey(trackId + '-' + Date.now()); // 🧠 перерисовка iframe
  };

  if (!playlist) return <p>Загрузка...</p>;

  return (
    <div className="playlist-container">
      <Link to="/" className="back-link">← Назад к списку</Link>
      <h2>{playlist.name}</h2>

      <div className="add-track">
        <input
          type="text"
          value={trackUrl}
          onChange={(e) => setTrackUrl(e.target.value)}
          placeholder="Вставьте ссылку на трек Spotify или Яндекс"
        />
        <button onClick={addTrack}>Добавить</button>
      </div>

      <ul className="track-list">
        {playlist.tracks.map((t) => (
          <li key={t.id} className="track-item">
            <div className="track-player" onClick={() => handleTrackClick(t.id)}>
              <TrackIframe url={t.original_url} refreshKey={refreshKey === null ? t.id : refreshKey} />
            </div>
            <div className="track-controls">
              <div className="control-buttons">
                <button className="control-button" onClick={() => vote(t.id, 'vote')}>👍</button>
                <button className="control-button" onClick={() => vote(t.id, 'dislike')}>👎</button>
                <button className="control-button" onClick={() => deleteTrack(t.id)}>Удалить</button>
              </div>
              <div className="vote-counts">
                {t.votes} / {t.dislikes}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
