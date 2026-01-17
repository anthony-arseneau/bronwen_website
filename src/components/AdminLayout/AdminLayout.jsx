import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import './AdminLayout.css';

function AdminLayout({ children, showSaveSuccess }) {
  const { logout } = useContent();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Save Success Animation */}
      <div className={`save-success ${showSaveSuccess ? 'show' : ''}`}>
        <div className="save-success-content">
          <span className="save-checkmark">✓</span>
          <span>Saved Successfully</span>
        </div>
      </div>

      <div className="admin-sidebar">
        <h2 className="admin-title">Admin Panel</h2>
        <nav className="admin-nav">
          <Link
            to="/edit/home"
            className={`nav-link ${isActive('/edit/home') ? 'active' : ''}`}
          >
            Home Page
          </Link>
          <Link
            to="/edit/gallery"
            className={`nav-link ${isActive('/edit/gallery') ? 'active' : ''}`}
          >
            Gallery
          </Link>
          <Link
            to="/edit/about"
            className={`nav-link ${isActive('/edit/about') ? 'active' : ''}`}
          >
            About
          </Link>
          <Link
            to="/edit/exhibitions"
            className={`nav-link ${isActive('/edit/exhibitions') ? 'active' : ''}`}
          >
            Exhibitions
          </Link>
          <Link
            to="/edit/contact"
            className={`nav-link ${isActive('/edit/contact') ? 'active' : ''}`}
          >
            Contact
          </Link>
        </nav>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="admin-content">
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
