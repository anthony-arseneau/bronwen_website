import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import { getCategoryPath } from '../../data/galleryCategories';
import './Navbar.css';

function Navbar() {
  const { content } = useContent();
  const location = useLocation();
  const [isExhibitionsOpen, setIsExhibitionsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          {content.siteSettings.artistName.toLowerCase()}
        </Link>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
              home page
            </Link>
          </li>

          <li className="navbar-item">
            <div
              className="dropdown"
              onMouseEnter={() => setIsGalleryOpen(true)}
              onMouseLeave={() => setIsGalleryOpen(false)}
            >
              <Link
                to="/gallery"
                className={`navbar-link ${location.pathname.startsWith('/gallery') ? 'active' : ''}`}
                aria-haspopup="true"
                aria-expanded={isGalleryOpen}
              >
                gallery
              </Link>
              <ul className={`dropdown-menu gallery-dropdown-menu ${isGalleryOpen ? 'open' : ''}`}>
                <li className="dropdown-item">
                  <Link to="/gallery">all work</Link>
                </li>
                {content.gallery.categories.map((category) => (
                  <li key={category.id} className="dropdown-item gallery-category-group">
                    <Link
                      to={getCategoryPath(content.gallery.categories, category.id)}
                      className="gallery-category-link"
                    >
                      {category.label.toLowerCase()}
                    </Link>
                    {category.children.length > 0 && (
                      <ul className="gallery-subcategory-list">
                        {category.children.map((child) => (
                          <li key={child.id} className="dropdown-item">
                            <Link to={getCategoryPath(content.gallery.categories, child.id)}>
                              {child.label.toLowerCase()}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </li>

          <li className="navbar-item">
            <Link
              to="/about"
              className={`navbar-link ${isActive('/about') ? 'active' : ''}`}
            >
              about
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
              exhibitions
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
