import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Heart, MessageCircle, Trash2, Volume2, VolumeX, Search, Loader2, Film } from 'lucide-react';
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

/**
 * Parse a reel's caption field which may be a JSON-encoded object
 * containing { caption, mediaData } or a plain string caption.
 */
function parseReelCaption(raw: string): { caption: string; mediaData: string | null } {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'caption' in parsed) {
      return {
        caption: parsed.caption ?? '',
        mediaData: parsed.mediaData ?? null,
      };
    }
  } catch {
    // Not JSON, treat as plain caption
  }
  return { caption: raw, mediaData: null };
}

interface ReelItemProps {
  reel: PostRecord;
  isActive: boolean;
  onDeleteRequest: (id: string) => void;
}

function ReelItem({ reel, isActive, onDeleteRequest }: ReelItemProps) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(false);
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

  // Parse caption to extract media data
  const { caption, mediaData: embeddedMediaData } = parseReelCaption(reel.caption);

  // Determine media source: prefer embedded base64, fall back to ExternalBlob URL
  const externalMediaUrl = reel.image ? reel.image.getDirectURL() : null;
  const mediaSource = embeddedMediaData ?? externalMediaUrl;

  const isVideo = embeddedMediaData
    ? embeddedMediaData.startsWith('data:video/')
    : (externalMediaUrl?.includes('.mp4') || externalMediaUrl?.includes('.webm') || externalMediaUrl?.includes('.mov')) ?? false;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = false;
      video.play().catch(() => {
        // Autoplay with sound blocked — fall back to muted
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      });
    } else {
      video.pause();
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

  return (
    <>
      <div className="relative w-full h-full bg-black flex items-center justify-center snap-start">
        {/* Media */}
        {mediaSource ? (
          isVideo ? (
            <video
              ref={videoRef}
              src={mediaSource}
              className="w-full h-full object-cover"
              loop
              playsInline
            />
          ) : (
            <img src={mediaSource} alt={caption} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center">
            <p className="text-white/40 text-lg">No media</p>
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
            <Search className="w-6 h-6" />
          </button>

          {isVideo && (
            <button
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.muted = !muted;
                }
                setMuted(!muted);
              }}
              className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="absolute right-4 bottom-28 flex flex-col items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              liked ? 'text-red-500' : 'text-white'
            }`}
          >
            <Heart className={`w-8 h-8 ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm font-semibold drop-shadow">{Number(likeCount ?? 0) + (liked ? 1 : 0)}</span>
          </button>

          <button
            onClick={() => setCommentsOpen(true)}
            className="flex flex-col items-center gap-1.5 text-white"
          >
            <MessageCircle className="w-8 h-8" />
            <span className="text-sm font-semibold drop-shadow">Comment</span>
          </button>

          {isAuthor && (
            <button
              onClick={() => onDeleteRequest(reel.id)}
              className="flex flex-col items-center gap-1.5 text-white hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-8 h-8" />
              <span className="text-sm font-semibold drop-shadow">Delete</span>
            </button>
          )}
        </div>

        {/* Bottom Author Info */}
        <div className="absolute bottom-8 left-4 right-20">
          <button
            onClick={() => navigate({ to: `/profile/${reel.authorId}` })}
            className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={authorAvatarUrl}
              alt={reel.authorId}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/70 shadow-lg"
            />
            <span className="text-white font-bold text-xl drop-shadow-lg">{reel.authorId}</span>
          </button>

          {reel.reelCategory && (
            <span className="inline-block bg-primary/80 text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full mb-2 drop-shadow">
              {reel.reelCategory}
            </span>
          )}

          {caption && (
            <p className="text-white text-lg font-medium drop-shadow-lg leading-snug line-clamp-3">{caption}</p>
          )}

          {reel.tags && reel.tags.length > 0 && (
            <p className="text-white/80 text-base mt-1.5 drop-shadow">
              {reel.tags.map((t) => `#${t}`).join(' ')}
            </p>
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
        <p className="text-white/60 text-lg">No reels yet. Be the first to post!</p>
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
