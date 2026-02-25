import { useNavigate } from '@tanstack/react-router';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetAllPosts, useGetCallerUserProfile, useGetUser } from '../hooks/useQueries';

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
  const { data: currentProfile, isLoading } = useGetCallerUserProfile();
  const { data: allPosts = [] } = useGetAllPosts();

  const otherUsers = [...new Set(
    allPosts
      .filter(p => p.authorId !== currentProfile?.username)
      .map(p => p.authorId)
  )];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {otherUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">NO MESSAGES</h2>
          <p className="text-muted-foreground text-center text-sm">
            Follow other users and start a conversation!
          </p>
        </div>
      ) : (
        <div>
          <p className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            Community Members
          </p>
          {otherUsers.map(userId => (
            <ConversationItem
              key={userId}
              userId={userId}
              currentUserId={currentProfile?.username || ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}
