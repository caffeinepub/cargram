import React, { useEffect, useRef, useCallback } from 'react';
import { useInfiniteFeed } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { PostType } from '../backend';

export default function HomePage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteFeed(PostType.feed);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
    const element = loadMoreRef.current;
    if (!element) return;
    observerRef.current = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observerRef.current.observe(element);
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  const posts = data?.pages.flat() ?? [];

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">Failed to load feed</p>
        <button
          onClick={() => refetch()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-2xl mb-2">🚗</p>
        <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div ref={loadMoreRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
