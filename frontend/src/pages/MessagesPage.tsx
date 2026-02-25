import { useNavigate } from '@tanstack/react-router';
import { MessageCircle, Loader2, Lock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetCallerUserProfile, useGetFollowers, useGetFollowing, useGetUser } from '../hooks/useQueries';

function ConversationItem({ userId, currentUserId }: { userId: string; currentUserId: string }) {
  const navigate = useNavigate();
  const { data: user } = useGetUser(userId);
  const conversationId = [currentUserId, userId].sort().join('');

  if (!user) return null;

  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border"
      onClick={() =>
        navigate({
          to: '/messages/$conversationId',
          params: { conversationId },
          state: { receiverId: userId, receiverName: user.displayName } as Record<string, unknown>,
        })
      }
    >
      <Avatar className="w-12 h-12 border border-primary/20">
        <AvatarImage
          src={user.profilePic ? user.profilePic.getDirectURL() : '/assets/generated/default-avatar.dim_128x128.png'}
          alt={user.username}
        />
        <AvatarFallback className="bg-secondary text-foreground font-bold">
          {user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left">
        <p className="font-semibold text-sm text-foreground">{user.displayName}</p>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
        {user.carInfo && <p className="text-xs text-primary">{user.carInfo}</p>}
      </div>
      <MessageCircle className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

export default function MessagesPage() {
  const { data: currentProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const currentUserId = currentProfile?.username;

  const { data: followers = [], isLoading: followersLoading } = useGetFollowers(currentUserId);
  const { data: following = [], isLoading: followingLoading } = useGetFollowing(currentUserId);

  const isLoading = profileLoading || followersLoading || followingLoading;

  // Build a deduplicated list of users with at least a one-way follow relationship
  const connectedUsers = [...new Set([...followers, ...following])].filter(
    uid => uid !== currentUserId
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {connectedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">NO CONNECTIONS</h2>
          <p className="text-muted-foreground text-center text-sm">
            Follow other users or get followed to start chatting!
          </p>
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-secondary/60 border border-border text-xs text-muted-foreground">
            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Chat is only available between users who follow each other.</span>
          </div>
        </div>
      ) : (
        <div>
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
              Your Connections
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Followers only</span>
            </div>
          </div>
          {connectedUsers.map(userId => (
            <ConversationItem
              key={userId}
              userId={userId}
              currentUserId={currentUserId || ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}
