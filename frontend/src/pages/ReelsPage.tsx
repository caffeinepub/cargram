import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useGetFeed, useGetUser, useGetLikeCount, useLikePost, useUnlikePost, useFollowUser, useUnfollowUser, useGetFollowing, useGetCallerUserProfile } from '../hooks/useQueries';
import { PostType, type PostRecord } from '../backend';
import CommentsSheet from '../components/CommentsSheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

function ReelItem({ post, isActive }: { post: PostRecord; isActive: boolean }) {
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { data: author } = useGetUser(post.authorId);
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
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(post.authorId);
      } else {
        await followUser.mutateAsync(post.authorId);
        toast.success(`Following @${post.authorId}`);
      }
    } catch {
      toast.error('Failed to update follow');
    }
  };

  const displayLikes = Number(likeCount) + (liked ? 1 : 0);

  return (
    <div className="relative w-full h-full flex-shrink-0 snap-start bg-black">
      {/* Background image */}
      <div className="absolute inset-0">
        {post.image ? (
          <img
            src={post.image.getDirectURL()}
            alt={post.caption}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="/assets/generated/build-placeholder.dim_800x600.png"
            alt="reel"
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* Right actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6">
        <Avatar className="w-10 h-10 border-2 border-primary">
          <AvatarImage src={author?.profilePic ? author.profilePic.getDirectURL() : '/assets/generated/default-avatar.dim_128x128.png'} />
          <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">
            {post.authorId.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`w-10 h-10 rounded-full bg-black/40 flex items-center justify-center ${liked ? 'text-red-500' : 'text-white'}`}>
            <Heart className={`w-6 h-6 ${liked ? 'fill-red-500' : ''}`} />
          </div>
          <span className="text-white text-xs font-medium">{displayLikes}</span>
        </button>

        <button onClick={() => setCommentsOpen(true)} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-white text-xs font-medium">Reply</span>
        </button>

        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </button>

        {!isOwnPost && (
          <button onClick={handleFollow} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white">
              {isFollowing ? <UserCheck className="w-6 h-6 text-primary" /> : <UserPlus className="w-6 h-6" />}
            </div>
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-4 right-16">
        <p className="text-white font-semibold text-sm mb-1">@{post.authorId}</p>
        {author?.carInfo && (
          <p className="text-primary text-xs mb-1 font-medium">{author.carInfo}</p>
        )}
        <p className="text-white/90 text-sm line-clamp-2">{post.caption}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-primary text-xs">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <CommentsSheet postId={post.id} open={commentsOpen} onOpenChange={setCommentsOpen} />
    </div>
  );
}

export default function ReelsPage() {
  const { data: reels = [], isLoading } = useGetFeed(PostType.reel);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight);
      setCurrentIndex(index);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-[calc(100vh-7rem)] flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-4xl">🎬</span>
        </div>
        <h2 className="font-heading text-2xl font-bold text-foreground">NO REELS YET</h2>
        <p className="text-muted-foreground text-center text-sm">Create the first reel by tapping the + button!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-7rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
    >
      {reels.map((reel, index) => (
        <div key={reel.id} className="h-[calc(100vh-7rem)] snap-start">
          <ReelItem post={reel} isActive={index === currentIndex} />
        </div>
      ))}
    </div>
  );
}
