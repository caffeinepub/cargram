import { type ReactNode, useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useCreateUser } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import LandingPage from './LandingPage';

interface AuthGateProps {
  children: ReactNode;
}

const AUTH_TIMEOUT_MS = 10_000;

export default function AuthGate({ children }: AuthGateProps) {
  const { clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const createUser = useCreateUser();

  // Always start as false — intro must play on every fresh page load
  const [introComplete, setIntroComplete] = useState(false);

  const [showSetup, setShowSetup] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [carInfo, setCarInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timeout state: if auth init takes too long, fall through to landing page
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isInitializing && !authTimedOut) {
      timeoutRef.current = setTimeout(() => {
        console.warn('[AuthGate] Auth initialization timed out after 10s — falling back to landing page');
        setAuthTimedOut(true);
      }, AUTH_TIMEOUT_MS);
    }

    if (!isInitializing) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setAuthTimedOut(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isInitializing, authTimedOut]);

  // Profile loading timeout: if profile query stalls after auth, fall through
  const [profileTimedOut, setProfileTimedOut] = useState(false);
  const profileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAuthenticated && profileLoading && !isFetched && !profileTimedOut) {
      profileTimeoutRef.current = setTimeout(() => {
        console.warn('[AuthGate] Profile loading timed out after 10s — rendering app anyway');
        setProfileTimedOut(true);
      }, AUTH_TIMEOUT_MS);
    }

    if (!profileLoading || isFetched) {
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
        profileTimeoutRef.current = null;
      }
    }

    return () => {
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
        profileTimeoutRef.current = null;
      }
    };
  }, [isAuthenticated, profileLoading, isFetched, profileTimedOut]);

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (showProfileSetup) {
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [showProfileSetup]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) {
      toast.error('Username and display name are required');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }
    setIsSubmitting(true);
    try {
      const userId = await createUser.mutateAsync({ username, displayName, bio, carInfo });
      const profile = {
        id: userId,
        username,
        displayName,
        bio,
        carInfo,
        profilePic: undefined,
        followersCount: BigInt(0),
        followingCount: BigInt(0),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      };
      await saveProfile.mutateAsync(profile);
      toast.success('Profile created! Welcome to RevGrid 🚗');
      setShowSetup(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create profile';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Always show the intro slideshow first on every app load.
  // Pass isAuthenticated={false} so LandingPage never auto-forwards during the intro.
  // After the intro completes (onIntroComplete), AuthGate decides what to show next.
  if (!introComplete) {
    return (
      <LandingPage
        isAuthenticated={false}
        onIntroComplete={() => setIntroComplete(true)}
      />
    );
  }

  // Step 2: Intro done. If still initializing auth (rare edge case), show a brief spinner.
  if (isInitializing && !authTimedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/assets/generated/revgrid-logo.dim_256x256.png" alt="RevGrid" className="w-20 h-20 object-contain" />
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Step 3: Not authenticated — show landing page login UI (intro already done, skip straight to login)
  if (!isAuthenticated || authTimedOut) {
    return (
      <LandingPage
        isAuthenticated={false}
        onIntroComplete={() => setIntroComplete(true)}
        skipIntroImmediately
      />
    );
  }

  // Step 4: Profile setup for new users
  if (showSetup) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src="/assets/generated/revgrid-logo.dim_256x256.png" alt="RevGrid" className="w-16 h-16 object-contain" />
            <h1 className="font-heading text-3xl font-bold text-primary">SET UP YOUR PROFILE</h1>
            <p className="text-muted-foreground text-sm text-center">Tell the community about you and your ride</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username" className="text-foreground font-medium">Username *</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase())}
                placeholder="e.g. turbo_mike"
                className="bg-card border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="displayName" className="text-foreground font-medium">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Mike Turbo"
                className="bg-card border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="carInfo" className="text-foreground font-medium">Your Ride</Label>
              <Input
                id="carInfo"
                value={carInfo}
                onChange={e => setCarInfo(e.target.value)}
                placeholder="e.g. 2020 Subaru WRX STI"
                className="bg-card border-border text-foreground"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bio" className="text-foreground font-medium">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="bg-card border-border text-foreground resize-none"
                rows={3}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground font-heading text-lg font-bold tracking-wider h-12 rounded-sm"
            >
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Creating...</> : 'JOIN REVGRID'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => { clear(); }}
              className="w-full text-muted-foreground"
            >
              Cancel & Logout
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Step 5: Loading profile after auth — with timeout fallback
  if (profileLoading && isAuthenticated && !profileTimedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/assets/generated/revgrid-logo.dim_256x256.png" alt="RevGrid" className="w-16 h-16 object-contain" />
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
