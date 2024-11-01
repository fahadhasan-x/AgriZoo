import React, { useState, useEffect } from 'react';
import { CameraIcon, PencilIcon, TrashIcon, GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });
  const [editingPost, setEditingPost] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [customBackground, setCustomBackground] = useState(null);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
  const [products, setProducts] = useState([]);

  const suggestedBackgrounds = [
    {
      id: 1,
      url: '/backgrounds/agri-bg1.jpg',
      name: 'Agri Pattern'
    },
    {
      id: 2,
      url: '/backgrounds/agri-bg2.jpg',
      name: 'Farm View'
    },
    {
      id: 3,
      url: '/backgrounds/agri-bg3.jpg',
      name: 'Green Pattern'
    }
  ];

  const fetchUserPosts = async () => {
    try {
        if (user?.id) {
            console.log('Fetching posts for user:', user.id);
            
            const response = await axios.get(`/users/${user.id}/posts`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('Fetched posts:', response.data);
            setPosts(response.data);
        }
    } catch (error) {
        console.error('Error fetching user posts:', error);
        toast.error('Failed to fetch posts');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
        if (user?.id) {
            try {
                const [postsResponse, productsResponse] = await Promise.all([
                    axios.get(`/users/${user.id}/posts`),
                    axios.get(`/users/${user.id}/products`)
                ]);
                
                console.log('User posts:', postsResponse.data);
                
                // Filter posts based on visibility
                const filteredPosts = postsResponse.data.filter(post => {
                    if (post.visibility === 'public') return true;
                    return post.user_id === user.id;
                });

                setPosts(filteredPosts);
                setProducts(productsResponse.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    };

    fetchData();
  }, [user?.id]);

  const fetchMyProducts = async () => {
    try {
      const response = await axios.get(`/users/${user.id}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.put('/users/profile', {
            fullName: profileData.fullName,
            bio: profileData.bio,
            location: profileData.location
        });

        setUser(response.data);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        toast.error('Please upload only images');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
        toast.loading('Uploading profile picture...');
        const response = await axios.put('/users/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        setUser(response.data);
        toast.dismiss();
        toast.success('Profile picture updated successfully!');
    } catch (error) {
        console.error('Error updating profile picture:', error);
        toast.dismiss();
        toast.error(error.response?.data?.error || 'Failed to update profile picture');
    }
  };

  // Handle post visibility toggle
  const handleVisibilityToggle = async (postId) => {
    try {
        // Find the current post
        const currentPost = posts.find(p => p.id === postId);
        if (!currentPost) return;

        // Toggle visibility
        const newVisibility = currentPost.visibility === 'public' ? 'private' : 'public';
        
        console.log('Toggling visibility:', { postId, oldVisibility: currentPost.visibility, newVisibility });

        // Update in backend
        const response = await axios.patch(`/posts/${postId}/visibility`, {
            visibility: newVisibility
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('Backend response:', response.data);

        // Update local state
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post.id === postId 
                    ? { ...post, visibility: newVisibility }
                    : post
            )
        );

    } catch (error) {
        console.error('Error toggling visibility:', error);
        toast.error('Failed to update post visibility');
    }
  };

  // Handle post edit
  const handlePostEdit = async (postId, updatedContent) => {
    try {
      await axios.put(`/posts/${postId}`, {
        content: updatedContent
      });
      setEditingPost(null);
      await fetchUserPosts();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  // Handle post delete
  const handlePostDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await axios.delete(`/posts/${postId}`);
      await fetchUserPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleBackgroundChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview and confirm
    const reader = new FileReader();
    reader.onloadend = () => {
      if (window.confirm('Do you want to set this as your background?')) {
        const formData = new FormData();
        formData.append('background', file);
        
        uploadBackground(formData);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadBackground = async (formData) => {
    try {
      const response = await axios.put('/users/background', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setCustomBackground(response.data.background_url);
      setUser(response.data);
      setShowBackgroundOptions(false);
    } catch (error) {
      console.error('Error updating background:', error);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: customBackground ? `url("${customBackground}")` : 'none',
        backgroundSize: 'cover'
      }}
    >
      {/* Background Change Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowBackgroundOptions(!showBackgroundOptions)}
          className="bg-white/80 hover:bg-white px-4 py-2 rounded-lg shadow-md"
        >
          {customBackground ? 'Change Background' : 'Add Background'}
        </button>

        {/* Background Options Dropdown */}
        {showBackgroundOptions && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4">
            {/* Custom Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Upload Background
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundChange}
                className="w-full text-sm"
              />
            </div>

            {/* Remove Background */}
            {customBackground && (
              <button
                onClick={() => {
                  setCustomBackground('');
                  setShowBackgroundOptions(false);
                }}
                className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-red-600"
              >
                Remove Background
              </button>
            )}

            {/* Suggested Backgrounds */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Suggested Backgrounds</p>
              <div className="grid grid-cols-3 gap-2">
                {suggestedBackgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setCustomBackground(bg.url);
                      setShowBackgroundOptions(false);
                    }}
                    className="relative group"
                  >
                    <img 
                      src={bg.url} 
                      alt={bg.name}
                      className="w-full h-16 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <span className="text-white text-xs">{bg.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="relative">
                <img
                  src={user?.profile_picture || '/default-avatar.png'}
                  alt={user?.full_name}
                  className="w-32 h-32 rounded-full"
                />
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 cursor-pointer"
                >
                  <CameraIcon className="w-5 h-5" />
                </label>
                <input
                  type="file"
                  id="profile-picture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold">{user?.full_name}</h2>
                <p className="text-gray-600">{user?.location}</p>
                {/* Stack buttons vertically */}
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                  <Link
                    to="/my-shop"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-center"
                  >
                    My Shop
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <p className="text-gray-700">{user?.bio}</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">My Posts</h2>
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post}
                onUpdate={fetchUserPosts}
                onVisibilityToggle={handleVisibilityToggle}
                onEdit={handlePostEdit}
                onDelete={handlePostDelete}
                isEditing={editingPost === post.id}
                setEditingPost={setEditingPost}
                showControls={true}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">My Shop</h2>
            <Link
              to="/my-shop"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Manage Shop
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.slice(0, 3).map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={product.image_url || '/default-product.png'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-green-600 font-bold">৳{product.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-3 text-center">No products yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
