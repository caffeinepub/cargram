import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { data: profile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [carInfo, setCarInfo] = useState('');

  useEffect(() => {
    if (profile && open) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setCarInfo(profile.carInfo);
    }
  }, [profile, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    try {
      await saveProfile.mutateAsync({
        ...profile,
        displayName: displayName.trim(),
        bio: bio.trim(),
        carInfo: carInfo.trim(),
      });
      toast.success('Profile updated!');
      onOpenChange(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-foreground">EDIT PROFILE</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-foreground font-medium">Display Name *</Label>
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="bg-secondary border-border text-foreground"
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-foreground font-medium">Your Ride</Label>
            <Input
              value={carInfo}
              onChange={e => setCarInfo(e.target.value)}
              placeholder="e.g. 2020 Subaru WRX STI"
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-foreground font-medium">Bio</Label>
            <Textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="bg-secondary border-border text-foreground resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveProfile.isPending}
              className="flex-1 bg-primary text-primary-foreground font-bold"
            >
              {saveProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
