import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Send, Loader2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useGetPost, useGetComments, useAddComment, useGetCallerUserProfile } from '../hooks/useQueries';
import { formatDistanceToNow } from '../lib/utils';
import { toast } from 'sonner';

export default function MechanicThreadPage() {
  const { postId } = useParams({ from: '/mechanics/$postId' });
  const navigate = useNavigate();
  const [answerText, setAnswerText] = useState('');

  const { data: post, isLoading: postLoading } = useGetPost(postId);
  const { data: comments = [], isLoading: commentsLoading } = useGetComments(postId);
  const { data: currentProfile } = useGetCallerUserProfile();
  const addComment = useAddComment();

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !postId) return;
    if (!currentProfile) {
      toast.error('You must be logged in to answer');
      return;
    }
    try {
      await addComment.mutateAsync({ postId, text: answerText.trim() });
      setAnswerText('');
      toast.success('Answer posted!');
    } catch {
      toast.error('Failed to post answer');
    }
  };

  if (postLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <p className="text-muted-foreground">Question not found</p>
        <Button onClick={() => navigate({ to: '/mechanics' })} variant="outline">Back to Mechanics</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/mechanics' })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading text-lg font-bold text-foreground">Q&A THREAD</h2>
      </div>

      {/* Question */}
      <div className="p-4 border-b border-border bg-card">
        {post.image && (
          <img
            src={post.image.getDirectURL()}
            alt="question"
            className="w-full rounded-lg mb-3 object-cover max-h-48"
          />
        )}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/assets/generated/default-avatar.dim_128x128.png" />
            <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">
              {post.authorId.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">@{post.authorId}</p>
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(post.createdAt)}</p>
          </div>
        </div>
        <p className="text-foreground text-sm leading-relaxed">{post.caption}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Answers */}
      <div className="flex-1 px-4 py-3 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {comments.length} {comments.length === 1 ? 'Answer' : 'Answers'}
        </p>

        {commentsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Wrench className="w-8 h-8 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No answers yet. Be the first to help!</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3 p-3 bg-card rounded-lg border border-border">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/assets/generated/default-avatar.dim_128x128.png" />
                <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">
                  {comment.authorId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">@{comment.authorId}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(comment.createdAt)}</p>
                </div>
                <p className="text-sm text-foreground">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Answer input */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <Input
          value={answerText}
          onChange={e => setAnswerText(e.target.value)}
          placeholder="Write your answer..."
          className="flex-1 bg-secondary border-border text-foreground"
          onKeyDown={e => e.key === 'Enter' && handleSubmitAnswer()}
        />
        <Button
          size="icon"
          onClick={handleSubmitAnswer}
          disabled={!answerText.trim() || addComment.isPending}
          className="bg-primary text-primary-foreground"
        >
          {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
