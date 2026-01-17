import { Link, useParams } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import './Exhibition.css';

function Exhibition() {
  const { id } = useParams();
  const { content } = useContent();

  const exhibition = content.exhibitions.find((ex) => ex.id === id);

  if (!exhibition) {
    return (
      <div className="exhibition-page">
        <div className="exhibition-not-found">
          <h1>Exhibition not found</h1>
          <Link to="/gallery" className="back-link">
            ← Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="exhibition-page">
      <div className="exhibition-header">
        <h1 className="exhibition-title">{exhibition.title}</h1>
        <div className="exhibition-meta">
          <span className="exhibition-year">{exhibition.year}</span>
          <span className="exhibition-venue">{exhibition.venue}</span>
          <span className="exhibition-location">{exhibition.location}</span>
        </div>
      </div>

      <div className="exhibition-content">
        <p className="exhibition-description">{exhibition.description}</p>

        {exhibition.images && exhibition.images.length > 0 && (
          <div className="exhibition-images">
            {exhibition.images.map((image, index) => (
              <div key={index} className="exhibition-image-wrapper">
                <img
                  src={image}
                  alt={`${exhibition.title} - Image ${index + 1}`}
                  className="exhibition-image"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Link to="/gallery" className="back-link">
        ← Back to Gallery
      </Link>
    </div>
  );
}

export default Exhibition;
