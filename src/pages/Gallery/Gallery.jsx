import { useContent } from '../../contexts/ContentContext';
import './Gallery.css';

function Gallery() {
  const { content } = useContent();

  return (
    <div className="gallery-page">
      <h1 className="gallery-title">{content.gallery.title}</h1>
      <div className="gallery-grid">
        {content.gallery.items.map((item, index) => (
          <div
            key={item.id}
            className="gallery-item"
          >
            <div className="gallery-image-wrapper">
              <img
                src={item.image}
                alt={item.title}
                className="gallery-image"
                loading="lazy"
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
    </div>
  );
}

export default Gallery;
