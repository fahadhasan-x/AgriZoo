import React, { useEffect, useState } from 'react';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { XMarkIcon } from '@heroicons/react/24/outline';
import SearchBox from '../components/SearchBox';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/posts');
      console.log('Fetched posts:', response.data);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !selectedFile) return;

    setIsLoading(true);
    try {
        const formData = new FormData();
        formData.append('content', newPost.trim());
        if (selectedFile) {
            formData.append('media', selectedFile);
        }

        console.log('Submitting post:', {
            content: newPost,
            hasFile: !!selectedFile
        });

        const response = await axios.post('/posts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Post response:', response.data);

        if (!response.data.id) {
            throw new Error('Invalid post response');
        }

        // Update posts array with new post at the beginning
        setPosts(prevPosts => [response.data, ...prevPosts]);
        
        // Clear form
        setNewPost('');
        setSelectedFile(null);
        setFilePreview(null);
    } catch (error) {
        console.error('Error creating post:', error.response?.data || error);
        alert(error.response?.data?.error || 'Failed to create post');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-green-700">AgriZoo</h1>
        <SearchBox />
      </div>
      
      
      {/* Create Post Section */}
      {user && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Share your agricultural knowledge..."
              rows="3"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            
            {/* File Upload Section */}
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Add Photo/Video
              </label>
              {selectedFile && (
                <span className="text-sm text-gray-500">
                  {selectedFile.name}
                </span>
              )}
            </div>

            {/* File Preview */}
            {filePreview && (
              <div className="mt-2 relative">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex justify-end mt-2">
              <button 
                type="submit"
                disabled={isLoading || (!newPost.trim() && !selectedFile)}
                className={`px-4 py-2 rounded-lg text-white ${
                  isLoading || (!newPost.trim() && !selectedFile)
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post}
            onUpdate={fetchPosts}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
