import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Wrench, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePost } from '../hooks/useQueries';
import { PostType } from '../backend';
import { toast } from 'sonner';

export default function CreateMechanicQuestionPage() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast.error('Please describe your question');
      return;
    }
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    try {
      await createPost.mutateAsync({ caption: caption.trim(), tags, postType: PostType.mechanic });
      toast.success('Question posted!');
      navigate({ to: '/mechanics' });
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      toast.error(message || 'Failed to post question. Please try again.');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/mechanics' })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading text-lg font-bold text-foreground">ASK A QUESTION</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <div className="flex items-center justify-center w-full h-32 rounded-xl bg-secondary border-2 border-dashed border-border">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Wrench className="w-8 h-8 text-primary" />
            <p className="text-sm font-medium">Mechanic Question</p>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Your Question *</Label>
          <Textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Describe your issue in detail. Include car make, model, year, and symptoms..."
            className="bg-secondary border-border text-foreground resize-none"
            rows={5}
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Tags</Label>
          <Input
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="e.g. engine, brakes, transmission (comma separated)"
            className="bg-secondary border-border text-foreground"
          />
          <p className="text-xs text-muted-foreground">Separate tags with commas</p>
        </div>

        {createPost.isError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Failed to post question. Please try again.</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={createPost.isPending || !caption.trim()}
          className="w-full bg-primary text-primary-foreground font-heading font-bold tracking-wider h-12"
        >
          {createPost.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Posting...</>
          ) : (
            'POST QUESTION'
          )}
        </Button>
      </form>
    </div>
  );
}
