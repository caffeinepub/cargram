import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePost } from '../hooks/useQueries';
import { PostType } from '../backend';
import { toast } from 'sonner';

export default function CreateReelPage() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast.error('Caption is required');
      return;
    }
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    try {
      await createPost.mutateAsync({ caption: caption.trim(), tags, postType: PostType.reel });
      toast.success('Reel created!');
      navigate({ to: '/reels' });
    } catch {
      toast.error('Failed to create reel');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/reels' })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading text-lg font-bold text-foreground">CREATE REEL</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <div className="w-full aspect-[9/16] max-h-64 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Film className="w-10 h-10 text-purple-400" />
            <p className="text-sm font-medium">Car Reel</p>
            <p className="text-xs text-center px-4">Short-form car content for the community</p>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Caption *</Label>
          <Textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Describe your reel..."
            className="bg-secondary border-border text-foreground resize-none"
            rows={3}
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Tags</Label>
          <Input
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="e.g. drift, burnout, carshow (comma separated)"
            className="bg-secondary border-border text-foreground"
          />
        </div>

        <Button
          type="submit"
          disabled={createPost.isPending || !caption.trim()}
          className="w-full bg-primary text-primary-foreground font-heading font-bold tracking-wider h-12"
        >
          {createPost.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Posting...</>
          ) : (
            'SHARE REEL'
          )}
        </Button>
      </form>
    </div>
  );
}
