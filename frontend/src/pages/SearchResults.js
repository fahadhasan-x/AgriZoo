import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from '../config/axios';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState({
    products: [],
    users: [],
    posts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query, searchType]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/search', {
        params: { 
          q: query,
          type: searchType
        }
      });
      
      if (searchType === 'all') {
        setResults(response.data);
      } else {
        setResults({
          products: searchType === 'products' ? response.data : [],
          users: searchType === 'users' ? response.data : [],
          posts: searchType === 'posts' ? response.data : []
        });
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults({ products: [], users: [], posts: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Search Results for "{query}"</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setSearchType('all')}
            className={`px-4 py-2 rounded-lg ${
              searchType === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setSearchType('products')}
            className={`px-4 py-2 rounded-lg ${
              searchType === 'products' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Products
          </button>
          <button 
            onClick={() => setSearchType('users')}
            className={`px-4 py-2 rounded-lg ${
              searchType === 'users' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Users
          </button>
          <button 
            onClick={() => setSearchType('posts')}
            className={`px-4 py-2 rounded-lg ${
              searchType === 'posts' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Posts
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Products Section */}
          {(searchType === 'all' || searchType === 'products') && results.products?.length > 0 && (
            <div>
              {searchType === 'all' && <h3 className="text-xl font-semibold mb-4">Products</h3>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img
                      src={product.image_url || '/default-product.png'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-2">{product.description}</p>
                      <p className="text-green-600 font-bold">৳{product.price}</p>
                      <Link 
                        to={`/user/${product.user.id}`}
                        className="text-sm text-blue-600 hover:underline mt-2 block"
                      >
                        Seller: {product.user.full_name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          {(searchType === 'all' || searchType === 'users') && results.users?.length > 0 && (
            <div>
              {searchType === 'all' && <h3 className="text-xl font-semibold mb-4">Users</h3>}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {results.users.map(user => (
                  <Link 
                    key={user.id}
                    to={`/user/${user.id}`}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={user.profile_picture || '/default-avatar.png'}
                      alt={user.full_name}
                      className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
                    />
                    <h4 className="text-center font-medium">{user.full_name}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(searchType === 'all' || searchType === 'posts') && results.posts?.length > 0 && (
            <div>
              {searchType === 'all' && <h3 className="text-xl font-semibold mb-4">Posts</h3>}
              <div className="space-y-4">
                {results.posts.map(post => (
                  <div key={post.id} className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                      <img
                        src={post.user.profile_picture || '/default-avatar.png'}
                        alt={post.user.full_name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <Link 
                        to={`/user/${post.user.id}`}
                        className="font-medium hover:text-green-600"
                      >
                        {post.user.full_name}
                      </Link>
                    </div>
                    <p className="text-gray-800">{post.content}</p>
                    {post.media_url && (
                      <img 
                        src={post.media_url} 
                        alt="Post media"
                        className="mt-4 rounded-lg max-h-96 object-cover" 
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {(!results.products?.length && !results.users?.length && !results.posts?.length) && (
            <div className="text-center py-8 text-gray-500">
              No results found. Try different keywords.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
