import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetFeed } from '../hooks/useQueries';
import { useGuestCheck } from '../hooks/useGuestCheck';
import { PostType } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Wrench, Bot } from 'lucide-react';

export default function MechanicsPage() {
  const navigate = useNavigate();
  const { isGuest, requireAuth } = useGuestCheck();
  const { data: questions = [], isLoading, isError } = useGetFeed(PostType.mechanic);

  const handleAsk = () => {
    if (!requireAuth('Sign in to ask questions')) return;
    navigate({ to: '/mechanics/create' });
  };

  const formatTime = (createdAt: bigint) => {
    const ms = Number(createdAt) / 1_000_000;
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Failed to load questions</p>
      </div>
    );
  }

  const sorted = [...questions].sort((a, b) => Number(b.createdAt - a.createdAt));

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* AI Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4 flex items-center gap-3">
        <Bot className="w-8 h-8 text-primary shrink-0" />
        <div>
          <p className="font-semibold text-sm">AI-Powered Answers</p>
          <p className="text-xs text-muted-foreground">Get instant expert answers to your car questions</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-heading text-primary">Mechanic Q&A</h1>
        <button
          onClick={handleAsk}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ask
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No questions yet. Ask the first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((q) => (
            <button
              key={q.id}
              onClick={() => navigate({ to: '/mechanics/$postId', params: { postId: q.id } })}
              className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary transition-colors"
            >
              <p className="font-medium text-sm line-clamp-2">{q.caption}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">@{q.authorId}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{formatTime(q.createdAt)}</span>
              </div>
              {q.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {q.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
