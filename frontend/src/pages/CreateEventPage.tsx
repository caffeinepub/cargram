import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateEvent } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateStr, setDateStr] = useState('');
  const createEvent = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !dateStr) {
      toast.error('Title, location, and date are required');
      return;
    }
    const dateMs = new Date(dateStr).getTime();
    if (isNaN(dateMs)) {
      toast.error('Invalid date');
      return;
    }
    const dateNs = BigInt(dateMs) * BigInt(1_000_000);
    try {
      const eventId = await createEvent.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date: dateNs,
      });
      toast.success('Event created!');
      navigate({ to: '/events/$eventId', params: { eventId } });
    } catch {
      toast.error('Failed to create event');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/events' })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading text-lg font-bold text-foreground">CREATE EVENT</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <div className="w-full h-32 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Calendar className="w-8 h-8 text-primary" />
            <p className="text-sm font-medium">Car Meet Event</p>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Event Title *</Label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Sunday Morning Cars & Coffee"
            className="bg-secondary border-border text-foreground"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Location *</Label>
          <Input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Downtown Parking Garage, Los Angeles CA"
            className="bg-secondary border-border text-foreground"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Date & Time *</Label>
          <Input
            type="datetime-local"
            value={dateStr}
            onChange={e => setDateStr(e.target.value)}
            className="bg-secondary border-border text-foreground"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell people what to expect at this event..."
            className="bg-secondary border-border text-foreground resize-none"
            rows={4}
          />
        </div>

        <Button
          type="submit"
          disabled={createEvent.isPending || !title.trim() || !location.trim() || !dateStr}
          className="w-full bg-primary text-primary-foreground font-heading font-bold tracking-wider h-12"
        >
          {createEvent.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</>
          ) : (
            'CREATE EVENT'
          )}
        </Button>
      </form>
    </div>
  );
}
