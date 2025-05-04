import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './App.css';
import axios from 'axios';

// все axios‑запросы по относительному пути "/api/..." будут уходить на порт 4000
axios.defaults.baseURL = process.env.REACT_APP_API_URL;


const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Корневой элемент #root не найден');
}
