import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { marvelApi } from '../services/marvelApi';
import { MarvelCharacter, GalleryFilters } from '../types/marvel';
import './GalleryView.css';

const GalleryView: React.FC = () => {
  const [characters, setCharacters] = useState<MarvelCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GalleryFilters>({
    hasComics: false,
    hasSeries: false,
    hasEvents: false
  });

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await marvelApi.getCharacters({ limit: 100 }); // Get more characters
        setCharacters(response.data.results);
      } catch (err) {
        setError('Failed to fetch characters');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const filteredCharacters = useMemo(() => {
    let result = [...characters];

    if (filters.hasComics) {
      result = result.filter(character => character.comics.available > 0);
    }

    if (filters.hasSeries) {
      result = result.filter(character => character.series.available > 0);
    }

    if (filters.hasEvents) {
      result = result.filter(character => character.events.available > 0);
    }

    return result;
  }, [characters, filters]);

  const handleFilterChange = (filterType: keyof GalleryFilters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  if (loading) return <div className="loading">Loading gallery...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="gallery-view">
      <div className="filter-controls">
        <h3>Filter by:</h3>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.hasComics}
            onChange={() => handleFilterChange('hasComics')}
          />
          Has Comics
        </label>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.hasSeries}
            onChange={() => handleFilterChange('hasSeries')}
          />
          Has Series
        </label>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.hasEvents}
            onChange={() => handleFilterChange('hasEvents')}
          />
          Has Events
        </label>
      </div>

      <div className="gallery-grid">
        {filteredCharacters.map(character => (
          <Link
            key={character.id}
            to={`/character/${character.id}`}
            className="gallery-item"
          >
            <img
              src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
              alt={character.name}
              className="gallery-image"
              onError={(e) => {
                // If the image fails to load, replace with placeholder
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/400x400/667eea/ffffff?text=${encodeURIComponent(character.name)}`;
              }}
            />
            <div className="gallery-overlay">
              <h4 className="gallery-name">{character.name}</h4>
              <div className="gallery-stats">
                {character.comics.available > 0 && (
                  <span className="stat-badge">📚 {character.comics.available}</span>
                )}
                {character.series.available > 0 && (
                  <span className="stat-badge">📺 {character.series.available}</span>
                )}
                {character.events.available > 0 && (
                  <span className="stat-badge">⚡ {character.events.available}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="no-results">No characters match the selected filters.</div>
      )}
    </div>
  );
};

export default GalleryView;
