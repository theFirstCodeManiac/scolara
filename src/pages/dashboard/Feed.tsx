import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  Heart, MessageCircle, Send, Search, UserPlus, UserCheck,
  Image, Sparkles, X, Rss
} from 'lucide-react';

type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  created_at: string;
  profiles: {
    first_name: string;
    full_name: string;
    avatar_url?: string;
    department?: string;
    university?: string;
  };
  post_likes: { user_id: string }[];
  post_comments: { id: string; content: string; user_id: string; created_at: string; profiles: { first_name: string; full_name: string; avatar_url?: string } }[];
};

type SearchedUser = {
  id: string;
  first_name?: string;
  full_name?: string;
  avatar_url?: string;
  department?: string;
  university?: string;
};

export const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // User Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Image upload for posts
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState('');

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles(first_name, full_name, avatar_url, department, university),
        post_likes(user_id),
        post_comments(id, content, user_id, created_at, profiles(first_name, full_name, avatar_url))
      `)
      .order('created_at', { ascending: false })
      .limit(40);

    if (!error && data) {
      setPosts(data as any);
    }
    setIsLoading(false);
  };

  const fetchFollowing = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);
    setFollowingIds(new Set((data || []).map((f: any) => f.following_id)));
  };

  useEffect(() => {
    fetchPosts();
    fetchFollowing();

    // Real-time subscription for new posts
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, full_name, avatar_url, department, university')
        .or(`full_name.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,matric_number.ilike.%${searchQuery}%,department.ilike.%${searchQuery}%`)
        .neq('id', user?.id)
        .limit(8);
      setSearchResults(data || []);
      setIsSearching(false);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleFollow = async (targetId: string) => {
    if (!user) return;
    const isFollowing = followingIds.has(targetId);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId);
      setFollowingIds(prev => { const s = new Set(prev); s.delete(targetId); return s; });
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
      setFollowingIds(prev => new Set(prev).add(targetId));
    }
  };

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImageFile(file);
      setPostImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postContent.trim()) return;
    setIsPosting(true);

    let imageUrl: string | undefined;

    if (postImageFile) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${postImageFile.name.split('.').pop()}`;
      const { data: uploadData } = await supabase.storage
        .from('post-images')
        .upload(fileName, postImageFile, { cacheControl: '3600', upsert: true });
      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    }

    await supabase.from('posts').insert({
      user_id: user.id,
      content: postContent.trim(),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    });

    setPostContent('');
    setPostImageFile(null);
    setPostImagePreview('');
    setIsPosting(false);
    fetchPosts();
  };

  const handleLike = async (post: Post) => {
    if (!user) return;
    const alreadyLiked = post.post_likes.some(l => l.user_id === user.id);
    if (alreadyLiked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
    }
    fetchPosts();
  };

  const handleComment = async (postId: string) => {
    if (!user || !commentInputs[postId]?.trim()) return;
    await supabase.from('post_comments').insert({
      post_id: postId,
      user_id: user.id,
      content: commentInputs[postId].trim(),
    });
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    fetchPosts();
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffM = Math.floor(diffMs / 60000);
    if (diffM < 1) return 'just now';
    if (diffM < 60) return `${diffM}m ago`;
    if (diffM < 1440) return `${Math.floor(diffM / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center">
          <Rss size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Social Feed</h1>
          <p className="text-gray-500 text-sm">Connect, share, and learn with your academic community.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Box */}
          <Card className="p-4 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80">
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div className="flex gap-3">
                <Avatar
                  src={user?.avatar_url}
                  initials={user?.first_name?.charAt(0)?.toUpperCase() || '?'}
                  size="md"
                />
                <textarea
                  rows={3}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="Share a study tip, ask a question, or start a discussion..."
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                />
              </div>
              {postImagePreview && (
                <div className="relative ml-12">
                  <img src={postImagePreview} alt="Preview" className="rounded-xl max-h-48 object-cover w-full" />
                  <button
                    type="button"
                    onClick={() => { setPostImageFile(null); setPostImagePreview(''); }}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between ml-12">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handlePostImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
                  >
                    <Image size={16} /> Photo
                  </button>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!postContent.trim() || isPosting}
                  isLoading={isPosting}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Sparkles size={14} className="mr-1.5" /> Post
                </Button>
              </div>
            </form>
          </Card>

          {/* Posts Feed */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4 animate-pulse dark:bg-gray-900/50">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                  </div>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-12 text-center dark:bg-gray-900/40 border border-gray-800">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Rss className="text-primary" size={32} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Your feed is empty</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Be the first to post something! Share a study insight or tip with your academic community.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map(post => {
                const isLiked = post.post_likes.some(l => l.user_id === user?.id);
                const showComments = expandedComments[post.id];
                const authorName = post.profiles?.full_name || post.profiles?.first_name || 'Student';
                return (
                  <Card key={post.id} className="p-4 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80 hover:border-primary/20 transition-all duration-300">
                    {/* Post Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar
                        src={post.profiles?.avatar_url}
                        initials={authorName.charAt(0).toUpperCase()}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{authorName}</p>
                          {post.profiles?.department && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{post.profiles.department}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{formatTime(post.created_at)}</p>
                      </div>
                      {post.user_id !== user?.id && (
                        <button
                          onClick={() => handleFollow(post.user_id)}
                          className={`text-xs flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${
                            followingIds.has(post.user_id)
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'text-gray-500 border-gray-200 dark:border-gray-700 hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {followingIds.has(post.user_id) ? <UserCheck size={12} /> : <UserPlus size={12} />}
                          {followingIds.has(post.user_id) ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
                    {post.image_url && (
                      <img src={post.image_url} alt="Post" className="rounded-xl mb-3 max-h-64 object-cover w-full" />
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800/60">
                      <button
                        onClick={() => handleLike(post)}
                        className={`flex items-center gap-1.5 text-sm transition-all ${isLiked ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-red-400'}`}
                      >
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                        <span>{post.post_likes.length}</span>
                      </button>
                      <button
                        onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
                      >
                        <MessageCircle size={18} />
                        <span>{post.post_comments.length}</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60 space-y-3">
                        {post.post_comments.slice(0, 5).map(c => (
                          <div key={c.id} className="flex gap-2">
                            <Avatar
                              src={c.profiles?.avatar_url}
                              initials={(c.profiles?.full_name || c.profiles?.first_name || '?').charAt(0).toUpperCase()}
                              size="sm"
                            />
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 flex-1">
                              <p className="text-xs font-semibold text-gray-800 dark:text-white">{c.profiles?.full_name || c.profiles?.first_name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        {/* Add Comment */}
                        <div className="flex gap-2 mt-2">
                          <Avatar
                            src={user?.avatar_url}
                            initials={user?.first_name?.charAt(0)?.toUpperCase() || '?'}
                            size="sm"
                          />
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              className="flex-1 text-xs px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 border border-transparent focus:border-primary/30"
                              placeholder="Write a comment..."
                              value={commentInputs[post.id] || ''}
                              onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter') handleComment(post.id); }}
                            />
                            <button
                              onClick={() => handleComment(post.id)}
                              className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar — User Search & Suggestions */}
        <div className="space-y-6">
          {/* Search Users */}
          <Card className="p-4 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
              <Search size={16} className="text-primary" /> Find Students
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 border border-transparent focus:border-primary/20"
                placeholder="Search by name, dept, matric..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {isSearching && (
              <div className="flex justify-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {searchResults.map(su => (
                  <div key={su.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <Avatar
                      src={su.avatar_url}
                      initials={(su.full_name || su.first_name || '?').charAt(0).toUpperCase()}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{su.full_name || su.first_name}</p>
                      {su.department && <p className="text-xs text-gray-400 truncate">{su.department}</p>}
                    </div>
                    <button
                      onClick={() => handleFollow(su.id)}
                      className={`flex-shrink-0 p-1.5 rounded-lg border text-xs transition-all ${
                        followingIds.has(su.id)
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'text-gray-400 border-gray-200 dark:border-gray-700 hover:text-primary hover:border-primary/30'
                      }`}
                    >
                      {followingIds.has(su.id) ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && !isSearching && searchResults.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">No students found matching "{searchQuery}"</p>
            )}
          </Card>

          {/* Your Profile Card */}
          {user && (
            <Card className="p-4 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80">
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={user.avatar_url} initials={user.first_name?.charAt(0)?.toUpperCase() || '?'} size="lg" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{user.full_name || user.first_name}</p>
                  <p className="text-xs text-gray-400">{user.department || user.role}</p>
                </div>
              </div>
              {user.university && (
                <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                  🎓 {user.university}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
