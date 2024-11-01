import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import PostCard from '../components/PostCard';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [products, setProducts] = useState([]);
    const [showShop, setShowShop] = useState(false);

    const fetchUserProfile = useCallback(async () => {
        try {
            setLoading(true);
            const [userResponse, productsResponse] = await Promise.all([
                axios.get(`/users/${id}`),
                axios.get(`/users/${id}/products`)
            ]);
            setUser(userResponse.data);
            setProducts(productsResponse.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error.response?.data?.error || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleShopClick = () => {
        navigate(`/user-shop/${user.id}`);  // Redirect to UserShop page
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (error) return <div className="text-center mt-8 text-red-600">{error}</div>;
    if (!user) return <div className="text-center mt-8">User not found</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center">
                    <img
                        src={user.profile_picture || '/default-avatar.png'}
                        alt={user.full_name}
                        className="w-32 h-32 rounded-full mr-6"
                    />
                    <div>
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">{user.full_name}</h2>
                            <button 
                                onClick={handleShopClick}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Shop
                            </button>
                        </div>
                        {user.location && (
                            <p className="text-gray-600 mt-1">{user.location}</p>
                        )}
                        {user.bio && (
                            <p className="text-gray-700 mt-2">{user.bio}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Shop Modal/Dropdown */}
            {showShop && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Shop</h2>
                            <button 
                                onClick={() => setShowShop(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
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
                    </div>
                </div>
            )}

            {/* Posts section */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Posts</h2>
                <div className="space-y-6">
                    {user.posts?.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post}
                            onUpdate={fetchUserProfile}
                        />
                    ))}
                    {user.posts?.length === 0 && (
                        <p className="text-center text-gray-500">No posts yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
