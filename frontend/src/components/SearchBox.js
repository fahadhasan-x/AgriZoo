import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import axios from '../config/axios';

const SearchBox = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('/search', {
          params: { 
            q: term,
            type: 'products' // Always search only products for suggestions
          }
        });
        // Now response.data will be an array of products when type is 'products'
        setSuggestions(response.data.slice(0, 5));
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSuggestions([]); // Clear suggestions
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search for products..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {suggestions.map(product => (
            <div
              key={product.id}
              onClick={() => {
                setSearchTerm('');
                setSuggestions([]);
                navigate(`/search?q=${encodeURIComponent(product.name)}`);
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
            >
              <img
                src={product.image_url || '/default-product.png'}
                alt={product.name}
                className="w-10 h-10 object-cover rounded mr-2"
              />
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-600">৳{product.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchBox;
