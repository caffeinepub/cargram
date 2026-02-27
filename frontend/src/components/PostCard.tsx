import React, { useState } from 'react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { PostRecord } from '../backend';
import { useGetLikeCount, useLikePost, useUnlikePost, useGetCallerUserProfile, useDeletePost } from '../hooks/useQueries';
import { useGuestCheck } from '../hooks/useGuestCheck';
import CommentsSheet from './CommentsSheet';
import ClickableUsername from './ClickableUsername';
import { toast } from 'sonner';

interface PostCardProps {
  post: PostRecord;
}

export default function PostCard({ post }: PostCardProps) {
  const { isGuest, requireAuth } = useGuestCheck();
  const { data: currentProfile } = useGetCallerUserProfile();
  const { data: likeCount = BigInt(0) } = useGetLikeCount(post.id);
  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();
  const { mutate: deletePost } = useDeletePost();
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const isOwner = currentProfile?.username === post.authorId;

  const handleLike = () => {
    if (!requireAuth('Sign in to like posts')) return;
    if (liked) {
      unlikePost(post.id);
      setLiked(false);
    } else {
      likePost(post.id);
      setLiked(true);
    }
  };

  const handleComment = () => {
    if (!requireAuth('Sign in to comment')) return;
    setCommentsOpen(true);
  };

  const handleDelete = () => {
    if (!currentProfile) return;
    deletePost(post.id, {
      onSuccess: () => toast.success('Post deleted'),
      onError: () => toast.error('Failed to delete post'),
    });
  };

  const formatTime = (createdAt: bigint) => {
    const ms = Number(createdAt) / 1_000_000;
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <article className="bg-card rounded-2xl overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
          {post.authorId.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <ClickableUsername userId={post.authorId} displayName={post.authorId} className="font-semibold text-sm" />
          <p className="text-xs text-muted-foreground">{formatTime(post.createdAt)}</p>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
            aria-label="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Media */}
      {post.mediaData && (
        <div className="w-full bg-muted">
          <img
            src={post.mediaData}
            alt={post.caption}
            className="w-full object-cover max-h-96"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${
            liked ? 'text-red-500' : isGuest ? 'text-muted-foreground/50' : 'text-muted-foreground hover:text-red-500'
          }`}
          title={isGuest ? 'Sign in to like posts' : undefined}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likeCount.toString()}</span>
        </button>

        <button
          onClick={handleComment}
          className={`flex items-center gap-1.5 transition-colors ${
            isGuest ? 'text-muted-foreground/50' : 'text-muted-foreground hover:text-primary'
          }`}
          title={isGuest ? 'Sign in to comment' : undefined}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">Comment</span>
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm">
            <ClickableUsername userId={post.authorId} displayName={post.authorId} className="font-semibold mr-1" />
            {post.caption}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs text-primary">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments Sheet - only open for authenticated users */}
      {!isGuest && (
        <CommentsSheet
          postId={post.id}
          open={commentsOpen}
          onClose={() => setCommentsOpen(false)}
        />
      )}
    </article>
  );
}
