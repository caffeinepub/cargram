import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllEvents, useCreateEvent } from '../hooks/useQueries';
import { Calendar, MapPin, Users, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

function EventCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border">
      <Skeleton className="w-full h-40" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function EventsPage() {
  const navigate = useNavigate();
  const { data: events, isLoading, isError, error } = useGetAllEvents();

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [createError, setCreateError] = useState('');

  const createEvent = useCreateEvent();

  const handleCreate = async () => {
    if (!title.trim() || !location.trim() || !dateStr) {
      setCreateError('Please fill in all required fields.');
      return;
    }
    setCreateError('');
    try {
      const dateMs = new Date(dateStr).getTime();
      await createEvent.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date: BigInt(dateMs),
      });
      setShowCreate(false);
      setTitle('');
      setDescription('');
      setLocation('');
      setDateStr('');
    } catch {
      setCreateError('Failed to create event. Please try again.');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="/assets/generated/events-hero.dim_1200x400.png"
          alt="Events"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-between px-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest">Events</h1>
            <p className="text-white/70 text-sm">Car meets, shows & track days</p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            size="sm"
            className="bg-primary text-primary-foreground font-bold"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load events. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Empty state */}
        {!isLoading && !isError && (!events || events.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-lg font-bold text-foreground mb-2">No Events Yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Be the first to organize a car meet, show, or track day in your area.
            </p>
            <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create First Event
            </Button>
          </div>
        )}

        {/* Events list */}
        {!isLoading && !isError && events && events.length > 0 && (
          <div className="space-y-4">
            {[...events]
              .sort((a, b) => Number(a.date) - Number(b.date))
              .map((event) => (
                <div
                  key={event.id}
                  className="bg-card rounded-xl overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate({ to: `/events/${event.id}` })}
                >
                  {/* Event image or placeholder */}
                  <div className="relative h-40 bg-muted">
                    <img
                      src="/assets/generated/events-hero.dim_1200x400.png"
                      alt={event.title}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg leading-tight">{event.title}</h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{Number(event.attendeesCount)} attending</span>
                    </div>
                    {event.description && (
                      <p className="text-foreground/80 text-sm line-clamp-2 pt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-foreground">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunday Car Meet"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-foreground">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people what to expect..."
                className="bg-background border-border text-foreground resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-foreground">Location *</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Downtown Parking Lot, LA"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-foreground">Date & Time *</Label>
              <Input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} className="border-border">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createEvent.isPending}
              className="bg-primary text-primary-foreground"
            >
              {createEvent.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
