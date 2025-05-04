import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PlaylistList from './PlaylistList';
import Playlist from './Playlist';
import NewPlaylist from './NewPlaylist';

function App() {
  return (
    <BrowserRouter>
      <NewPlaylist />
      <Routes>
        <Route path="/" element={<PlaylistList />} />
        <Route path="/playlist/:id" element={<Playlist />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
