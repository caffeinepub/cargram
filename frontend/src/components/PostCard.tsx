import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type PostRecord, type User } from '../backend';
import {
  useGetLikeCount,
  useLikePost,
  useUnlikePost,
  useFollowUser,
  useUnfollowUser,
  useGetFollowing,
  useGetCallerUserProfile,
} from '../hooks/useQueries';
import CommentsSheet from './CommentsSheet';
import { toast } from 'sonner';
import { formatDistanceToNow } from '../lib/utils';

interface PostCardProps {
  post: PostRecord;
  author?: User | null;
}

export default function PostCard({ post, author }: PostCardProps) {
  const navigate = useNavigate();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const { data: likeCount = BigInt(0) } = useGetLikeCount(post.id);
  const { data: currentProfile } = useGetCallerUserProfile();
  const { data: following = [] } = useGetFollowing(currentProfile?.username);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isOwnPost = currentProfile?.username === post.authorId;
  const isFollowing = following.includes(post.authorId);

  const handleLike = async () => {
    try {
      if (liked) {
        setLiked(false);
        await unlikePost.mutateAsync(post.id);
      } else {
        setLiked(true);
        await likePost.mutateAsync(post.id);
      }
    } catch {
      setLiked(!liked);
      toast.error('Failed to update like');
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(post.authorId);
        toast.success(`Unfollowed @${post.authorId}`);
      } else {
        await followUser.mutateAsync(post.authorId);
        toast.success(`Following @${post.authorId}`);
      }
    } catch {
      toast.error('Failed to update follow');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/profile/${post.authorId}`);
    toast.success('Link copied!');
  };

  const displayLikes = Number(likeCount) + (liked ? 1 : 0);

  return (
    <article className="bg-card border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          className="flex items-center gap-3"
          onClick={() => navigate({ to: '/profile/$userId', params: { userId: post.authorId } })}
        >
          <Avatar className="w-9 h-9 border border-primary/30">
            <AvatarImage
              src={author?.profilePic ? author.profilePic.getDirectURL() : '/assets/generated/default-avatar.dim_128x128.png'}
              alt={post.authorId}
            />
            <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
              {post.authorId.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="font-semibold text-sm text-foreground leading-tight">{author?.displayName || post.authorId}</p>
            {author?.carInfo && (
              <p className="text-xs text-primary leading-tight">{author.carInfo}</p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-2">
          {!isOwnPost && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFollow}
              disabled={followUser.isPending || unfollowUser.isPending}
              className={`h-7 text-xs font-bold rounded-sm border ${
                isFollowing
                  ? 'border-border text-muted-foreground'
                  : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Image */}
      {post.image ? (
        <div className="w-full aspect-square bg-secondary overflow-hidden">
          <img
            src={post.image.getDirectURL()}
            alt={post.caption}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-square bg-secondary flex items-center justify-center">
          <img
            src="/assets/generated/build-placeholder.dim_800x600.png"
            alt="placeholder"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'text-foreground hover:text-red-400'}`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-red-500' : ''}`} />
            </button>
            <button
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {displayLikes > 0 && (
          <p className="text-sm font-semibold text-foreground mb-1">{displayLikes.toLocaleString()} likes</p>
        )}

        {post.caption && (
          <p className="text-sm text-foreground">
            <span className="font-semibold mr-1">{author?.displayName || post.authorId}</span>
            {post.caption}
          </p>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-primary">#{tag}</span>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(post.createdAt)}</p>
      </div>

      <CommentsSheet postId={post.id} open={commentsOpen} onOpenChange={setCommentsOpen} />
    </article>
  );
}
