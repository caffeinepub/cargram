import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Calendar, MapPin, Users, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetEvent, useAttendEvent } from '../hooks/useQueries';
import { formatDateTime } from '../lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';

export default function EventDetailPage() {
  const { eventId } = useParams({ from: '/events/$eventId' });
  const navigate = useNavigate();
  const [attended, setAttended] = useState(false);

  const { data: event, isLoading } = useGetEvent(eventId);
  const attendEvent = useAttendEvent();

  const handleAttend = async () => {
    if (attended) return;
    try {
      await attendEvent.mutateAsync(eventId);
      setAttended(true);
      toast.success("You're attending! 🚗");
    } catch {
      toast.error('Failed to mark attendance');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <p className="text-muted-foreground">Event not found</p>
        <Button onClick={() => navigate({ to: '/events' })} variant="outline">Back to Events</Button>
      </div>
    );
  }

  const attendeeCount = Number(event.attendeesCount) + (attended ? 1 : 0);

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/events' })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading text-lg font-bold text-foreground truncate">{event.title}</h2>
      </div>

      {/* Event Image */}
      <div className="w-full aspect-video bg-secondary overflow-hidden">
        {event.image ? (
          <img src={event.image.getDirectURL()} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <img
            src="/assets/generated/events-hero.dim_1200x400.png"
            alt="event"
            className="w-full h-full object-cover opacity-70"
          />
        )}
      </div>

      {/* Event Details */}
      <div className="p-4 space-y-4">
        <h3 className="font-heading text-2xl font-bold text-foreground">{event.title}</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Date & Time</p>
              <p className="text-sm font-medium text-foreground">{formatDateTime(event.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium text-foreground">{event.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <Users className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Attendees</p>
              <p className="text-sm font-medium text-foreground">{attendeeCount} people attending</p>
            </div>
          </div>
        </div>

        {event.description && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</p>
            <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">Organized by @{event.organizerId}</p>

        <Button
          onClick={handleAttend}
          disabled={attended || attendEvent.isPending}
          className={`w-full h-12 font-heading font-bold tracking-wider ${
            attended
              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {attendEvent.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : attended ? (
            <><CheckCircle className="w-5 h-5 mr-2" /> YOU&apos;RE ATTENDING</>
          ) : (
            "I'M ATTENDING"
          )}
        </Button>
      </div>
    </div>
  );
}
