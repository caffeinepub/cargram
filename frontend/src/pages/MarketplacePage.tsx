import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingBag, Plus, Tag, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetAllListings, useGetUser } from '../hooks/useQueries';
import { type MarketplaceListing, Variant_new_used } from '../backend';

const CATEGORIES = ['All', 'Parts', 'Wheels', 'Audio', 'Exterior', 'Interior', 'Other'];

function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const navigate = useNavigate();
  const { data: seller } = useGetUser(listing.authorId);

  const isNew = listing.condition === Variant_new_used.new_;

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden flex flex-col cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98]"
      onClick={() => navigate({ to: '/marketplace' })}
    >
      {/* Image */}
      <div className="aspect-square bg-secondary relative overflow-hidden">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
        {listing.sold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-heading font-bold text-lg tracking-widest">SOLD</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge
            className={`text-[10px] font-bold px-1.5 py-0.5 ${
              isNew
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/90 text-muted-foreground border border-border'
            }`}
          >
            {isNew ? 'NEW' : 'USED'}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="font-heading font-bold text-foreground text-sm leading-tight line-clamp-2">{listing.title}</p>
        <p className="text-primary font-bold text-base">{listing.price}</p>
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          {seller?.profilePicData ? (
            <img
              src={seller.profilePicData}
              alt={seller.displayName}
              className="w-5 h-5 rounded-full object-cover border border-border"
            />
          ) : (
            <img
              src="/assets/generated/default-avatar.dim_128x128.png"
              alt="avatar"
              className="w-5 h-5 rounded-full object-cover border border-border"
            />
          )}
          <span className="text-xs text-muted-foreground truncate">@{listing.authorId}</span>
          <span className="ml-auto text-[10px] text-muted-foreground/60 bg-secondary px-1.5 py-0.5 rounded-full">
            {listing.category}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: listings = [], isLoading } = useGetAllListings();

  const filteredListings = selectedCategory === 'All'
    ? listings
    : listings.filter(l => l.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h1 className="font-heading font-bold text-lg text-foreground tracking-wider">MARKETPLACE</h1>
          </div>
          <Button
            onClick={() => navigate({ to: '/marketplace/create' })}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold text-xs tracking-wider gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            LIST ITEM
          </Button>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground border border-border hover:border-primary/50'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
          <img
            src="/assets/generated/marketplace-hero.dim_1200x400.jpg"
            alt="Marketplace"
            className="w-full rounded-xl object-cover opacity-60 max-h-40"
          />
          <div className="text-center">
            <p className="font-heading font-bold text-foreground text-lg tracking-wider mb-1">
              {selectedCategory === 'All' ? 'NO LISTINGS YET' : `NO ${selectedCategory.toUpperCase()} LISTINGS`}
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              {selectedCategory === 'All'
                ? 'Be the first to list a part or accessory for sale!'
                : `No ${selectedCategory.toLowerCase()} items listed yet. Check back soon!`}
            </p>
            {selectedCategory === 'All' && (
              <Button
                onClick={() => navigate({ to: '/marketplace/create' })}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold tracking-wider gap-2"
              >
                <Plus className="w-4 h-4" />
                LIST YOUR FIRST ITEM
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {filteredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
