import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AuthRequiredWrapper from '../components/AuthRequiredWrapper';
import { useCreateBuild, useCreatePost } from '../hooks/useQueries';
import { PostType } from '../backend';
import { toast } from 'sonner';
import { Wrench, Image, X, Loader2 } from 'lucide-react';

function CreateBuildContent() {
  const navigate = useNavigate();
  const { mutate: createBuild, isPending } = useCreateBuild();
  const { mutate: createPost } = useCreatePost();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState('');
  const [mediaData, setMediaData] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setImageError('File too large — please select a file under 10 MB');
      return;
    }
    setImageError('');
    const reader = new FileReader();
    reader.onload = () => setMediaData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }
    createBuild(
      { title, description, specs },
      {
        onSuccess: () => {
          // Also create a post for the feed
          createPost({
            caption: title,
            tags: ['build'],
            postType: PostType.build,
            reelCategory: null,
            mediaData,
          });
          toast.success('Build showcase created!');
          navigate({ to: '/builds' });
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to create build'),
      }
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-heading text-primary mb-6">Create Build Showcase</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image upload */}
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
              <Image className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Add a photo (optional, max 10 MB)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
          {imageError && <p className="text-destructive text-sm mt-1">{imageError}</p>}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Build title (e.g. 2002 Nissan Silvia S15)"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your build..."
          rows={4}
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
        />

        <textarea
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          placeholder="Specs (engine, suspension, wheels, etc.)"
          rows={3}
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Creating...' : 'Share Build'}
        </button>
      </form>
    </div>
  );
}

export default function CreateBuildPage() {
  return (
    <AuthRequiredWrapper message="Sign in to create builds">
      <CreateBuildContent />
    </AuthRequiredWrapper>
  );
}
