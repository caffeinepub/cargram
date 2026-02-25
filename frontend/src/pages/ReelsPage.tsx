import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Heart, MessageCircle, Trash2, Volume2, VolumeX, Search, Loader2 } from 'lucide-react';
import { PostRecord } from '../backend';
import { useGetFeed, useGetLikeCount, useLikePost, useUnlikePost, useGetCallerUserProfile, useDeletePost, useGetUser } from '../hooks/useQueries';
import { PostType } from '../backend';
import CommentsSheet from '../components/CommentsSheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ReelItemProps {
  reel: PostRecord;
  isActive: boolean;
  onDeleteRequest: (id: string) => void;
}

function ReelItem({ reel, isActive, onDeleteRequest }: ReelItemProps) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: likeCount } = useGetLikeCount(reel.id);
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const { data: authorUser } = useGetUser(reel.authorId);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const isAuthor = currentUserProfile?.username === reel.authorId;

  const authorAvatarUrl = authorUser?.profilePicData
    ? `data:image/jpeg;base64,${authorUser.profilePicData}`
    : '/assets/generated/default-avatar.dim_128x128.png';

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  const handleLike = async () => {
    if (liked) {
      setLiked(false);
      await unlikePost.mutateAsync(reel.id);
    } else {
      setLiked(true);
      await likePost.mutateAsync(reel.id);
    }
  };

  const mediaUrl = reel.image ? reel.image.getDirectURL() : null;
  const isVideo = mediaUrl?.includes('.mp4') || mediaUrl?.includes('.webm') || mediaUrl?.includes('.mov');

  return (
    <>
      <div className="relative w-full h-full bg-black flex items-center justify-center snap-start">
        {/* Media */}
        {mediaUrl ? (
          isVideo ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-cover"
              loop
              muted={muted}
              playsInline
            />
          ) : (
            <img src={mediaUrl} alt={reel.caption} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center">
            <p className="text-white/40 text-sm">No media</p>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: '/reels-search' })}
            className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {isVideo && (
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5">
          <button
            onClick={handleLike}
            className={`flex flex-col items-center gap-1 transition-colors ${
              liked ? 'text-red-500' : 'text-white'
            }`}
          >
            <Heart className={`w-7 h-7 ${liked ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">{Number(likeCount ?? 0) + (liked ? 1 : 0)}</span>
          </button>

          <button
            onClick={() => setCommentsOpen(true)}
            className="flex flex-col items-center gap-1 text-white"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="text-xs font-medium">Comment</span>
          </button>

          {isAuthor && (
            <button
              onClick={() => onDeleteRequest(reel.id)}
              className="flex flex-col items-center gap-1 text-white hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-7 h-7" />
              <span className="text-xs font-medium">Delete</span>
            </button>
          )}
        </div>

        {/* Bottom Author Info */}
        <div className="absolute bottom-6 left-4 right-16">
          <button
            onClick={() => navigate({ to: `/profile/${reel.authorId}` })}
            className="flex items-center gap-2.5 mb-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={authorAvatarUrl}
              alt={reel.authorId}
              className="w-9 h-9 rounded-full object-cover border-2 border-white/60"
            />
            <span className="text-white font-semibold text-sm drop-shadow">{reel.authorId}</span>
          </button>

          {reel.reelCategory && (
            <span className="inline-block bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 rounded-full mb-1">
              {reel.reelCategory}
            </span>
          )}

          {reel.caption && (
            <p className="text-white text-sm drop-shadow line-clamp-2">{reel.caption}</p>
          )}
        </div>
      </div>

      <CommentsSheet postId={reel.id} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </>
  );
}

export default function ReelsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [deleteReelId, setDeleteReelId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: reels, isLoading } = useGetFeed(PostType.reel);
  const deletePost = useDeletePost();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const index = Math.round(scrollTop / height);
      setActiveIndex(index);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteReelId) return;
    await deletePost.mutateAsync(deleteReelId);
    setDeleteReelId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-4">
        <Film className="w-12 h-12 text-white/40" />
        <p className="text-white/60">No reels yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="h-screen w-full snap-start">
            <ReelItem
              reel={reel}
              isActive={index === activeIndex}
              onDeleteRequest={setDeleteReelId}
            />
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteReelId} onOpenChange={(v) => !v && setDeleteReelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reel?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The reel will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Need to import Film for the empty state
import { Film } from 'lucide-react';
