import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetPost, useGetComments, useAddComment, useAskAutomotiveAssistant } from '../hooks/useQueries';
import { useGuestCheck } from '../hooks/useGuestCheck';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Send, LogIn } from 'lucide-react';
import { toast } from 'sonner';

function AIAnswerCard({ question }: { question: string }) {
  const { data: answer, isLoading } = useAskAutomotiveAssistant(question);

  if (isLoading) {
    return (
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">AI Answer</span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-5 h-5 text-primary" />
        <span className="font-semibold text-sm">AI Answer</span>
      </div>
      {answer && (
        <div
          className="ai-answer-content text-sm"
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      )}
    </div>
  );
}

export default function MechanicThreadPage() {
  const { postId } = useParams({ from: '/mechanics/$postId' });
  const { isGuest, requireAuth } = useGuestCheck();
  const { data: post, isLoading: postLoading } = useGetPost(postId);
  const { data: comments = [], isLoading: commentsLoading } = useGetComments(postId);
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

  if (postLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Question not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Question */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <p className="font-semibold mb-2">{post.caption}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>@{post.authorId}</span>
          {post.tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-1">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-muted px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Answer */}
      <AIAnswerCard question={post.caption} />

      {/* Community Answers */}
      <h2 className="font-heading text-primary mb-3">Community Answers ({comments.length})</h2>

      {commentsLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-xl p-3">
              <p className="text-sm">{comment.text}</p>
              <p className="text-xs text-muted-foreground mt-1">@{comment.authorId}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      {isGuest ? (
        <button
          onClick={() => requireAuth('Sign in to answer')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign in to answer
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your answer..."
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
    </div>
  );
}
