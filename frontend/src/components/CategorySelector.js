import React, { useState, useEffect } from 'react';
import axios from '../config/axios';

const CategorySelector = ({ onSelect }) => {
  const [categories, setCategories] = useState([]);
  const [selectedPath, setSelectedPath] = useState(['all']);
  const [breadcrumb, setBreadcrumb] = useState([{ name: 'All', slug: 'all' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRootCategories();
  }, []);

  const fetchRootCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching root categories...');
      const response = await axios.get('/categories?parent=all');
      console.log('Root categories:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching root categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllCategories = async () => {
    try {
      setSelectedPath(['all']);
      setBreadcrumb([{ name: 'All', slug: 'all' }]);
      await fetchRootCategories();
      onSelect('all');
    } catch (error) {
      console.error('Error in handleAllCategories:', error);
    }
  };

  const handleSelect = async (category, level) => {
    try {
      // Update breadcrumb
      const newBreadcrumb = breadcrumb.slice(0, level);
      newBreadcrumb.push({ name: category.name, slug: category.slug });
      setBreadcrumb(newBreadcrumb);

      // Update selected path
      const newPath = [...selectedPath.slice(0, level), category.slug];
      setSelectedPath(newPath);
      
      // Fetch subcategories if they exist
      if (category.children?.length > 0) {
        setLoading(true);
        const response = await axios.get(`/categories?parent=${category.slug}`);
        setCategories(response.data);
        setLoading(false);
      }
      
      onSelect(category.slug);
    } catch (error) {
      console.error('Error in handleSelect:', error);
      setLoading(false);
    }
  };

  const renderBreadcrumb = () => (
    <div className="flex items-center space-x-2 mb-4 text-sm">
      {breadcrumb.map((item, index) => (
        <React.Fragment key={item.slug}>
          <button
            onClick={() => handleSelect({ name: item.name, slug: item.slug }, index)}
            className="hover:text-green-600"
          >
            {item.name}
          </button>
          {index < breadcrumb.length - 1 && (
            <span className="text-gray-400">/</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderCategories = (cats, level = 0) => {
    const currentSlug = selectedPath[level];
    const selectedCategory = cats.find(cat => cat.slug === currentSlug);
    
    return (
      <div className="space-y-2">
        {cats.map(cat => (
          <div key={cat.id}>
            <button
              onClick={() => handleSelect(cat, level)}
              className={`w-full text-left p-2 hover:bg-gray-100 rounded ${
                selectedPath.includes(cat.slug) ? 'bg-green-100' : ''
              }`}
            >
              <span className="flex items-center justify-between">
                {cat.name}
                {cat.children?.length > 0 && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            </button>
            {selectedCategory?.slug === cat.slug && cat.children?.length > 0 && (
              <div className="ml-4 mt-2">
                {renderCategories(cat.children, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {renderBreadcrumb()}
      <div className="border-t pt-4">
        <button
          onClick={handleAllCategories}
          className={`w-full text-left p-2 hover:bg-gray-100 rounded mb-2 ${
            selectedPath[0] === 'all' && selectedPath.length === 1 ? 'bg-green-100' : ''
          }`}
        >
          All Categories
        </button>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        ) : (
          renderCategories(categories)
        )}
      </div>
    </div>
  );
};

export default CategorySelector;
