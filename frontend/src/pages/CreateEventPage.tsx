import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AuthRequiredWrapper from '../components/AuthRequiredWrapper';
import { useCreateEvent } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Calendar, Loader2 } from 'lucide-react';

function CreateEventContent() {
  const navigate = useNavigate();
  const { mutate: createEvent, isPending } = useCreateEvent();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      toast.error('Please fill in title and date');
      return;
    }
    const dateMs = BigInt(new Date(date).getTime()) * BigInt(1_000_000);
    createEvent(
      { title, description, location, date: dateMs },
      {
        onSuccess: () => {
          toast.success('Event created!');
          navigate({ to: '/events' });
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to create event'),
      }
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-heading text-primary mb-6">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the event..."
          rows={4}
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
        />

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
        />

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Date & Time</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <AuthRequiredWrapper message="Sign in to create events">
      <CreateEventContent />
    </AuthRequiredWrapper>
  );
}
