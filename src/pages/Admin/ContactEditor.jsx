import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useContent } from '../../contexts/ContentContext';
import './EditorPages.css';

function ContactEditor() {
  const { content, isAuthenticated, updateContent } = useContent();
  const navigate = useNavigate();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [contact, setContact] = useState(content.contact);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/edit');
    }
  }, [isAuthenticated, navigate]);

  const showSaveAnimation = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleSave = () => {
    updateContent('contact', contact);
    showSaveAnimation();
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout showSaveSuccess={showSaveSuccess}>
      <div className="editor-page">
        <h2 className="editor-title">Contact Information</h2>

        <div className="editor-section">
          <h3>Basic Contact</h3>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="editor-section">
          <h3>Social Media</h3>
          <div className="form-group">
            <label>Instagram URL</label>
            <input
              type="url"
              value={contact.instagram}
              onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
              placeholder="https://instagram.com/username"
            />
          </div>
          <div className="form-group">
            <label>Facebook URL</label>
            <input
              type="url"
              value={contact.facebook}
              onChange={(e) => setContact({ ...contact, facebook: e.target.value })}
              placeholder="https://facebook.com/username"
            />
          </div>
          <div className="form-group">
            <label>Twitter / X URL</label>
            <input
              type="url"
              value={contact.twitter}
              onChange={(e) => setContact({ ...contact, twitter: e.target.value })}
              placeholder="https://twitter.com/username"
            />
          </div>
          <div className="form-group">
            <label>LinkedIn URL</label>
            <input
              type="url"
              value={contact.linkedin}
              onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <div className="editor-section">
          <h3>Location</h3>
          <div className="form-group">
            <label>Location Name</label>
            <input
              type="text"
              value={contact.locationName}
              onChange={(e) => setContact({ ...contact, locationName: e.target.value })}
              placeholder="City, Country"
            />
          </div>
          <div className="form-group">
            <label>Google Maps Link (optional)</label>
            <input
              type="url"
              value={contact.locationUrl}
              onChange={(e) => setContact({ ...contact, locationUrl: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
            <small>Add a Google Maps or other map link for your location</small>
          </div>
        </div>

        <button onClick={handleSave} className="save-button">
          Save Changes
        </button>
      </div>
    </AdminLayout>
  );
}

export default ContactEditor;
