import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Load favicon from localStorage if available
const loadFavicon = () => {
  try {
    const saved = localStorage.getItem('artistPortfolioContent');
    if (saved) {
      const content = JSON.parse(saved);
      const favicon = content?.siteSettings?.favicon;
      if (favicon) {
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.type = 'image/png';
        link.rel = 'icon';
        link.href = favicon;
        document.head.appendChild(link);
      }
    }
  } catch (e) {
    console.error('Error loading favicon:', e);
  }
};

loadFavicon();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
