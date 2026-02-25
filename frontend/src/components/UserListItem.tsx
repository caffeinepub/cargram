import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type User } from '../backend';
import { useFollowUser, useUnfollowUser, useGetFollowing, useGetCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';

interface UserListItemProps {
  user: User;
}

export default function UserListItem({ user }: UserListItemProps) {
  const navigate = useNavigate();
  const { data: currentProfile } = useGetCallerUserProfile();
  const { data: following = [] } = useGetFollowing(currentProfile?.username);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isOwnProfile = currentProfile?.username === user.username;
  const isFollowing = following.includes(user.username);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(user.username);
        toast.success(`Unfollowed @${user.username}`);
      } else {
        await followUser.mutateAsync(user.username);
        toast.success(`Following @${user.username}`);
      }
    } catch {
      toast.error('Failed to update follow');
    }
  };

  return (
    <div
      className="flex items-center justify-between py-3 px-4 hover:bg-secondary/50 cursor-pointer transition-colors"
      onClick={() => navigate({ to: '/profile/$userId', params: { userId: user.username } })}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 border border-primary/20">
          <AvatarImage
            src={user.profilePic ? user.profilePic.getDirectURL() : '/assets/generated/default-avatar.dim_128x128.png'}
            alt={user.username}
          />
          <AvatarFallback className="bg-secondary text-foreground text-sm font-bold">
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm text-foreground">{user.displayName}</p>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
          {user.carInfo && <p className="text-xs text-primary">{user.carInfo}</p>}
        </div>
      </div>
      {!isOwnProfile && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleFollow}
          disabled={followUser.isPending || unfollowUser.isPending}
          className={`h-8 text-xs font-bold rounded-sm ${
            isFollowing
              ? 'border-border text-muted-foreground'
              : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
}
