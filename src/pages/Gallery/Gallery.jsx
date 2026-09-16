import { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import Lightbox from '../../components/Lightbox/Lightbox';
import './Gallery.css';

function Gallery() {
  const { content } = useContent();
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="gallery-page">
      <h1 className="gallery-title">{content.gallery.title}</h1>
      <div className="gallery-grid">
        {content.gallery.items.map((item, index) => (
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
      <Lightbox
        image={selectedImage?.src}
        alt={selectedImage?.alt}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

export default Gallery;
