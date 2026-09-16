import { useEffect } from 'react';
import './Lightbox.css';

function Lightbox({ image, alt, onClose }) {
  useEffect(() => {
    if (!image) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div className="lightbox-overlay" role="dialog" aria-modal="true" aria-label="Enlarged image" onClick={onClose}>
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close enlarged image">
        <span aria-hidden="true">&times;</span>
      </button>
      <img
        src={image}
        alt={alt}
        className="lightbox-image"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export default Lightbox;
