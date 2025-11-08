'use client';

import React, { useState } from 'react';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { Post } from './types';

// Mock data for initial posts
const initialPosts: Post[] = [
  {
    id: '1',
    username: 'Sikad Driver',
    timestamp: '5m ago',
    content: 'Welcome to the new Sikad Community! Share your thoughts and experiences.',
    likes: 12,
    comments: [],
    userImage: 'https://via.placeholder.com/40',
  },
  {
    id: '2',
    username: 'Commuter C',
    timestamp: '1h ago',
    content: 'Just had a great ride with a very friendly driver! 5 stars! ⭐⭐⭐⭐⭐',
    likes: 25,
    comments: [],
    userImage: 'https://via.placeholder.com/40',
    postImage: 'https://via.placeholder.com/400x200',
  },
];

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleAddPost = (content: string) => {
    const newPost: Post = {
      id: new Date().toISOString(),
      username: 'You',
      userImage: 'https://via.placeholder.com/40',
      timestamp: 'Just now',
      content,
      likes: 0,
      comments: [],
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="h-full bg-background text-foreground p-4 space-y-4 overflow-y-auto pb-20">
      <CreatePost onAddPost={handleAddPost} />
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
