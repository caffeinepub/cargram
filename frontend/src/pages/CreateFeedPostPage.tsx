import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePost } from '../hooks/useQueries';
import { PostType } from '../backend';
import { toast } from 'sonner';

export default function CreateFeedPostPage() {
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
      await createPost.mutateAsync({ caption: caption.trim(), tags, postType: PostType.feed });
      toast.success('Post created!');
      navigate({ to: '/' });
    } catch {
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading text-lg font-bold text-foreground">NEW POST</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <div className="w-full aspect-square rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Camera className="w-10 h-10 text-primary" />
            <p className="text-sm font-medium">Feed Post</p>
            <p className="text-xs text-center px-4">Share your car moment with the community</p>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Caption *</Label>
          <Textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Write a caption for your post..."
            className="bg-secondary border-border text-foreground resize-none"
            rows={4}
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Tags</Label>
          <Input
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="e.g. jdm, stance, turbo (comma separated)"
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
            'SHARE POST'
          )}
        </Button>
      </form>
    </div>
  );
}
