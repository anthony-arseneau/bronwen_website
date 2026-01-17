import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import { useContent } from '../../contexts/ContentContext';
import './EditorPages.css';

function HomeEditor() {
  const { content, isAuthenticated, updateContent, updateSiteSettings } = useContent();
  const navigate = useNavigate();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [home, setHome] = useState(content.home || {});
  const [artistName, setArtistName] = useState(content.siteSettings.artistName);
  const [favicon, setFavicon] = useState(content.siteSettings.favicon || '');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/edit');
    }
  }, [isAuthenticated, navigate]);

  // Update favicon in document when it changes
  useEffect(() => {
    if (favicon) {
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = favicon;
      document.head.appendChild(link);
    }
  }, [favicon]);

  const showSaveAnimation = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleSave = () => {
    updateContent('home', home);
    updateSiteSettings({ artistName, favicon });
    showSaveAnimation();
  };

  const colorPresets = [
    { name: 'Pale Beige', value: '#f5f0e8' },
    { name: 'Warm White', value: '#faf8f5' },
    { name: 'Cool White', value: '#f8f9fa' },
    { name: 'Soft Gray', value: '#f0f0f0' },
    { name: 'Light Cream', value: '#fffef5' },
    { name: 'Blush', value: '#fdf2f0' },
  ];

  if (!isAuthenticated) return null;

  return (
    <AdminLayout showSaveSuccess={showSaveSuccess}>
      <div className="editor-page">
        <h2 className="editor-title">Home Page</h2>

        <div className="editor-section">
          <h3>Site Identity</h3>
          <div className="form-group">
            <label>Artist Name (appears in navbar)</label>
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Your Name"
            />
          </div>
          <div className="form-group">
            <label>Browser Tab Icon (Favicon)</label>
            <p className="section-hint">Upload a square image (512×512 recommended)</p>
            <div className="favicon-upload-container">
              <ImageUpload
                onUpload={(url) => setFavicon(url)}
                currentImage={favicon}
                label=""
              />
              {favicon && (
                <div className="favicon-preview">
                  <span>Preview:</span>
                  <img src={favicon} alt="Favicon preview" className="favicon-preview-img" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="editor-section">
          <h3>Hero Section</h3>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={home.title || ''}
              onChange={(e) => setHome({ ...home, title: e.target.value })}
              placeholder="Main heading"
            />
          </div>
          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              value={home.subtitle || ''}
              onChange={(e) => setHome({ ...home, subtitle: e.target.value })}
              placeholder="Tagline or description"
            />
          </div>
          <div className="form-group">
            <label>Button Text</label>
            <input
              type="text"
              value={home.ctaText || ''}
              onChange={(e) => setHome({ ...home, ctaText: e.target.value })}
              placeholder="View Work"
            />
          </div>
        </div>

        <div className="editor-section">
          <h3>Background</h3>
          <div className="form-group">
            <label>Background Color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={home.backgroundColor || '#f5f0e8'}
                onChange={(e) => setHome({ ...home, backgroundColor: e.target.value })}
                className="color-input"
              />
              <input
                type="text"
                value={home.backgroundColor || '#f5f0e8'}
                onChange={(e) => setHome({ ...home, backgroundColor: e.target.value })}
                className="color-text-input"
                placeholder="#f5f0e8"
              />
            </div>
            <div className="color-presets">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  className={`color-preset ${home.backgroundColor === preset.value ? 'active' : ''}`}
                  style={{ backgroundColor: preset.value }}
                  onClick={() => setHome({ ...home, backgroundColor: preset.value })}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Background Image (optional)</label>
            <p className="section-hint">This image will appear faded behind the hero text</p>
            <ImageUpload
              onUpload={(url) => setHome({ ...home, backgroundImage: url })}
              currentImage={home.backgroundImage}
              label=""
            />
          </div>
        </div>

        <button onClick={handleSave} className="save-button">
          Save Changes
        </button>
      </div>
    </AdminLayout>
  );
}

export default HomeEditor;
