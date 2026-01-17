import { useContent } from '../../contexts/ContentContext';
import './Acknowledgements.css';

function Acknowledgements() {
  const { content } = useContent();

  return (
    <div className="acknowledgements-page">
      <h1 className="acknowledgements-title">{content.acknowledgements.title}</h1>
      <div className="acknowledgements-content">
        {content.acknowledgements.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export default Acknowledgements;
