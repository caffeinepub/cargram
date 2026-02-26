import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Car, Camera, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBuild } from '../hooks/useQueries';
import { toast } from 'sonner';

// NOTE: The ICP ingress message limit is ~2 MB per call; the 10 MB limit here applies to
// file selection/preview only. Actual encoded payload must remain within ICP limits.
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per image

export default function CreateBuildPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState('');
  const [mediaData, setMediaData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createBuild = useCreateBuild();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('Please select an image file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const errorMsg = `File too large (${sizeMB} MB) — please select a file under 10 MB`;
      setFileError(errorMsg);
      toast.error(errorMsg);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setMediaData(result);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setFileError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleClearMedia = () => {
    setMediaData(null);
    setFileName('');
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Build title is required');
      return;
    }
    if (fileError) {
      toast.error('Please fix the file error before submitting');
      return;
    }

    // Embed image data in specs if present
    const finalSpecs = mediaData
      ? JSON.stringify({ specs: specs.trim(), mediaData })
      : specs.trim();

    try {
      const buildId = await createBuild.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        specs: finalSpecs,
      });
      toast.success('Build showcase created!');
      navigate({ to: '/builds/$buildId', params: { buildId } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create build';
      toast.error(message.includes('size') || message.includes('limit')
        ? 'File too large for upload — try a smaller image'
        : 'Failed to create build. Please try again.');
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
        {/* Image Upload / Preview */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Build Photo (optional)</Label>
          <p className="text-xs text-muted-foreground">Max file size: 10 MB</p>

          {!mediaData ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-semibold text-foreground">Tap to add a build photo</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP supported</p>
              </div>
            </button>
          ) : (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
              <img
                src={mediaData}
                alt="Build Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleClearMedia}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs bg-black/50 rounded px-2 py-1 truncate">{fileName}</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!mediaData && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-border text-foreground"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>
          )}

          {fileError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
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
          disabled={createBuild.isPending || !title.trim() || !!fileError}
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
