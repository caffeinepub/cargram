import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateListing } from '../hooks/useQueries';
import { Variant_new_used } from '../backend';

const CATEGORIES = ['Parts', 'Wheels', 'Audio', 'Exterior', 'Interior', 'Other'];
const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB

export default function CreateListingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createListing = useCreateListing();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'new' | 'used'>('used');
  const [category, setCategory] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageError, setImageError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image must be under 1.5 MB. Please choose a smaller file.');
      e.target.value = '';
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

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64('');
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!title.trim()) { setSubmitError('Please enter an item title.'); return; }
    if (!price.trim()) { setSubmitError('Please enter a price.'); return; }
    if (!category) { setSubmitError('Please select a category.'); return; }

    const backendCondition = condition === 'new' ? Variant_new_used.new_ : Variant_new_used.used;

    try {
      await createListing.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        condition: backendCondition,
        category,
        imageUrl: imageBase64,
      });
      toast.success('Listing created successfully!');
      navigate({ to: '/marketplace' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create listing. Please try again.';
      setSubmitError(message);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/marketplace' })}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="font-heading font-bold text-lg text-foreground tracking-wider">LIST ITEM FOR SALE</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-foreground font-semibold">Item Photo</Label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-secondary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-semibold text-sm">Upload a photo</p>
                <p className="text-muted-foreground text-xs mt-0.5">Max 1.5 MB · JPG, PNG, WebP</p>
              </div>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {imageError && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{imageError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground font-semibold">Item Title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. OEM Honda Civic Type R Spoiler"
            className="bg-secondary border-border text-foreground"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground font-semibold">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the item, its condition, fitment, etc."
            className="bg-secondary border-border text-foreground resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-foreground font-semibold">Price <span className="text-destructive">*</span></Label>
          <Input
            id="price"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="$ e.g. $250 or OBO"
            className="bg-secondary border-border text-foreground"
            maxLength={50}
          />
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label className="text-foreground font-semibold">Condition <span className="text-destructive">*</span></Label>
          <RadioGroup
            value={condition}
            onValueChange={(val) => setCondition(val as 'new' | 'used')}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="new" id="cond-new" className="border-primary text-primary" />
              <Label htmlFor="cond-new" className="text-foreground cursor-pointer font-medium">New</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="used" id="cond-used" className="border-primary text-primary" />
              <Label htmlFor="cond-used" className="text-foreground cursor-pointer font-medium">Used</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-foreground font-semibold">Category <span className="text-destructive">*</span></Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat} className="text-foreground hover:bg-secondary">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Error */}
        {submitError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={createListing.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold tracking-wider text-sm h-12 gap-2"
        >
          {createListing.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              LISTING...
            </>
          ) : (
            'LIST FOR SALE'
          )}
        </Button>
      </form>
    </div>
  );
}
