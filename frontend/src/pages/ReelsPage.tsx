import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGetFeed, useDeletePost, useLikePost, useUnlikePost, useGetLikeCount, useGetCallerUserProfile } from '../hooks/useQueries';
import { PostType, type PostRecord } from '../backend';
import CommentsSheet from '../components/CommentsSheet';
import { Heart, Trash2, MessageCircle, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReelItemProps {
  post: PostRecord;
  isActive: boolean;
  currentUserId?: string;
}

function ReelItem({ post, isActive, currentUserId }: ReelItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const { data: likeCount } = useGetLikeCount(post.id);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const deletePost = useDeletePost();

  // Parse media from caption JSON
  let mediaUrl: string | null = null;
  let caption = post.caption;
  try {
    const parsed = JSON.parse(post.caption);
    if (parsed.mediaUrl) mediaUrl = parsed.mediaUrl;
    if (parsed.mediaData) mediaUrl = parsed.mediaData;
    if (parsed.caption) caption = parsed.caption;
  } catch {
    // not JSON, use caption as-is
  }

  // Also check mediaData field
  if (!mediaUrl && post.mediaData) {
    mediaUrl = post.mediaData;
  }

  const isVideo = !!(mediaUrl && (mediaUrl.startsWith('data:video') || mediaUrl.includes('video')));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    if (isActive) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If unmuted autoplay fails, try muted
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive, isMuted, isVideo]);

  const handleLike = async () => {
    try {
      if (liked) {
        await unlikePost.mutateAsync(post.id);
        setLiked(false);
      } else {
        await likePost.mutateAsync(post.id);
        setLiked(true);
      }
    } catch {
      toast.error('Failed to update like');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(post.id);
      toast.success('Reel deleted');
    } catch {
      toast.error('Failed to delete reel');
    }
  };

  const isOwner = currentUserId && post.authorId === currentUserId;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black snap-start snap-always">
      {mediaUrl ? (
        isVideo ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={isMuted}
          />
        ) : (
          <img src={mediaUrl} alt={caption} className="w-full h-full object-cover" />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-card">
          <p className="text-muted-foreground text-center px-8">{caption}</p>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      {/* Bottom info */}
      <div className="absolute bottom-20 left-4 right-16 pointer-events-none">
        <p className="text-white font-semibold text-sm">@{post.authorId}</p>
        {caption && <p className="text-white/80 text-sm mt-1 line-clamp-2">{caption}</p>}
        {post.reelCategory && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-primary/80 text-primary-foreground text-xs rounded-full">
            {post.reelCategory}
          </span>
        )}
      </div>

      {/* Right actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        {isVideo && (
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="text-white drop-shadow-lg"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        )}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <Heart
            className={`w-7 h-7 drop-shadow-lg transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
          <span className="text-white text-xs">{likeCount ? Number(likeCount) : 0}</span>
        </button>
        <button onClick={() => setCommentsOpen(true)} className="flex flex-col items-center gap-1">
          <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
        </button>
        {isOwner && (
          <button onClick={handleDelete} className="text-white drop-shadow-lg">
            <Trash2 className="w-6 h-6 text-red-400" />
          </button>
        )}
      </div>

      <CommentsSheet postId={post.id} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </div>
  );
}

export default function ReelsPage() {
  const { data: reels, isLoading, isError, refetch } = useGetFeed(PostType.reel);
  const { data: currentProfile } = useGetCallerUserProfile();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentProfile?.username;

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    setActiveIndex(newIndex);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="space-y-4 w-full max-w-sm px-4">
          <Skeleton className="w-full h-96 rounded-xl" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/2 h-4" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-semibold">Failed to load reels</p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-3 text-center px-6">
        <p className="text-muted-foreground text-lg">No reels yet</p>
        <p className="text-muted-foreground text-sm">Be the first to post a reel!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-8rem)] overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollbarWidth: 'none' }}
    >
      {reels.map((reel, index) => (
        <div key={reel.id} className="h-[calc(100vh-8rem)] snap-start snap-always">
          <ReelItem
            post={reel}
            isActive={index === activeIndex}
            currentUserId={currentUserId}
          />
        </div>
      ))}
    </div>
  );
}
