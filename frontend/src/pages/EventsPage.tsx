import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllEvents } from '../hooks/useQueries';
import { useGuestCheck } from '../hooks/useGuestCheck';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, MapPin } from 'lucide-react';

export default function EventsPage() {
  const navigate = useNavigate();
  const { isGuest, requireAuth } = useGuestCheck();
  const { data: events = [], isLoading, isError } = useGetAllEvents();

  const handleCreate = () => {
    if (!requireAuth('Sign in to create events')) return;
    navigate({ to: '/events/create' });
  };

  const formatDate = (date: bigint) => {
    const ms = Number(date) / 1_000_000;
    return new Date(ms).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Failed to load events</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => Number(b.date - a.date));

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-heading text-primary">Events</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No events yet. Create one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => navigate({ to: '/events/$eventId', params: { eventId: event.id } })}
              className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{event.title}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-muted-foreground">{event.attendeesCount.toString()} attending</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
