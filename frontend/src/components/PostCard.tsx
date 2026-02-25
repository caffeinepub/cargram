import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Heart, MessageCircle, Trash2, Loader2 } from 'lucide-react';
import { PostRecord } from '../backend';
import { useGetLikeCount, useLikePost, useUnlikePost, useGetCallerUserProfile, useGetUser } from '../hooks/useQueries';
import CommentsSheet from './CommentsSheet';
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

interface PostCardProps {
  post: PostRecord;
  onDeleteRequest?: (postId: string) => void;
}

export default function PostCard({ post, onDeleteRequest }: PostCardProps) {
  const navigate = useNavigate();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: likeCount } = useGetLikeCount(post.id);
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const { data: authorUser } = useGetUser(post.authorId);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const isAuthor = currentUserProfile?.username === post.authorId;

  const authorAvatarUrl = authorUser?.profilePicData
    ? `data:image/jpeg;base64,${authorUser.profilePicData}`
    : '/assets/generated/default-avatar.dim_128x128.png';

  const handleLike = async () => {
    if (liked) {
      setLiked(false);
      await unlikePost.mutateAsync(post.id);
    } else {
      setLiked(true);
      await likePost.mutateAsync(post.id);
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    if (onDeleteRequest) {
      onDeleteRequest(post.id);
    }
  };

  const imageUrl = post.image ? post.image.getDirectURL() : null;

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Author Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            onClick={() => navigate({ to: `/profile/${post.authorId}` })}
          >
            <img
              src={authorAvatarUrl}
              alt={post.authorId}
              className="w-9 h-9 rounded-full object-cover border border-border"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground leading-tight">{post.authorId}</p>
              {post.reelCategory && (
                <p className="text-xs text-primary">{post.reelCategory}</p>
              )}
            </div>
          </button>

          {isAuthor && onDeleteRequest && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Post Image */}
        {imageUrl && (
          <div className="aspect-square w-full bg-muted">
            <img src={imageUrl} alt={post.caption} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-2 flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span>{Number(likeCount ?? 0) + (liked ? 1 : 0)}</span>
          </button>

          <button
            onClick={() => setCommentsOpen(true)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="px-4 pb-3">
            <p className="text-sm text-foreground">
              <span className="font-semibold mr-1">{post.authorId}</span>
              {post.caption}
            </p>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-1">
            {post.tags.map((tag, i) => (
              <span key={i} className="text-xs text-primary">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <CommentsSheet postId={post.id} open={commentsOpen} onClose={() => setCommentsOpen(false)} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
