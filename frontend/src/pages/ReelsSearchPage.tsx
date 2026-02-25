import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, ArrowLeft, Loader2, Film } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSearchReels, useGetUser } from '../hooks/useQueries';
import { type PostRecord } from '../backend';

const REEL_CATEGORIES = ['Street', 'Stance', 'JDM', 'Drift', 'Build', 'Show', 'Track', 'Import'];

function ReelCard({ post }: { post: PostRecord }) {
  const navigate = useNavigate();
  const { data: author } = useGetUser(post.authorId);

  const handleClick = () => {
    navigate({ to: '/reels' });
  };

  return (
    <button
      onClick={handleClick}
      className="group relative rounded-lg overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-200 text-left"
    >
      {/* Thumbnail */}
      <div className="aspect-[9/16] relative overflow-hidden bg-secondary">
        {post.image ? (
          <img
            src={post.image.getDirectURL()}
            alt={post.caption}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <img
              src="/assets/generated/build-placeholder.dim_800x600.png"
              alt="reel placeholder"
              className="w-full h-full object-cover opacity-30"
            />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Category badge */}
        {post.reelCategory && (
          <div className="absolute top-2 left-2">
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {post.reelCategory}
            </span>
          </div>
        )}

        {/* Author info at bottom */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
          <Avatar className="w-6 h-6 border border-primary/60 flex-shrink-0">
            <AvatarImage
              src={author?.profilePic ? author.profilePic.getDirectURL() : '/assets/generated/default-avatar.dim_128x128.png'}
            />
            <AvatarFallback className="bg-secondary text-[9px] font-bold text-foreground">
              {post.authorId.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-white text-[11px] font-semibold truncate">@{post.authorId}</span>
        </div>
      </div>

      {/* Caption */}
      <div className="p-2">
        <p className="text-foreground text-xs line-clamp-2 leading-relaxed">
          {post.caption || 'No caption'}
        </p>
      </div>
    </button>
  );
}

function ReelCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-card border border-border">
      <Skeleton className="aspect-[9/16] w-full" />
      <div className="p-2 space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export default function ReelsSearchPage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the search query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  const { data: results = [], isLoading, isFetching } = useSearchReels(debouncedQuery);

  const handleCategoryClick = (category: string) => {
    setInputValue(category);
  };

  const showLoading = (isLoading || isFetching) && debouncedQuery.length > 0;
  const showEmpty = !showLoading && debouncedQuery.length > 0 && results.length === 0;
  const showResults = !showLoading && results.length > 0;
  const showIdle = debouncedQuery.length === 0 && inputValue.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate({ to: '/reels' })}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Search reels by category or username..."
              className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
            {(isLoading || isFetching) && debouncedQuery.length > 0 && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="max-w-lg mx-auto mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {REEL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-150 ${
                inputValue.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Idle state */}
        {showIdle && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <Film className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="font-heading text-xl font-bold text-foreground mb-1">SEARCH REELS</h2>
              <p className="text-muted-foreground text-sm">
                Type a category like <span className="text-primary font-semibold">JDM</span> or <span className="text-primary font-semibold">Drift</span>,<br />
                or search by a username to find reels.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {REEL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {showLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <ReelCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-heading text-lg font-bold text-foreground mb-1">NO REELS FOUND</h3>
              <p className="text-muted-foreground text-sm">
                No reels found matching &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Results grid */}
        {showResults && (
          <>
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
              {results.length} reel{results.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-2 gap-3">
              {results.map(post => (
                <ReelCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
