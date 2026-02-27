import React, { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '../backend';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ProfileSetupForm() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [carInfo, setCarInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !identity) return;

    const trimmedUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (!trimmedUsername) {
      setError('Username is required');
      return;
    }
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const userId = await actor.createUser(
        trimmedUsername,
        displayName.trim() || trimmedUsername,
        bio.trim(),
        carInfo.trim()
      );

      const newProfile: UserProfile = {
        id: userId,
        username: trimmedUsername,
        displayName: displayName.trim() || trimmedUsername,
        bio: bio.trim(),
        carInfo: carInfo.trim(),
        profilePic: undefined,
        followersCount: BigInt(0),
        followingCount: BigInt(0),
        createdAt: BigInt(Date.now()),
        profilePicData: undefined,
        coverPhotoData: undefined,
      };

      await actor.saveCallerUserProfile(newProfile);
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile created! Welcome to RevGrid 🚗');
    } catch (err: any) {
      console.error('Profile setup error:', err);
      setError(err?.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-2xl p-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Username <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. speed_racer"
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={3}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Your Car
        </label>
        <input
          type="text"
          value={carInfo}
          onChange={(e) => setCarInfo(e.target.value)}
          placeholder="e.g. 2002 Nissan Silvia S15"
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-primary text-primary-foreground rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? 'Creating Profile...' : 'Join RevGrid'}
      </button>
    </form>
  );
}
