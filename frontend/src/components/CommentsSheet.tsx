import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { useGetComments, useAddComment, useGetUser } from '../hooks/useQueries';
import { Comment } from '../backend';

interface CommentsSheetProps {
  postId: string;
  open: boolean;
  onClose: () => void;
}

function CommentItem({ comment }: { comment: Comment }) {
  const { data: authorUser } = useGetUser(comment.authorId);

  const avatarUrl = authorUser?.profilePicData
    ? `data:image/jpeg;base64,${authorUser.profilePicData}`
    : '/assets/generated/default-avatar.dim_128x128.png';

  return (
    <div className="flex items-start gap-3 py-2">
      <img
        src={avatarUrl}
        alt={comment.authorId}
        className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold text-foreground mr-1">{comment.authorId}</span>
          <span className="text-foreground">{comment.text}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(Number(comment.createdAt) / 1_000_000).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default function CommentsSheet({ postId, open, onClose }: CommentsSheetProps) {
  const [newComment, setNewComment] = useState('');
  const { data: comments, isLoading } = useGetComments(postId);
  const addComment = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment.mutateAsync({ postId, text: newComment.trim() });
    setNewComment('');
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2 divide-y divide-border">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No comments yet. Be the first!
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-border">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
            disabled={addComment.isPending}
          />
          <Button type="submit" size="icon" disabled={addComment.isPending || !newComment.trim()}>
            {addComment.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
