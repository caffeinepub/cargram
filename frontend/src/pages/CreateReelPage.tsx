import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Film, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePost } from '../hooks/useQueries';
import { PostType } from '../backend';
import { toast } from 'sonner';

const REEL_CATEGORIES = ['Street', 'Stance', 'JDM', 'Drift', 'Build', 'Show', 'Track', 'Import'];
const MAX_FILE_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB to stay safely under ICP 2MB limit

export default function CreateReelPage() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [reelCategory, setReelCategory] = useState<string>('');
  const [mediaData, setMediaData] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast.error('Please select a video or image file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const errorMsg = `File too large (${sizeMB} MB) — please select a file under 1.5 MB`;
      setFileError(errorMsg);
      toast.error(errorMsg);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFileName(file.name);
    setMediaType(isVideo ? 'video' : 'image');

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
    setMediaType(null);
    setFileName('');
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast.error('Caption is required');
      return;
    }
    if (fileError) {
      toast.error('Please fix the file error before submitting');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    // Encode caption + mediaData as JSON so ReelsPage can parse it
    const encodedCaption = mediaData
      ? JSON.stringify({ caption: caption.trim(), mediaData })
      : caption.trim();

    try {
      await createPost.mutateAsync({
        caption: encodedCaption,
        tags,
        postType: PostType.reel,
        reelCategory: reelCategory || null,
      });
      toast.success('Reel created!');
      navigate({ to: '/reels' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create reel';
      toast.error(message.includes('size') || message.includes('limit')
        ? 'File too large for upload — try a smaller file'
        : 'Failed to create reel. Please try again.');
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
        {/* Media Upload / Preview */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Upload Video or Image</Label>
          <p className="text-xs text-muted-foreground">Max file size: 1.5 MB</p>

          {!mediaData ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[9/16] max-h-72 rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-semibold text-foreground">Tap to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Supports MP4, MOV, WebM, JPG, PNG</p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Film className="w-4 h-4" />
                <span className="text-xs">Video or Image</span>
              </div>
            </button>
          ) : (
            <div className="relative w-full aspect-[9/16] max-h-72 rounded-xl overflow-hidden bg-black">
              {mediaType === 'video' ? (
                <video
                  src={mediaData}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={mediaData}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
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
            accept="video/*,image/*"
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
              Choose File
            </Button>
          )}

          {fileError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label className="text-foreground font-medium">Category</Label>
          <Select value={reelCategory} onValueChange={setReelCategory}>
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue placeholder="Select a category..." />
            </SelectTrigger>
            <SelectContent>
              {REEL_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Caption */}
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

        {/* Tags */}
        <div className="space-y-1">
          <Label className="text-foreground font-medium">Tags</Label>
          <Input
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="e.g. drift, burnout, carshow (comma separated)"
            className="bg-secondary border-border text-foreground"
          />
        </div>

        {createPost.isError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Failed to create reel. Please try again with a smaller file or shorter caption.</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={createPost.isPending || !caption.trim() || !!fileError}
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
