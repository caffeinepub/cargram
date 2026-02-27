import React from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetEvent, useAttendEvent } from '../hooks/useQueries';
import { useGuestCheck } from '../hooks/useGuestCheck';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const { eventId } = useParams({ from: '/events/$eventId' });
  const { isGuest, requireAuth } = useGuestCheck();
  const { data: event, isLoading, isError } = useGetEvent(eventId);
  const { mutate: attendEvent, isPending } = useAttendEvent();

  const handleAttend = () => {
    if (!requireAuth('Sign in to attend events')) return;
    attendEvent(eventId, {
      onSuccess: () => toast.success('You\'re attending!'),
      onError: () => toast.error('Failed to register attendance'),
    });
  };

  const formatDate = (date: bigint) => {
    const ms = Number(date) / 1_000_000;
    return new Date(ms).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Hero */}
      <div className="h-48 bg-muted rounded-xl overflow-hidden mb-4">
        <img
          src="/assets/generated/events-hero.dim_1200x400.png"
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      <h1 className="text-2xl font-heading text-primary mb-3">{event.title}</h1>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(event.date)}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{event.attendeesCount.toString()} attending</span>
        </div>
      </div>

      {event.description && (
        <p className="text-sm text-foreground/80 mb-6 leading-relaxed">{event.description}</p>
      )}

      <button
        onClick={handleAttend}
        disabled={isPending}
        className={`w-full py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-opacity ${
          isGuest
            ? 'bg-muted text-muted-foreground'
            : 'bg-primary text-primary-foreground hover:opacity-90'
        } disabled:opacity-50`}
        title={isGuest ? 'Sign in to attend events' : undefined}
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isGuest ? 'Sign in to Attend' : isPending ? 'Registering...' : 'Attend Event'}
      </button>
    </div>
  );
}
