import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetFollowers, useGetUser } from '../hooks/useQueries';
import UserListItem from '../components/UserListItem';

function FollowerItem({ userId }: { userId: string }) {
  const { data: user } = useGetUser(userId);
  if (!user) return null;
  return <UserListItem user={user} />;
}

export default function FollowersPage() {
  const { userId } = useParams({ from: '/profile/$userId/followers' });
  const navigate = useNavigate();
  const { data: followers = [], isLoading } = useGetFollowers(userId);

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/profile/$userId', params: { userId } })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading text-lg font-bold text-foreground">FOLLOWERS</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : followers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-muted-foreground text-sm">No followers yet</p>
        </div>
      ) : (
        <div>
          {followers.map(followerId => (
            <FollowerItem key={followerId} userId={followerId} />
          ))}
        </div>
      )}
    </div>
  );
}
