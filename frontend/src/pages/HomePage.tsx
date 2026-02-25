import { useRef, useCallback } from 'react';
import { useGetAllPosts, useGetUser } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Car } from 'lucide-react';
import { type PostRecord } from '../backend';

function PostCardWrapper({ post }: { post: PostRecord }) {
  const { data: author } = useGetUser(post.authorId);
  return <PostCard post={post} author={author} />;
}

export default function HomePage() {
  const { data: posts = [], isLoading, refetch } = useGetAllPosts();
  const refreshing = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    await refetch();
    refreshing.current = false;
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full bg-secondary" />
              <div className="space-y-1">
                <Skeleton className="w-24 h-3 bg-secondary" />
                <Skeleton className="w-16 h-2 bg-secondary" />
              </div>
            </div>
            <Skeleton className="w-full aspect-square bg-secondary" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <Car className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-foreground">NO POSTS YET</h2>
        <p className="text-muted-foreground text-center text-sm">
          Be the first to share your ride! Tap the + button to create a post.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-end px-4 py-2">
        <button
          onClick={handleRefresh}
          className="text-xs text-primary font-medium"
        >
          Refresh
        </button>
      </div>
      {posts.map(post => (
        <PostCardWrapper key={post.id} post={post} />
      ))}
    </div>
  );
}
