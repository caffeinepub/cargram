import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetEvent, useAttendEvent } from '../hooks/useQueries';
import { Calendar, MapPin, Users, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventDetailPage() {
  const { eventId } = useParams({ from: '/events/$eventId' });
  const navigate = useNavigate();
  const { data: event, isLoading, isError, error } = useGetEvent(eventId);
  const attendEvent = useAttendEvent();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/events' })}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-foreground">Event Details</h2>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-4 space-y-4">
          <Skeleton className="w-full h-48 rounded-xl" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load event details.'}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4 border-border"
            onClick={() => navigate({ to: '/events' })}
          >
            Back to Events
          </Button>
        </div>
      )}

      {/* Not found state */}
      {!isLoading && !isError && !event && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mb-4 opacity-40" />
          <h3 className="text-lg font-bold text-foreground mb-2">Event Not Found</h3>
          <p className="text-muted-foreground text-sm mb-6">
            This event may have been removed or the link is invalid.
          </p>
          <Button
            onClick={() => navigate({ to: '/events' })}
            className="bg-primary text-primary-foreground"
          >
            Browse Events
          </Button>
        </div>
      )}

      {/* Event content */}
      {!isLoading && !isError && event && (
        <div>
          {/* Hero image */}
          <div className="relative h-48 bg-muted">
            <img
              src="/assets/generated/events-hero.dim_1200x400.png"
              alt={event.title}
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-white text-2xl font-black leading-tight">{event.title}</h1>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Meta info */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{event.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{Number(event.attendeesCount)} attending</span>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-bold text-foreground mb-2">About This Event</h3>
                <p className="text-foreground/80 text-sm leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Organizer */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-bold text-foreground mb-1">Organizer</h3>
              <p className="text-muted-foreground text-sm">@{event.organizerId}</p>
            </div>

            {/* Attend button */}
            <Button
              className="w-full bg-primary text-primary-foreground font-bold py-3"
              disabled={attendEvent.isPending}
              onClick={() => attendEvent.mutate(event.id)}
            >
              {attendEvent.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining…
                </>
              ) : (
                "I'm Attending"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
