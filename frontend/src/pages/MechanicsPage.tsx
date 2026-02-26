import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetFeed } from '../hooks/useQueries';
import { PostType } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Wrench, Zap, Bot, RefreshCw, AlertCircle } from 'lucide-react';

export default function MechanicsPage() {
  const navigate = useNavigate();
  const { data: questions, isLoading, isError, refetch } = useGetFeed(PostType.mechanic);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <img
          src="/assets/generated/mechanics-hero.dim_800x400.png"
          alt="Mechanics Help"
          className="w-full h-40 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
          <Wrench className="w-8 h-8 text-amber-400 mb-2" />
          <h1 className="text-white text-2xl font-bold tracking-wide">MECHANICS HELP</h1>
          <p className="text-white/70 text-sm mt-1">Ask the community &amp; get AI answers</p>
        </div>
      </div>

      {/* AI Banner */}
      <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-bold text-sm tracking-wide">AI-POWERED ANSWERS</span>
        </div>
        <p className="text-foreground/80 text-sm mb-3">
          Every question gets an instant expert AI answer powered by RevGrid's automotive assistant.
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-foreground/70">Instant responses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-foreground/70">Expert-level advice</span>
          </div>
        </div>
      </div>

      {/* Ask a Question Button */}
      <Button
        onClick={() => navigate({ to: '/mechanics/create' })}
        className="w-full mb-6 bg-amber-500 hover:bg-amber-600 text-black font-bold"
      >
        <Wrench className="w-4 h-4 mr-2" />
        Ask a Question
      </Button>

      {/* Questions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-foreground font-semibold">Failed to load questions</p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      ) : !questions || questions.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...questions]
            .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
            .map((question) => {
              let displayCaption = question.caption;
              try {
                const parsed = JSON.parse(question.caption);
                if (parsed.question) displayCaption = parsed.question;
                else if (parsed.caption) displayCaption = parsed.caption;
              } catch {
                // use as-is
              }

              return (
                <button
                  key={question.id}
                  onClick={() => navigate({ to: '/mechanics/$postId', params: { postId: question.id } })}
                  className="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium text-sm line-clamp-2">{displayCaption}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-muted-foreground text-xs">@{question.authorId}</span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(Number(question.createdAt) / 1_000_000).toLocaleDateString()}
                        </span>
                      </div>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {question.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400 text-xs font-medium">AI</span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
