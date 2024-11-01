import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { Link } from 'react-router-dom';
import CategorySelector from '../components/CategorySelector';

const ZooShop = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedCategory === 'all') {
        response = await axios.get('/categories/all/products');
      } else {
        response = await axios.get(`/categories/${selectedCategory}/products`);
      }
      
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Zoo Shop</h1>
      
      <div className="grid grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="col-span-1">
          <CategorySelector onSelect={setSelectedCategory} />
        </div>

        {/* Products Grid */}
        <div className="col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(product => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ZooShop;
