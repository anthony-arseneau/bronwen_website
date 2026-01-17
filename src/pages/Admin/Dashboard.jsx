import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import './Dashboard.css';

function Dashboard() {
  const { content, isAuthenticated, logout, updateContent, updateSiteSettings } = useContent();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Local state for editing
  const [settings, setSettings] = useState(content.siteSettings);
  const [about, setAbout] = useState(content.about);
  const [acknowledgements, setAcknowledgements] = useState(content.acknowledgements);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/edit');
    }
  }, [isAuthenticated, navigate]);

  const handleSave = (section) => {
    switch (section) {
      case 'settings':
        updateSiteSettings(settings);
        break;
      case 'about':
        updateContent('about', about);
        break;
      case 'acknowledgements':
        updateContent('acknowledgements', acknowledgements);
        break;
    }
    showSaveAnimation();
  };

  const showSaveAnimation = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="dashboard">
      {/* Save Success Animation */}
      <div className={`save-success ${showSaveSuccess ? 'show' : ''}`}>
        <div className="save-success-content">
          <span className="save-checkmark">✓</span>
          <span>Saved Successfully</span>
        </div>
      </div>

      <div className="dashboard-sidebar">
        <h2 className="dashboard-title">Admin Panel</h2>
        <nav className="dashboard-nav">
          <button
            className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Site Settings
          </button>
          <button
            className={`nav-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About Page
          </button>
          <Link to="/edit/gallery" className="nav-button">
            Gallery
          </Link>
          <Link to="/edit/exhibitions" className="nav-button">
            Exhibitions
          </Link>
          <button
            className={`nav-button ${activeTab === 'acknowledgements' ? 'active' : ''}`}
            onClick={() => setActiveTab('acknowledgements')}
          >
            Acknowledgements
          </button>
        </nav>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'settings' && (
          <div className="edit-section">
            <h3>Site Settings</h3>
            <div className="form-group">
              <label>Artist Name</label>
              <input
                type="text"
                value={settings.artistName}
                onChange={(e) => setSettings({ ...settings, artistName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Instagram URL</label>
              <input
                type="url"
                value={settings.instagram}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Facebook URL</label>
              <input
                type="url"
                value={settings.facebook}
                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
              />
            </div>
            <button onClick={() => handleSave('settings')} className="save-button">
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="edit-section">
            <h3>About Page</h3>
            <div className="form-group">
              <label>Profile Image URL</label>
              <input
                type="text"
                value={about.profileImage}
                onChange={(e) => setAbout({ ...about, profileImage: e.target.value })}
              />
              <small>Enter image URL or upload to public folder</small>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={about.bioTitle}
                onChange={(e) => setAbout({ ...about, bioTitle: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Bio Text</label>
              <textarea
                value={about.bioText}
                onChange={(e) => setAbout({ ...about, bioText: e.target.value })}
                rows={10}
              />
              <small>Separate paragraphs with blank lines</small>
            </div>
            <button onClick={() => handleSave('about')} className="save-button">
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'acknowledgements' && (
          <div className="edit-section">
            <h3>Acknowledgements</h3>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={acknowledgements.title}
                onChange={(e) =>
                  setAcknowledgements({ ...acknowledgements, title: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                value={acknowledgements.content}
                onChange={(e) =>
                  setAcknowledgements({ ...acknowledgements, content: e.target.value })
                }
                rows={10}
              />
              <small>Separate paragraphs with blank lines</small>
            </div>
            <button onClick={() => handleSave('acknowledgements')} className="save-button">
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
