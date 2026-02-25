import { useNavigate } from '@tanstack/react-router';
import { Calendar, MapPin, Users, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetAllEvents } from '../hooks/useQueries';
import { formatDate } from '../lib/utils';

export default function EventsPage() {
  const navigate = useNavigate();
  const { data: events = [], isLoading } = useGetAllEvents();

  return (
    <div className="max-w-lg mx-auto">
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
        <img
          src="/assets/generated/events-hero.dim_1200x400.png"
          alt="Car Meets"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h2 className="font-heading text-2xl font-bold text-foreground">CAR MEETS & EVENTS</h2>
          <p className="text-muted-foreground text-sm">Find your next meet</p>
        </div>
      </div>

      {/* Create button */}
      <div className="px-4 py-3 border-b border-border">
        <Button
          onClick={() => navigate({ to: '/events/create' })}
          className="w-full bg-primary text-primary-foreground font-heading font-bold tracking-wider"
        >
          <Plus className="w-4 h-4 mr-2" /> CREATE EVENT
        </Button>
      </div>

      {/* Events list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 p-8">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground">NO EVENTS YET</h3>
          <p className="text-muted-foreground text-center text-sm">Create the first car meet event!</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {events.map(event => (
            <button
              key={event.id}
              onClick={() => navigate({ to: '/events/$eventId', params: { eventId: event.id } })}
              className="w-full flex gap-3 p-4 hover:bg-secondary/30 transition-colors text-left"
            >
              {event.image ? (
                <img
                  src={event.image.getDirectURL()}
                  alt={event.title}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src="/assets/generated/events-hero.dim_1200x400.png"
                    alt="event"
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-foreground text-sm">{event.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{Number(event.attendeesCount)} attending</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
