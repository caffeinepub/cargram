import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { useSaveCallerUserProfile, useUpdateProfilePic } from '../hooks/useQueries';
import { UserProfile } from '../backend';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function EditProfileModal({ open, onClose, userProfile }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(userProfile.displayName);
  const [bio, setBio] = useState(userProfile.bio);
  const [carInfo, setCarInfo] = useState(userProfile.carInfo);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveProfile = useSaveCallerUserProfile();
  const updateProfilePic = useUpdateProfilePic();

  useEffect(() => {
    if (open) {
      setDisplayName(userProfile.displayName);
      setBio(userProfile.bio);
      setCarInfo(userProfile.carInfo);
      setSelectedImageBase64(null);
      setPreviewUrl(null);
      setFileError(null);
      setSaveError(null);
    }
  }, [open, userProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous errors
    setFileError(null);

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File too large — please select a file under ${MAX_FILE_SIZE_MB} MB`);
      // Reset the input so the same file can be re-selected after choosing a different one
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // result is a data URL like "data:image/jpeg;base64,..."
      // Extract just the base64 part
      const base64 = result.split(',')[1];
      setSelectedImageBase64(base64);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const currentAvatarUrl = previewUrl
    ? previewUrl
    : userProfile.profilePicData
    ? `data:image/jpeg;base64,${userProfile.profilePicData}`
    : '/assets/generated/default-avatar.dim_128x128.png';

  const handleSave = async () => {
    setSaveError(null);
    try {
      // Upload profile pic first if a new one was selected
      if (selectedImageBase64) {
        await updateProfilePic.mutateAsync(selectedImageBase64);
      }

      // Save profile details
      await saveProfile.mutateAsync({
        ...userProfile,
        displayName,
        bio,
        carInfo,
      });

      onClose();
    } catch (err) {
      console.error('Failed to save profile:', err);
      setSaveError('Failed to save profile. Please try again.');
    }
  };

  const isSaving = saveProfile.isPending || updateProfilePic.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={currentAvatarUrl}
                alt="Profile picture"
                className="w-24 h-24 rounded-full object-cover border-2 border-border"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-primary hover:underline font-medium"
            >
              Change profile photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {/* File size error */}
            {fileError && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2 w-full">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>

          {/* Car Info */}
          <div className="space-y-1.5">
            <Label htmlFor="carInfo">Ride Info</Label>
            <Input
              id="carInfo"
              value={carInfo}
              onChange={(e) => setCarInfo(e.target.value)}
              placeholder="e.g. 2002 Nissan Silvia S15"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              rows={3}
            />
          </div>

          {/* Save error */}
          {saveError && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
