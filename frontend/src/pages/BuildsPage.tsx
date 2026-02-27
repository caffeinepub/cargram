import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllBuilds } from '../hooks/useQueries';
import { useGuestCheck } from '../hooks/useGuestCheck';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Wrench } from 'lucide-react';

export default function BuildsPage() {
  const navigate = useNavigate();
  const { isGuest, requireAuth } = useGuestCheck();
  const { data: builds = [], isLoading, isError } = useGetAllBuilds();

  const handleCreate = () => {
    if (!requireAuth('Sign in to create builds')) return;
    navigate({ to: '/builds/create' });
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Failed to load builds</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-heading text-primary">Build Showcases</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      {builds.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No builds yet. Share your build!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {builds.map((build) => (
            <button
              key={build.id}
              onClick={() => navigate({ to: '/builds/$buildId', params: { buildId: build.id } })}
              className="bg-card border border-border rounded-xl overflow-hidden text-left hover:border-primary transition-colors"
            >
              <div className="h-32 bg-muted flex items-center justify-center">
                <img
                  src="/assets/generated/build-placeholder.dim_800x600.png"
                  alt={build.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{build.title}</p>
                <p className="text-xs text-muted-foreground truncate">@{build.authorId}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
