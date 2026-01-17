import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import './Navbar.css';

function Navbar() {
  const { content } = useContent();
  const location = useLocation();
  const [isExhibitionsOpen, setIsExhibitionsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          {content.siteSettings.artistName.toLowerCase()}
        </Link>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link
              to="/gallery"
              className={`navbar-link ${isActive('/gallery') ? 'active' : ''}`}
            >
              gallery
            </Link>
          </li>

          <li
            className="navbar-item dropdown"
            onMouseEnter={() => setIsExhibitionsOpen(true)}
            onMouseLeave={() => setIsExhibitionsOpen(false)}
          >
            <span
              className={`navbar-link ${
                location.pathname.startsWith('/exhibitions') ? 'active' : ''
              }`}
            >
              recent exhibitions
            </span>
            <ul className={`dropdown-menu ${isExhibitionsOpen ? 'open' : ''}`}>
              {content.exhibitions.map((exhibition) => (
                <li key={exhibition.id} className="dropdown-item">
                  <Link to={`/exhibitions/${exhibition.id}`}>
                    {exhibition.title.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          <li className="navbar-item">
            <Link
              to="/about"
              className={`navbar-link ${isActive('/about') ? 'active' : ''}`}
            >
              about
            </Link>
          </li>

          <li className="navbar-item">
            <Link
              to="/contact"
              className={`navbar-link ${isActive('/contact') ? 'active' : ''}`}
            >
              contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
