import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreatePost } from '../hooks/useQueries';
import { PostType } from '../backend';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Film, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const REEL_CATEGORIES = ['Street', 'Stance', 'JDM', 'Drift', 'Build', 'Show', 'Track', 'Import'];

export default function CreateReelPage() {
  const navigate = useNavigate();
  const createPost = useCreatePost();

  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File too large — please select a file under 10 MB');
      return;
    }
    const fileIsVideo = file.type.startsWith('video/');
    setIsVideo(fileIsVideo);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setMediaPreview(result);
      setMediaBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!mediaBase64) {
      setSubmitError('Please upload a video or image for your reel.');
      return;
    }
    if (!category) {
      setSubmitError('Please select a category.');
      return;
    }

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Embed media in caption JSON
    const captionPayload = JSON.stringify({
      caption: caption.trim(),
      mediaUrl: mediaBase64,
    });

    try {
      await createPost.mutateAsync({
        caption: captionPayload,
        tags: tagList,
        postType: PostType.reel,
        reelCategory: category,
        mediaData: null,
      });
      toast.success('Reel created successfully!');
      navigate({ to: '/reels' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create reel';
      setSubmitError(message);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Create Reel</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Media Upload */}
        <div className="space-y-2">
          <Label>Video or Image *</Label>
          {mediaPreview ? (
            <div className="relative rounded-xl overflow-hidden">
              {isVideo ? (
                <video src={mediaPreview} className="w-full max-h-72 object-cover" controls />
              ) : (
                <img src={mediaPreview} alt="Preview" className="w-full max-h-72 object-cover" />
              )}
              <button
                type="button"
                onClick={() => { setMediaPreview(null); setMediaBase64(null); setIsVideo(false); }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
              <Film className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload video or image</span>
              <span className="text-xs text-muted-foreground mt-1">Max 10 MB</span>
              <input
                type="file"
                accept="video/*,image/*"
                className="hidden"
                onChange={handleMediaChange}
              />
            </label>
          )}
          {fileError && (
            <p className="text-destructive text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {fileError}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {REEL_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            placeholder="Describe your reel..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="drift, jdm, stance"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-destructive text-sm">{submitError}</p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={createPost.isPending || !mediaBase64 || !category}
        >
          {createPost.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Post Reel'
          )}
        </Button>
      </form>
    </div>
  );
}
