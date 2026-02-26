import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreatePost } from '../hooks/useQueries';
import { PostType } from '../backend';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function CreateFeedPostPage() {
  const navigate = useNavigate();
  const createPost = useCreatePost();

  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File too large — please select a file under 10 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!caption.trim()) {
      setSubmitError('Please enter a caption.');
      return;
    }

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Embed image in caption JSON if present
    const captionPayload = imageBase64
      ? JSON.stringify({ caption: caption.trim(), mediaUrl: imageBase64 })
      : caption.trim();

    try {
      await createPost.mutateAsync({
        caption: captionPayload,
        tags: tagList,
        postType: PostType.feed,
        reelCategory: null,
        mediaData: null,
      });
      toast.success('Post created successfully!');
      navigate({ to: '/' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      setSubmitError(message);
      // toast is already shown by the mutation's onError, but we also set local state
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Photo (optional)</Label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full max-h-72 object-cover" />
              <button
                type="button"
                onClick={() => { setImagePreview(null); setImageBase64(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
              <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload a photo</span>
              <span className="text-xs text-muted-foreground mt-1">Max 10 MB</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
          {fileError && (
            <p className="text-destructive text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {fileError}
            </p>
          )}
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <Label htmlFor="caption">Caption *</Label>
          <Textarea
            id="caption"
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            required
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="jdm, stance, build"
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
          disabled={createPost.isPending || !caption.trim()}
        >
          {createPost.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            'Post'
          )}
        </Button>
      </form>
    </div>
  );
}
