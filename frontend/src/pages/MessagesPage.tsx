import React from 'react';
import AuthRequiredWrapper from '../components/AuthRequiredWrapper';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetFollowers, useGetFollowing } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, MessageCircle } from 'lucide-react';

function MessagesContent() {
  const { identity } = useInternetIdentity();
  const { data: currentProfile } = useGetCallerUserProfile();
  const { data: followers = [] } = useGetFollowers(currentProfile?.username || '');
  const { data: following = [] } = useGetFollowing(currentProfile?.username || '');
  const navigate = useNavigate();

  // Only show users with at least a one-way follow relationship
  const connectedUserIds = React.useMemo(() => {
    const followerSet = new Set(followers);
    const followingSet = new Set(following);
    const combined = new Set([...followerSet, ...followingSet]);
    return Array.from(combined);
  }, [followers, following]);

  if (!currentProfile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Lock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Followers only</span>
      </div>

      {connectedUserIds.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No connections yet</p>
          <p className="text-sm text-muted-foreground mt-1">Follow others to start messaging</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {connectedUserIds.map((userId) => (
            <button
              key={userId}
              onClick={() => navigate({ to: '/messages/$userId', params: { userId } })}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                {userId.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">@{userId}</p>
                <p className="text-sm text-muted-foreground">Tap to message</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AuthRequiredWrapper message="Sign in to send messages">
      <MessagesContent />
    </AuthRequiredWrapper>
  );
}
