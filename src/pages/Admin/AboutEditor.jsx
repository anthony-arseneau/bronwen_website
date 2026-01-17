import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import { useContent } from '../../contexts/ContentContext';
import './EditorPages.css';

function AboutEditor() {
  const { content, isAuthenticated, updateContent } = useContent();
  const navigate = useNavigate();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [about, setAbout] = useState(content.about);

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
    updateContent('about', about);
    showSaveAnimation();
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout showSaveSuccess={showSaveSuccess}>
      <div className="editor-page">
        <h2 className="editor-title">About Page</h2>

        <div className="editor-section">
          <h3>Profile Image</h3>
          <div className="profile-upload-container">
            <ImageUpload
              onUpload={(url) => setAbout({ ...about, profileImage: url })}
              currentImage={about.profileImage}
              label=""
            />
          </div>
        </div>

        <div className="editor-section">
          <h3>Content</h3>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={about.bioTitle}
              onChange={(e) => setAbout({ ...about, bioTitle: e.target.value })}
              placeholder="ABOUT"
            />
          </div>
          <div className="form-group">
            <label>Bio Text</label>
            <textarea
              value={about.bioText}
              onChange={(e) => setAbout({ ...about, bioText: e.target.value })}
              rows={12}
              placeholder="Your biography..."
            />
            <small>Separate paragraphs with blank lines</small>
          </div>
        </div>

        <button onClick={handleSave} className="save-button">
          Save Changes
        </button>
      </div>
    </AdminLayout>
  );
}

export default AboutEditor;
