import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { marvelApi } from '../services/marvelApi';
import { MarvelCharacter, SearchFilters } from '../types/marvel';
import './ListView.css';

const ListView: React.FC = () => {
  const [characters, setCharacters] = useState<MarvelCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [filters.query]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, query: e.target.value }));
  };

  // Load initial characters on mount
  useEffect(() => {
    const fetchInitialCharacters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await marvelApi.getCharacters({
          orderBy: 'name',
          limit: 50
        });
        setCharacters(response.data.results);
      } catch (err) {
        setError('Failed to fetch characters');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialCharacters();
  }, []); // Only run on mount

  useEffect(() => {
    // Only fetch if there's a debounced search query
    if (!debouncedQuery) return;

    const fetchCharacters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await marvelApi.getCharacters({
          nameStartsWith: debouncedQuery,
          orderBy: filters.sortOrder === 'desc' ? `-${filters.sortBy}` : filters.sortBy,
          limit: 50
        });
        setCharacters(response.data.results);
      } catch (err) {
        setError('Failed to fetch characters');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [debouncedQuery, filters.sortBy, filters.sortOrder]);

  const filteredAndSortedCharacters = useMemo(() => {
    let result = [...characters];

    // Filter by search query (client-side)
    if (filters.query) {
      result = result.filter(character =>
        character.name.toLowerCase().includes(filters.query.toLowerCase())
      );
    }

    // Sort (client-side)
    result.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (filters.sortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {
        aValue = new Date(a.modified).getTime();
        bValue = new Date(b.modified).getTime();
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [characters, filters]);

  const handleSortChange = (sortBy: 'name' | 'modified') => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading) return <div className="loading">Loading characters...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="list-view">
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search characters..."
          value={filters.query}
          onChange={handleQueryChange}
          className="search-input"
        />
        <div className="sort-controls">
          <button
            onClick={() => handleSortChange('name')}
            className={`sort-button ${filters.sortBy === 'name' ? 'active' : ''}`}
          >
            Name {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('modified')}
            className={`sort-button ${filters.sortBy === 'modified' ? 'active' : ''}`}
          >
            Modified {filters.sortBy === 'modified' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <div className="character-list">
        {filteredAndSortedCharacters.map(character => (
          <Link
            key={character.id}
            to={`/character/${character.id}`}
            className="character-item"
          >
            <img
              src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
              alt={character.name}
              className="character-thumbnail"
              onError={(e) => {
                // If the image fails to load, replace with placeholder
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/120x120/667eea/ffffff?text=${encodeURIComponent(character.name)}`;
              }}
            />
            <div className="character-info">
              <h3 className="character-name">{character.name}</h3>
              <p className="character-description">
                {character.description || 'No description available.'}
              </p>
              <div className="character-stats">
                <span>Comics: {character.comics.available}</span>
                <span>Series: {character.series.available}</span>
                <span>Events: {character.events.available}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredAndSortedCharacters.length === 0 && (
        <div className="no-results">No characters found.</div>
      )}
    </div>
  );
};

export default ListView;
