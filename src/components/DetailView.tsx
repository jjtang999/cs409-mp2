import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marvelApi } from '../services/marvelApi';
import { MarvelCharacter } from '../types/marvel';

import './DetailView.css';

const DetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<MarvelCharacter | null>(null);
  const [allCharacters, setAllCharacters] = useState<MarvelCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the specific character by ID
        const characterResponse = await marvelApi.getCharacterById(parseInt(id!));
        
        if (characterResponse.data.results.length > 0) {
          const currentChar = characterResponse.data.results[0];
          setCharacter(currentChar);
          
          // Fetch all characters for navigation
          const allResponse = await marvelApi.getCharacters({ limit: 100 });
          setAllCharacters(allResponse.data.results);
          
          // Find current character's position in the full list
          const index = allResponse.data.results.findIndex(
            char => char.id.toString() === id
          );
          setCurrentIndex(index >= 0 ? index : 0);
        } else {
          setError('Character not found');
        }
      } catch (err) {
        setError('Failed to fetch character details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handlePrevious = () => {
    if (allCharacters.length > 0) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : allCharacters.length - 1;
      const newCharacter = allCharacters[newIndex];
      navigate(`/character/${newCharacter.id}`);
    }
  };

  const handleNext = () => {
    if (allCharacters.length > 0) {
      const newIndex = currentIndex < allCharacters.length - 1 ? currentIndex + 1 : 0;
      const newCharacter = allCharacters[newIndex];
      navigate(`/character/${newCharacter.id}`);
    }
  };

  if (loading) return <div className="loading">Loading character details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!character) return <div className="error">Character not found</div>;

  return (
    <div className="detail-view">
      <div className="navigation-controls">
        <button onClick={handlePrevious} className="nav-button">
          ← Previous
        </button>
        <span className="character-counter">
          {currentIndex + 1} of {allCharacters.length}
        </span>
        <button onClick={handleNext} className="nav-button">
          Next →
        </button>
      </div>

      <div className="character-detail">
        <div className="character-image-section">
          <img
            src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
            alt={character.name}
            className="character-image"
          />
        </div>

        <div className="character-info-section">
          <h1 className="character-title">{character.name}</h1>
          
          <div className="character-description">
            <h3>Description</h3>
            <p>{character.description || 'No description available.'}</p>
          </div>

          <div className="character-stats-grid">
            <div className="stat-card">
              <h4>Comics</h4>
              <p className="stat-number">{character.comics.available}</p>
              {character.comics.items.length > 0 && (
                <ul className="stat-list">
                  {character.comics.items.slice(0, 3).map((comic, index) => (
                    <li key={index}>{comic.name}</li>
                  ))}
                  {character.comics.items.length > 3 && (
                    <li>...and {character.comics.items.length - 3} more</li>
                  )}
                </ul>
              )}
            </div>

            <div className="stat-card">
              <h4>Series</h4>
              <p className="stat-number">{character.series.available}</p>
              {character.series.items.length > 0 && (
                <ul className="stat-list">
                  {character.series.items.slice(0, 3).map((series, index) => (
                    <li key={index}>{series.name}</li>
                  ))}
                  {character.series.items.length > 3 && (
                    <li>...and {character.series.items.length - 3} more</li>
                  )}
                </ul>
              )}
            </div>

            <div className="stat-card">
              <h4>Stories</h4>
              <p className="stat-number">{character.stories.available}</p>
              {character.stories.items.length > 0 && (
                <ul className="stat-list">
                  {character.stories.items.slice(0, 3).map((story, index) => (
                    <li key={index}>{story.name}</li>
                  ))}
                  {character.stories.items.length > 3 && (
                    <li>...and {character.stories.items.length - 3} more</li>
                  )}
                </ul>
              )}
            </div>

            <div className="stat-card">
              <h4>Events</h4>
              <p className="stat-number">{character.events.available}</p>
              {character.events.items.length > 0 && (
                <ul className="stat-list">
                  {character.events.items.slice(0, 3).map((event, index) => (
                    <li key={index}>{event.name}</li>
                  ))}
                  {character.events.items.length > 3 && (
                    <li>...and {character.events.items.length - 3} more</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="character-metadata">
            <p><strong>Last Modified:</strong> {new Date(character.modified).toLocaleDateString()}</p>
            <p><strong>Character ID:</strong> {character.id}</p>
          </div>

          {character.urls.length > 0 && (
            <div className="character-links">
              <h4>External Links</h4>
              {character.urls.map((url, index) => (
                <a
                  key={index}
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  {url.type === 'detail' ? 'Marvel.com' : url.type}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailView;
