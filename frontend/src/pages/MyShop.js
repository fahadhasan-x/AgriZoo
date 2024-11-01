import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import CategorySelector from '../components/CategorySelector';

const MyShop = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category_id: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    fetchMyProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      let response;
      if (selectedCategory === 'all') {
        response = await axios.get(`/categories/all/products`, {
          params: { userId: user.id }
        });
      } else {
        response = await axios.get(`/categories/${selectedCategory}/products`, {
          params: { userId: user.id }
        });
      }
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories', {
        params: { parent: 'all' }
      });
      
      // Create a flat list of all categories with proper indentation
      const flatCategories = [];
      const processCategories = (categories, level = 0, parentName = '') => {
        categories.forEach(category => {
          const displayName = parentName 
            ? `${parentName} > ${category.name}`
            : category.name;
          
          flatCategories.push({
            id: category.id,
            name: category.name,
            displayName: displayName
          });

          if (category.children?.length) {
            processCategories(category.children, level + 1, displayName);
          }
        });
      };

      processCategories(response.data);
      
      // Sort categories alphabetically
      flatCategories.sort((a, b) => a.displayName.localeCompare(b.displayName));
      setCategories(flatCategories);
      setAllCategories(flatCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('category_id', newProduct.category_id);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      await axios.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsAddingProduct(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category_id: ''
      });
      setSelectedImage(null);
      fetchMyProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">My Shop</h2>
        <button
          onClick={() => setIsAddingProduct(!isAddingProduct)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          {isAddingProduct ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {isAddingProduct && (
        <form onSubmit={handleAddProduct} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (৳)</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search categories..."
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const filtered = allCategories.filter(cat => 
                    cat.displayName.toLowerCase().includes(searchTerm)
                  );
                  setCategories(filtered);
                }}
                className="mt-2 w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                className="w-full"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Product
            </button>
          </div>
        </form>
      )}

      {/* Main Content Grid */}
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

export default MyShop;
