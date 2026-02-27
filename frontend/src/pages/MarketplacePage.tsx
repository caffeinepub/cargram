import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllListings } from '../hooks/useQueries';
import { useGuestCheck } from '../hooks/useGuestCheck';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ShoppingBag } from 'lucide-react';
import ClickableUsername from '../components/ClickableUsername';

const CATEGORIES = ['All', 'Engine Parts', 'Suspension', 'Wheels & Tires', 'Body & Exterior', 'Interior', 'Electronics', 'Tools', 'Other'];

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { isGuest, requireAuth } = useGuestCheck();
  const { data: listings = [], isLoading, isError } = useGetAllListings();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCreate = () => {
    if (!requireAuth('Sign in to create listings')) return;
    navigate({ to: '/marketplace/create' });
  };

  const filtered = selectedCategory === 'All'
    ? listings
    : listings.filter((l) => l.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Failed to load listings</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-heading text-primary">Marketplace</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Sell
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((listing) => (
            <div
              key={listing.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="h-32 bg-muted">
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{listing.title}</p>
                <p className="text-primary font-bold text-sm">{listing.price}</p>
                <div className="flex items-center justify-between mt-1" onClick={(e) => e.stopPropagation()}>
                  <ClickableUsername
                    userId={listing.authorId}
                    displayName={listing.authorId}
                    showAt
                    className="text-xs font-normal text-muted-foreground truncate"
                  />
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    listing.condition === 'new' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {listing.condition === 'new' ? 'New' : 'Used'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
