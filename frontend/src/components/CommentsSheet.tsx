import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useGetComments, useAddComment } from '../hooks/useQueries';
import { useGuestCheck } from '../hooks/useGuestCheck';
import ClickableUsername from './ClickableUsername';
import { Send, LogIn } from 'lucide-react';
import { toast } from 'sonner';

interface CommentsSheetProps {
  postId: string;
  open: boolean;
  onClose: () => void;
}

export default function CommentsSheet({ postId, open, onClose }: CommentsSheetProps) {
  const { isGuest, requireAuth } = useGuestCheck();
  const { data: comments = [], isLoading } = useGetComments(postId);
  const { mutate: addComment, isPending } = useAddComment();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth('Sign in to comment')) return;
    if (!text.trim()) return;
    addComment(
      { postId, text: text.trim() },
      {
        onSuccess: () => setText(''),
        onError: () => toast.error('Failed to add comment'),
      }
    );
  };

  const formatTime = (createdAt: bigint) => {
    const ms = Number(createdAt) / 1_000_000;
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {comment.authorId.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <ClickableUsername userId={comment.authorId} displayName={comment.authorId} className="font-semibold text-sm" />
                    <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        {isGuest ? (
          <div className="border-t border-border pt-3">
            <button
              onClick={() => requireAuth('Sign in to comment')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in to comment
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="border-t border-border pt-3 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isPending || !text.trim()}
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-primary-foreground" />
              )}
            </button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
