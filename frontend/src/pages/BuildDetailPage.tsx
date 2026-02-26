import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Send, Loader2, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetBuild, useGetComments, useAddComment, useGetCallerUserProfile, useGetUser } from '../hooks/useQueries';
import { formatDistanceToNow } from '../lib/utils';
import { toast } from 'sonner';
import ClickableUsername from '../components/ClickableUsername';

export default function BuildDetailPage() {
  const { buildId } = useParams({ from: '/builds/$buildId' });
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [imageIndex, setImageIndex] = useState(0);

  const { data: build, isLoading: buildLoading } = useGetBuild(buildId);
  const { data: comments = [] } = useGetComments(buildId);
  const { data: currentProfile } = useGetCallerUserProfile();
  const { data: authorUser } = useGetUser(build?.authorId);
  const addComment = useAddComment();

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!currentProfile) {
      toast.error('You must be logged in to comment');
      return;
    }
    try {
      await addComment.mutateAsync({ postId: buildId, text: commentText.trim() });
      setCommentText('');
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  if (buildLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!build) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <p className="text-muted-foreground">Build not found</p>
        <Button onClick={() => navigate({ to: '/builds' })} variant="outline">Back to Builds</Button>
      </div>
    );
  }

  const images = build.images;
  const hasImages = images.length > 0;

  const authorAvatarUrl = authorUser?.profilePicData
    ? `data:image/jpeg;base64,${authorUser.profilePicData}`
    : '/assets/generated/default-avatar.dim_128x128.png';

  const authorDisplayName = authorUser?.displayName || build.authorId;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/builds' })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading text-lg font-bold text-foreground truncate">{build.title}</h2>
      </div>

      {/* Image Gallery */}
      <div className="relative w-full aspect-video bg-secondary">
        {hasImages ? (
          <>
            <img
              src={images[imageIndex].getDirectURL()}
              alt={build.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImageIndex(i => Math.max(0, i - 1))}
                  disabled={imageIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImageIndex(i => Math.min(images.length - 1, i + 1))}
                  disabled={imageIndex === images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imageIndex ? 'bg-primary' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <img
            src="/assets/generated/build-placeholder.dim_800x600.png"
            alt="build"
            className="w-full h-full object-cover opacity-50"
          />
        )}
      </div>

      {/* Build Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={authorAvatarUrl} />
            <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">
              {build.authorId.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <ClickableUsername
              userId={build.authorId}
              displayName={authorDisplayName}
              showAt
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(build.createdAt)}</p>
          </div>
        </div>

        <h3 className="font-heading text-xl font-bold text-foreground mb-2">{build.title}</h3>
        {build.description && (
          <p className="text-sm text-foreground/80 mb-3">{build.description}</p>
        )}

        {build.specs && (
          <div className="bg-secondary rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Specs</p>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{build.specs}</p>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {comments.length} Comments
        </p>

        <div className="space-y-3 mb-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src="/assets/generated/default-avatar.dim_128x128.png" />
                <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">
                  {comment.authorId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-foreground">
                  <ClickableUsername
                    userId={comment.authorId}
                    className="mr-1 text-sm"
                  />
                  {comment.text}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(comment.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-secondary border-border text-foreground"
            onKeyDown={e => e.key === 'Enter' && handleAddComment()}
          />
          <Button
            size="icon"
            onClick={handleAddComment}
            disabled={!commentText.trim() || addComment.isPending}
            className="bg-primary text-primary-foreground"
          >
            {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
