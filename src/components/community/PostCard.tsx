'use client';

import React, { useState } from 'react';
import { FaThumbsUp, FaComment, FaShare } from 'react-icons/fa';
import { Post } from './types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Post Header */}
      <div className="flex items-center mb-4">
        <img src={post.userImage} alt={post.username} className="w-10 h-10 rounded-full mr-4" />
        <div>
          <p className="font-bold">{post.username}</p>
          <p className="text-sm text-gray-500">{post.timestamp}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="mb-4">{post.content}</p>
      {post.postImage && (
        <img src={post.postImage} alt="Post content" className="rounded-lg w-full mb-4" />
      )}

      {/* Post Actions */}
      <div className="flex justify-between items-center border-t border-gray-200 pt-2">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors ${isLiked ? 'text-blue-600' : ''}`}
        >
          <FaThumbsUp />
          <span>{likeCount} Likes</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
          <FaComment />
          <span>Comment</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
          <FaShare />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
