import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Lightbox from '../../components/Lightbox/Lightbox';
import { useContent } from '../../contexts/ContentContext';
import {
  findCategoryByPath,
  getCategoryIdsWithin,
  getCategoryPath,
} from '../../data/galleryCategories';
import './Gallery.css';

function Gallery() {
  const { content } = useContent();
  const { categories } = content.gallery;
  const params = useParams();
  const categoryPath = params['*'] || '';
  const [selectedImage, setSelectedImage] = useState(null);
  const match = categoryPath ? findCategoryByPath(categories, categoryPath) : null;
  const category = match?.category;
  const categoryIds = category ? getCategoryIdsWithin(category) : null;
  const items = content.gallery.items.filter((item) => !categoryIds || categoryIds.includes(item.category));

  if (categoryPath && !category) {
    return (
      <div className="gallery-page">
        <h1 className="gallery-title">Gallery section not found</h1>
        <Link to="/gallery" className="gallery-back-link">View all work</Link>
      </div>
    );
  }

  const renderSectionLink = (section) => {
    const isSelected = category?.id === section.id;
    return (
      <Link
        to={getCategoryPath(categories, section.id)}
        className={isSelected ? 'selected' : ''}
        aria-current={isSelected ? 'page' : undefined}
      >
        {section.label}
      </Link>
    );
  };

  return (
    <div className="gallery-page">
      <div className="gallery-heading">
        <div>
          <p className="gallery-breadcrumb">
            <Link to="/gallery">{content.gallery.title}</Link>
            {match?.parent && (
              <> / <Link to={getCategoryPath(categories, match.parent.id)}>{match.parent.label}</Link></>
            )}
            {category && <> / {category.label}</>}
          </p>
          <h1 className="gallery-title">{category?.label || content.gallery.title}</h1>
        </div>
        {categoryPath && <Link to="/gallery" className="gallery-back-link">All work</Link>}
      </div>
      <nav className="gallery-category-nav" aria-label="Gallery sections">
        <Link
          to="/gallery"
          className={!categoryPath ? 'selected' : ''}
          aria-current={!categoryPath ? 'page' : undefined}
        >
          All work
        </Link>
        {categories.map((section) => (
          <div className="gallery-category-group" key={section.id}>
            {renderSectionLink(section)}
            {section.children.length > 0 && (
              <ul>
                {section.children.map((child) => (
                  <li key={child.id}>{renderSectionLink(child)}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
      <div className="gallery-grid">
        {items.map((item) => (
          <div key={item.id} className="gallery-item">
            <div className="gallery-image-wrapper">
              <img
                src={item.image}
                alt={item.title}
                className="gallery-image"
                loading="lazy"
                onClick={() => setSelectedImage({ src: item.image, alt: item.title })}
                role="button"
                tabIndex="0"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedImage({ src: item.image, alt: item.title });
                  }
                }}
              />
            </div>
            <div className="gallery-caption">
              <h3 className="gallery-item-title">{item.title}</h3>
              <p className="gallery-item-caption">{item.caption}</p>
              {item.description && <p className="gallery-item-description">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="gallery-empty">No work has been added to this section yet.</p>}
      <Lightbox
        image={selectedImage?.src}
        alt={selectedImage?.alt}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

export default Gallery;
