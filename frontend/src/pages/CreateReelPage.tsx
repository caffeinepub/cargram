import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AuthRequiredWrapper from '../components/AuthRequiredWrapper';
import { useCreatePost } from '../hooks/useQueries';
import { PostType } from '../backend';
import { toast } from 'sonner';
import { Film, X, Loader2 } from 'lucide-react';

const REEL_CATEGORIES = ['Street', 'Stance', 'JDM', 'Drift', 'Build', 'Show', 'Track', 'Import'];

function CreateReelContent() {
  const navigate = useNavigate();
  const { mutate: createPost, isPending } = useCreatePost();
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [mediaData, setMediaData] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState('');

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMediaError('File too large — please select a file under 10 MB');
      return;
    }
    setMediaError('');
    const reader = new FileReader();
    reader.onload = () => setMediaData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast.error('Please add a caption');
      return;
    }
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    createPost(
      { caption, tags: tagList, postType: PostType.reel, reelCategory: category || null, mediaData },
      {
        onSuccess: () => {
          toast.success('Reel created!');
          navigate({ to: '/reels' });
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to create reel'),
      }
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-heading text-primary mb-6">Create Reel</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Media upload */}
        <div>
          {mediaData ? (
            <div className="relative">
              <img src={mediaData} alt="Preview" className="w-full rounded-xl object-cover max-h-64" />
              <button
                type="button"
                onClick={() => setMediaData(null)}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary transition-colors">
              <Film className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Add video/image (optional, max 10 MB)</span>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
            </label>
          )}
          {mediaError && <p className="text-destructive text-sm mt-1">{mediaError}</p>}
        </div>

        {/* Category */}
        <div className="flex flex-wrap gap-2">
          {REEL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat === category ? '' : cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          rows={3}
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
        />

        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Uploading...' : 'Share Reel'}
        </button>
      </form>
    </div>
  );
}

export default function CreateReelPage() {
  return (
    <AuthRequiredWrapper message="Sign in to create reels">
      <CreateReelContent />
    </AuthRequiredWrapper>
  );
}
