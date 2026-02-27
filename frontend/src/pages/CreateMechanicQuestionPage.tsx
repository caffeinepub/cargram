import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AuthRequiredWrapper from '../components/AuthRequiredWrapper';
import { useCreatePost } from '../hooks/useQueries';
import { PostType } from '../backend';
import { toast } from 'sonner';
import { Wrench, Image, X, Loader2 } from 'lucide-react';

function CreateMechanicQuestionContent() {
  const navigate = useNavigate();
  const { mutate: createPost, isPending } = useCreatePost();
  const [question, setQuestion] = useState('');
  const [tags, setTags] = useState('');
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
    if (!question.trim()) {
      toast.error('Please enter your question');
      return;
    }
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    createPost(
      { caption: question, tags: tagList, postType: PostType.mechanic, reelCategory: null, mediaData },
      {
        onSuccess: () => {
          toast.success('Question posted!');
          navigate({ to: '/mechanics' });
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to post question'),
      }
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-heading text-primary mb-6">Ask a Mechanic Question</h1>
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

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What's your question? (e.g. Why is my turbo making a whining noise?)"
          rows={5}
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
        />

        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated, e.g. turbo, engine, JDM)"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Posting...' : 'Post Question'}
        </button>
      </form>
    </div>
  );
}

export default function CreateMechanicQuestionPage() {
  return (
    <AuthRequiredWrapper message="Sign in to ask questions">
      <CreateMechanicQuestionContent />
    </AuthRequiredWrapper>
  );
}
