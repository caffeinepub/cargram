import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useGetComments, useAddComment, useGetCallerUserProfile } from '../hooks/useQueries';
import { formatDistanceToNow } from '../lib/utils';
import { toast } from 'sonner';

interface CommentsSheetProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommentsSheet({ postId, open, onOpenChange }: CommentsSheetProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: comments = [], isLoading } = useGetComments(open ? postId : undefined);
  const { data: currentProfile } = useGetCallerUserProfile();
  const addComment = useAddComment();

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, open]);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (!currentProfile) {
      toast.error('You must be logged in to comment');
      return;
    }
    try {
      await addComment.mutateAsync({ postId, text: text.trim() });
      setText('');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-card border-border rounded-t-2xl h-[70vh] flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle className="font-heading text-lg text-foreground">COMMENTS</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src="/assets/generated/default-avatar.dim_128x128.png" />
                  <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">
                    {comment.authorId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold mr-1">{comment.authorId}</span>
                    {comment.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(comment.createdAt)}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-3 border-t border-border flex gap-2">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src="/assets/generated/default-avatar.dim_128x128.png" />
            <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">
              {currentProfile?.username?.slice(0, 2).toUpperCase() || 'ME'}
            </AvatarFallback>
          </Avatar>
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-secondary border-border text-foreground text-sm h-9"
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || addComment.isPending}
            className="w-9 h-9 bg-primary text-primary-foreground flex-shrink-0"
          >
            {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
