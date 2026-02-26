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

// NOTE: The ICP ingress message limit is ~2 MB per call; the 10 MB limit here applies to
// file selection/preview only. Actual encoded payload must remain within ICP limits.
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
      setImageError('File too large — please select a file under 10 MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.onerror = () => {
      setImageError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setImageBase64('');
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!price.trim()) { toast.error('Price is required'); return; }
    if (!category) { toast.error('Category is required'); return; }
    if (imageError) { toast.error('Please fix the image error before submitting'); return; }

    const conditionValue = condition === 'new' ? Variant_new_used.new_ : Variant_new_used.used;

    try {
      await createListing.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        condition: conditionValue,
        category,
        imageUrl: imageBase64,
      });
      toast.success('Listing created!');
      navigate({ to: '/marketplace' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create listing';
      setSubmitError(message.includes('size') || message.includes('limit')
        ? 'Image too large for upload — try a smaller image'
        : 'Failed to create listing. Please try again.');
      toast.error('Failed to create listing');
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/marketplace' })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading text-lg font-bold text-foreground">LIST ITEM FOR SALE</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Item Photo</Label>
          <p className="text-xs text-muted-foreground">Max file size: 10 MB</p>

          {!imagePreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-semibold text-foreground">Tap to add a photo</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP supported</p>
              </div>
            </button>
          ) : (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
              <img src={imagePreview} alt="Item preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!imagePreview && (
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

          {imageError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{imageError}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <Label className="text-foreground font-medium">Title *</Label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Enkei RPF1 18x9.5 +38 Set of 4"
            className="bg-secondary border-border text-foreground"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label className="text-foreground font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the item, condition details, fitment info..."
            className="bg-secondary border-border text-foreground resize-none"
            rows={4}
          />
        </div>

        {/* Price */}
        <div className="space-y-1">
          <Label className="text-foreground font-medium">Price *</Label>
          <Input
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="e.g. $450 OBO"
            className="bg-secondary border-border text-foreground"
            required
          />
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Condition *</Label>
          <RadioGroup
            value={condition}
            onValueChange={(v) => setCondition(v as 'new' | 'used')}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="new" id="cond-new" className="border-border text-primary" />
              <Label htmlFor="cond-new" className="text-foreground cursor-pointer">New</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="used" id="cond-used" className="border-border text-primary" />
              <Label htmlFor="cond-used" className="text-foreground cursor-pointer">Used</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label className="text-foreground font-medium">Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat} className="text-foreground">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={createListing.isPending || !title.trim() || !price.trim() || !category || !!imageError}
          className="w-full bg-primary text-primary-foreground font-heading font-bold tracking-wider h-12"
        >
          {createListing.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating Listing...</>
          ) : (
            'LIST FOR SALE'
          )}
        </Button>
      </form>
    </div>
  );
}
