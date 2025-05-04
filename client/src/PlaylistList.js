import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './PlaylistList.css';

function PlaylistList() {
  const [playlists, setPlaylists] = useState([]);

  const fetchPlaylists = async () => {
    const response = await axios.get('http://localhost:4000/api/playlists');
    setPlaylists(response.data);
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const createPlaylist = async () => {
    const response = await axios.post('http://localhost:4000/api/playlists', {
      name: name,
    });
    fetchPlaylists();
  };

  const [name, setName] = useState('');
  return (
    <div className="playlist-list-container">
      <h1>Мои плейлисты</h1>
      <input className="create-input" value={name} onChange={e => setName(e.target.value)} placeholder="Название плейлиста" />
      <button className="create-button" onClick={createPlaylist}>Создать плейлист</button>
      <ul>
        {playlists.map((p) => (
          <li key={p.id}>
            <Link to={`/playlist/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlaylistList;
