import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, Loader2, Film, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useGetAllPosts, useGetAllEvents, useGetAllBuilds, useSearchUsers } from '../hooks/useQueries';
import { PostType } from '../backend';
import UserListItem from '../components/UserListItem';

export default function DiscoverPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: allPosts = [], isLoading: postsLoading } = useGetAllPosts();
  const { data: allEvents = [] } = useGetAllEvents();
  const { data: allBuilds = [] } = useGetAllBuilds();
  const { data: searchResults = [], isLoading: searchLoading } = useSearchUsers(searchQuery);

  const reelPosts = allPosts.filter(p => p.postType === PostType.reel);
  const mechanicPosts = allPosts.filter(p => p.postType === PostType.mechanic);

  const getGridItems = () => {
    switch (activeTab) {
      case 'builds': return allBuilds.map(b => ({ id: b.id, image: b.images[0] ?? null, title: b.title, type: 'build' as const }));
      case 'reels': return reelPosts.map(p => ({ id: p.id, image: p.image ?? null, title: p.caption, type: 'reel' as const }));
      case 'mechanics': return mechanicPosts.map(p => ({ id: p.id, image: p.image ?? null, title: p.caption, type: 'mechanic' as const }));
      case 'events': return allEvents.map(e => ({ id: e.id, image: e.image ?? null, title: e.title, type: 'event' as const }));
      default: return allPosts.map(p => ({ id: p.id, image: p.image ?? null, title: p.caption, type: 'post' as const }));
    }
  };

  const handleItemClick = (item: ReturnType<typeof getGridItems>[0]) => {
    switch (item.type) {
      case 'build': navigate({ to: '/builds/$buildId', params: { buildId: item.id } }); break;
      case 'reel': navigate({ to: '/reels' }); break;
      case 'mechanic': navigate({ to: '/mechanics/$postId', params: { postId: item.id } }); break;
      case 'event': navigate({ to: '/events/$eventId', params: { eventId: item.id } }); break;
      default: navigate({ to: '/' }); break;
    }
  };

  const gridItems = getGridItems();

  return (
    <div className="max-w-lg mx-auto">
      {/* Search */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users, cars, builds..."
            className="pl-9 bg-secondary border-border text-foreground"
          />
        </div>

        {/* Shortcut buttons row */}
        <div className="flex gap-2 mt-2">
          {/* Reels Search shortcut */}
          <button
            onClick={() => navigate({ to: '/reels-search' })}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border hover:border-primary/50 hover:bg-secondary/80 transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Film className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">
              Search Reels…
            </span>
          </button>

          {/* Marketplace shortcut */}
          <button
            onClick={() => navigate({ to: '/marketplace' })}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border hover:border-primary/50 hover:bg-secondary/80 transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">
              Marketplace…
            </span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="border-b border-border">
          {searchLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No users found for &quot;{searchQuery}&quot;</p>
          ) : (
            <div>
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Users</p>
              {searchResults.map(user => (
                <UserListItem key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-secondary rounded-none border-b border-border h-10 gap-0 p-0">
          {['all', 'builds', 'reels', 'mechanics', 'events'].map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-1 rounded-none text-xs font-bold uppercase tracking-wider data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {['all', 'builds', 'reels', 'mechanics', 'events'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-0">
            {postsLoading ? (
              <div className="grid grid-cols-3 gap-0.5 p-0.5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square bg-secondary animate-pulse" />
                ))}
              </div>
            ) : gridItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-muted-foreground text-sm">No content yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {gridItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="aspect-square bg-secondary overflow-hidden relative group"
                  >
                    {item.image ? (
                      <img
                        src={item.image.getDirectURL()}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <img
                          src="/assets/generated/build-placeholder.dim_800x600.png"
                          alt="placeholder"
                          className="w-full h-full object-cover opacity-30"
                        />
                      </div>
                    )}
                    {item.type === 'event' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                        <p className="text-white text-[9px] truncate">{item.title}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
