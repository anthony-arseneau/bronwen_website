import { Link } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import './Home.css';

function Home() {
  const { content } = useContent();
  const { home } = content;

  return (
    <div className="home-page">
      {home.backgroundImage && (
        <div 
          className="home-background"
          style={{ backgroundImage: `url(${home.backgroundImage})` }}
        />
      )}
      <div className="home-hero">
        <h1 className="home-title">{home.title || content.siteSettings.artistName}</h1>
        <p className="home-subtitle">{home.subtitle}</p>
        <Link to="/gallery" className="home-cta">
          {home.ctaText || 'View Work'}
        </Link>
      </div>
    </div>
  );
}

export default Home;
