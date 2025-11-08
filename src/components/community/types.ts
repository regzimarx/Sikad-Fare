export interface Comment {
  id: string;
  username: string;
  content: string;
}

export interface Post {
  id: string;
  username: string;
  userImage: string;
  timestamp: string;
  content: string;
  postImage?: string;
  likes: number;
  comments: Comment[];
}
