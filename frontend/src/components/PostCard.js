import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon, TrashIcon, PencilIcon, GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { timeAgo } from '../utils/dateUtils';
import { likePost, commentOnPost, deletePost } from '../services/postService';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ 
  post, 
  onUpdate, 
  onVisibilityToggle, 
  onEdit, 
  onDelete, 
  isEditing, 
  setEditingPost,
  showControls = false
}) => {
  const { user: currentUser } = useAuth();
  const [editContent, setEditContent] = useState(post.content);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likers?.length || 0);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  // Add this console.log to check timestamp format
  console.log('Post timestamp:', post.created_at);
  console.log('Post full data:', post);

  // Check if post should be visible
  const shouldShowPost = () => {
    // Always show if it's public
    if (post.visibility === 'public') return true;
    // Show private posts only to the owner
    return currentUser?.id === post.user_id;
  };

  if (!shouldShowPost()) return null;

  const handleLike = async () => {
    try {
      const response = await likePost(post.id);
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await commentOnPost(post.id, comment);
      setComment('');
      if (onUpdate) onUpdate();
      setShowComments(true);
    } catch (error) {
      console.error('Error commenting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <Link to={`/user/${post.user.id}`}>
            <img
              src={post.user?.profile_picture || '/default-avatar.png'}
              alt={post.user?.full_name}
              className="w-10 h-10 rounded-full mr-3"
            />
          </Link>
          <div>
            <Link to={`/user/${post.user.id}`}>
              <h3 className="font-semibold hover:text-green-600">
                {post.user?.full_name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500">
              {timeAgo(post.created_at || post.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Post Controls for Owner */}
        {showControls && currentUser?.id === post.user_id && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onVisibilityToggle(post.id)}
              className={`visibility-toggle ${post.visibility === 'public' ? 'public' : 'private'}`}
            >
              {post.visibility === 'public' ? 'Make Private' : 'Make Public'}
            </button>
            <button
              onClick={() => setEditingPost(post.id)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <PencilIcon className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <TrashIcon className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      {isEditing ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          onEdit(post.id, editContent);
        }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-800 mb-4">{post.content}</p>
      )}

      {post.media_url && (
        <div className="mb-4">
          {post.media_type === 'image' ? (
            <img
              src={post.media_url}
              alt="Post content"
              className="rounded-lg w-full"
            />
          ) : post.media_type === 'video' && (
            <video
              src={post.media_url}
              controls
              className="rounded-lg w-full"
            />
          )}
        </div>
      )}

      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handleLike}
          className="flex items-center space-x-1 text-gray-500 hover:text-green-600"
        >
          {isLiked ? (
            <HeartSolidIcon className="w-6 h-6 text-green-600" />
          ) : (
            <HeartIcon className="w-6 h-6" />
          )}
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-gray-500 hover:text-green-600"
        >
          <ChatBubbleLeftIcon className="w-6 h-6" />
          <span>{post.comments?.length || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4">
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className={`px-4 py-2 rounded-lg text-white ${
                  !comment.trim() || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <Link to={`/user/${comment.user.id}`}>
                  <img
                    src={comment.user.profile_picture || '/default-avatar.png'}
                    alt={comment.user.full_name}
                    className="w-8 h-8 rounded-full"
                  />
                </Link>
                <div>
                  <Link
                    to={`/user/${comment.user.id}`}
                    className="font-semibold hover:text-green-600"
                  >
                    {comment.user.full_name}
                  </Link>
                  <p className="text-gray-800">{comment.content}</p>
                  <p className="text-sm text-gray-500">
                    {timeAgo(comment.created_at || comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
