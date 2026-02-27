import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AuthRequiredWrapper from '../components/AuthRequiredWrapper';
import { useCreateListing } from '../hooks/useQueries';
import { Variant_new_used } from '../backend';
import { toast } from 'sonner';
import { ShoppingBag, Image, X, Loader2 } from 'lucide-react';

const CATEGORIES = ['Engine Parts', 'Suspension', 'Wheels & Tires', 'Body & Exterior', 'Interior', 'Electronics', 'Tools', 'Other'];

function CreateListingContent() {
  const navigate = useNavigate();
  const { mutate: createListing, isPending } = useCreateListing();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<Variant_new_used>(Variant_new_used.used);
  const [category, setCategory] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
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
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) {
      toast.error('Please fill in title and price');
      return;
    }
    createListing(
      {
        title,
        description,
        price,
        condition,
        category: category || 'Other',
        imageUrl: imageData || '',
      },
      {
        onSuccess: () => {
          toast.success('Listing created!');
          navigate({ to: '/marketplace' });
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to create listing'),
      }
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-heading text-primary mb-6">List for Sale</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image upload */}
        <div>
          {imageData ? (
            <div className="relative">
              <img src={imageData} alt="Preview" className="w-full rounded-xl object-cover max-h-64" />
              <button
                type="button"
                onClick={() => setImageData(null)}
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
          placeholder="Item title"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the item..."
          rows={3}
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (e.g. $150 or OBO)"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
        />

        {/* Condition */}
        <div className="flex gap-3">
          {[Variant_new_used.new_, Variant_new_used.used].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondition(c)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                condition === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {c === Variant_new_used.new_ ? 'New' : 'Used'}
            </button>
          ))}
        </div>

        {/* Category */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat === category ? '' : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <AuthRequiredWrapper message="Sign in to create listings">
      <CreateListingContent />
    </AuthRequiredWrapper>
  );
}
