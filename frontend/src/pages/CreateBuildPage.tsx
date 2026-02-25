import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Car, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBuild } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function CreateBuildPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState('');
  const createBuild = useCreateBuild();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Build title is required');
      return;
    }
    try {
      const buildId = await createBuild.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        specs: specs.trim(),
      });
      toast.success('Build showcase created!');
      navigate({ to: '/builds/$buildId', params: { buildId } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create build';
      toast.error(message || 'Failed to create build. Please try again.');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/builds' })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading text-lg font-bold text-foreground">CREATE BUILD</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Placeholder image area */}
        <div className="w-full aspect-video rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Car className="w-10 h-10 text-primary" />
            <p className="text-sm font-medium">Build Showcase</p>
            <p className="text-xs text-muted-foreground">Images can be added via URL in specs</p>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Build Title *</Label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. 2020 WRX STI Stage 3 Build"
            className="bg-secondary border-border text-foreground"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell the story of your build..."
            className="bg-secondary border-border text-foreground resize-none"
            rows={4}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-foreground font-medium">Specs & Modifications</Label>
          <Textarea
            value={specs}
            onChange={e => setSpecs(e.target.value)}
            placeholder="Engine: EJ257 2.5L Turbo&#10;Power: 400whp&#10;Turbo: Blouch 20G&#10;Suspension: Bilstein B8..."
            className="bg-secondary border-border text-foreground resize-none font-mono text-xs"
            rows={6}
          />
        </div>

        {createBuild.isError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Failed to create build showcase. Please try again.</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={createBuild.isPending || !title.trim()}
          className="w-full bg-primary text-primary-foreground font-heading font-bold tracking-wider h-12"
        >
          {createBuild.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</>
          ) : (
            'CREATE BUILD SHOWCASE'
          )}
        </Button>
      </form>
    </div>
  );
}
