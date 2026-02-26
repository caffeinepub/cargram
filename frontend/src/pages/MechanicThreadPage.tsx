import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Send, Loader2, Wrench, Bot, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPost, useGetComments, useAddComment, useGetCallerUserProfile, useAskMechanicAI } from '../hooks/useQueries';
import { formatDistanceToNow } from '../lib/utils';
import { toast } from 'sonner';

function AIAnswerCard({ question }: { question: string }) {
  const { data: aiAnswer, isLoading, isError } = useAskMechanicAI(question);

  if (isLoading) {
    return (
      <div className="mx-4 my-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-amber-500 font-heading tracking-wide">AI ANSWER</span>
              <Badge className="text-[10px] h-4 px-1.5 bg-amber-500/20 text-amber-500 border-amber-500/30 border">
                <Sparkles className="w-2.5 h-2.5 mr-1" />
                Powered by RevGrid AI
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Generating expert automotive answer...</p>
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-amber-500/10" />
          <Skeleton className="h-4 w-5/6 bg-amber-500/10" />
          <Skeleton className="h-4 w-4/5 bg-amber-500/10" />
          <Skeleton className="h-4 w-full bg-amber-500/10" />
          <Skeleton className="h-4 w-3/4 bg-amber-500/10" />
          <Skeleton className="h-4 w-5/6 bg-amber-500/10" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-4 my-4 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm text-destructive font-medium">AI answer unavailable right now. Check community answers below.</p>
        </div>
      </div>
    );
  }

  if (!aiAnswer) return null;

  // Strip the prefix header from the backend response and render the HTML content
  const htmlContent = aiAnswer
    .replace(/^Automotive AI Response for Question: \n/, '')
    .replace(/<h2>Car Building Topics: <\/h2>[\s\S]*?<\/h2>/, '')
    .trim();

  // Extract just the detailed answer section
  const detailedAnswerMatch = aiAnswer.match(/<h2>Detailed Answer: <\/h2>([\s\S]*)/);
  const displayContent = detailedAnswerMatch ? detailedAnswerMatch[1].trim() : htmlContent;

  return (
    <div className="mx-4 my-4 rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/8 to-amber-600/4 shadow-lg shadow-amber-500/10">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-amber-500/20">
        <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 ring-2 ring-amber-500/30">
          <Bot className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-amber-500 font-heading tracking-wider">AI ANSWER</span>
            <Badge className="text-[10px] h-4 px-1.5 bg-amber-500/20 text-amber-400 border-amber-500/40 border">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              RevGrid AI
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Expert automotive knowledge</p>
        </div>
      </div>

      {/* AI Answer Content */}
      <div
        className="px-4 py-3 text-sm text-foreground leading-relaxed ai-answer-content"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />

      {/* Footer disclaimer */}
      <div className="px-4 pb-3 pt-1 border-t border-amber-500/10">
        <p className="text-[10px] text-muted-foreground/60 italic">
          AI-generated answer. Always consult a certified mechanic for safety-critical repairs.
        </p>
      </div>
    </div>
  );
}

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

      {/* AI Answer Section */}
      <AIAnswerCard question={post.caption} />

      {/* Community Answers divider */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            Community Answers
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </div>

      {/* Answers */}
      <div className="flex-1 px-4 py-2 space-y-4">
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
            <p className="text-muted-foreground text-sm">No community answers yet. Be the first to help!</p>
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
