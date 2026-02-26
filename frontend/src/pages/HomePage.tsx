import React, { useEffect, useRef, useCallback } from 'react';
import { useInfiniteFeed } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteFeed();

  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

  const allPosts = data?.pages.flat() ?? [];

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-border bg-card">
            <div className="p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="w-full h-64" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-foreground font-semibold">Failed to load feed</p>
        <p className="text-muted-foreground text-sm">{(error as Error)?.message ?? 'Unknown error'}</p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {allPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No posts yet.</p>
          <p className="text-muted-foreground text-sm mt-2">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasNextPage && allPosts.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-6">
          You've reached the end of the feed
        </p>
      )}
    </div>
  );
}
