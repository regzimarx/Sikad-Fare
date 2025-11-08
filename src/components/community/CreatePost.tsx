'use client';

import React, { useState } from 'react';
import { FaImage } from 'react-icons/fa';

interface CreatePostProps {
  onAddPost: (content: string) => void;
}

export function CreatePost({ onAddPost }: CreatePostProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onAddPost(content);
      setContent('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-start space-x-4">
        <img
          src="https://via.placeholder.com/40"
          alt="Your profile"
          className="w-10 h-10 rounded-full"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What's on your mind?"
          rows={3}
        />
      </div>
      <div className="flex justify-between items-center mt-4">
        <button className="text-gray-500 hover:text-blue-600">
          <FaImage size={24} />
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          disabled={!content.trim()}
        >
          Post
        </button>
      </div>
    </div>
  );
}
