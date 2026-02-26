import { useNavigate } from '@tanstack/react-router';
import { Trophy, Flag, Zap, Users, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetLeaderboard } from '../hooks/useQueries';
import ClickableUsername from '../components/ClickableUsername';

// Checkered flag pattern as SVG inline
function CheckeredFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0,1,2,3,4,5,6,7,8,9].map(col =>
        [0,1,2,3,4,5].map(row => (
          <rect
            key={`${col}-${row}`}
            x={col * 8}
            y={row * 8}
            width={8}
            height={8}
            fill={(col + row) % 2 === 0 ? 'currentColor' : 'transparent'}
          />
        ))
      )}
    </svg>
  );
}

const PODIUM_STYLES = [
  {
    rank: 1,
    label: '1ST',
    bg: 'bg-amber-500/20 border-amber-500/60',
    badge: 'bg-amber-500 text-black',
    glow: 'shadow-amber-lg',
    icon: '🥇',
    height: 'h-20',
    textColor: 'text-amber-400',
    ringColor: 'ring-amber-500',
  },
  {
    rank: 2,
    label: '2ND',
    bg: 'bg-asphalt-300/20 border-asphalt-200/50',
    badge: 'bg-asphalt-200 text-black',
    glow: '',
    icon: '🥈',
    height: 'h-14',
    textColor: 'text-asphalt-100',
    ringColor: 'ring-asphalt-200',
  },
  {
    rank: 3,
    label: '3RD',
    bg: 'bg-amber-800/20 border-amber-700/40',
    badge: 'bg-amber-700 text-white',
    glow: '',
    icon: '🥉',
    height: 'h-10',
    textColor: 'text-amber-700',
    ringColor: 'ring-amber-700',
  },
];

function PodiumCard({
  user,
  rank,
  onClick,
}: {
  user: { username: string; displayName: string; followersCount: bigint; postCount: bigint; profilePicData?: string };
  rank: number;
  onClick: () => void;
}) {
  const style = PODIUM_STYLES[rank - 1];
  const avatarSrc = user.profilePicData
    ? `data:image/jpeg;base64,${user.profilePicData}`
    : '/assets/generated/default-avatar.dim_128x128.png';

  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${style.bg} ${style.glow} transition-transform w-full`}
    >
      <span className="text-2xl">{style.icon}</span>
      <button
        onClick={onClick}
        className="relative w-14 h-14 rounded-full ring-2 overflow-hidden hover:opacity-80 transition-opacity"
        style={{ ['--tw-ring-color' as string]: undefined }}
      >
        <img src={avatarSrc} alt={user.username} className={`w-full h-full object-cover ring-2 ${style.ringColor} rounded-full`} />
      </button>
      <div className="text-center">
        <ClickableUsername
          userId={user.username}
          displayName={`@${user.username}`}
          className={`font-heading font-bold text-sm tracking-wide ${style.textColor}`}
        />
        <p className="text-xs text-muted-foreground truncate max-w-[80px]">{user.displayName}</p>
      </div>
      <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
        {Number(user.followersCount).toLocaleString()} followers
      </div>
      <div className={`${style.height} w-full rounded-sm mt-1 ${style.badge} opacity-30`} />
    </div>
  );
}

function RaceRow({
  user,
  rank,
  onClick,
}: {
  user: { username: string; displayName: string; followersCount: bigint; postCount: bigint; profilePicData?: string };
  rank: number;
  onClick: () => void;
}) {
  const avatarSrc = user.profilePicData
    ? `data:image/jpeg;base64,${user.profilePicData}`
    : '/assets/generated/default-avatar.dim_128x128.png';

  const isTop10 = rank <= 10;

  return (
    <div
      className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-card/80 transition-all group"
    >
      {/* Rank number */}
      <div className={`w-8 h-8 flex items-center justify-center rounded-sm font-heading font-bold text-sm flex-shrink-0 ${
        isTop10 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
      }`}>
        {rank}
      </div>

      {/* Speed line decoration */}
      <div className="flex-shrink-0 flex flex-col gap-0.5 opacity-30 group-hover:opacity-60 transition-opacity">
        <div className="w-4 h-0.5 bg-primary rounded-full" />
        <div className="w-3 h-0.5 bg-primary rounded-full" />
        <div className="w-2 h-0.5 bg-primary rounded-full" />
      </div>

      {/* Avatar — clicking avatar navigates to profile */}
      <button onClick={onClick} className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-border group-hover:ring-primary/40 transition-all">
        <img src={avatarSrc} alt={user.username} className="w-full h-full object-cover" />
      </button>

      {/* User info */}
      <div className="flex-1 text-left min-w-0">
        <ClickableUsername
          userId={user.username}
          displayName={`@${user.username}`}
          className="font-heading font-bold text-sm tracking-wide truncate block"
        />
        <p className="text-xs text-muted-foreground truncate">{user.displayName}</p>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-primary font-semibold">
          <Users className="w-3 h-3" />
          <span>{Number(user.followersCount).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="w-3 h-3" />
          <span>{Number(user.postCount)}</span>
        </div>
      </div>

      {/* Chevron */}
      <Zap className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors flex-shrink-0" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg">
      <Skeleton className="w-8 h-8 rounded-sm" />
      <div className="flex flex-col gap-0.5">
        <Skeleton className="w-4 h-0.5" />
        <Skeleton className="w-3 h-0.5" />
      </div>
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2 w-16" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-2 w-8" />
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { data: leaderboard, isLoading, error } = useGetLeaderboard();

  const top3 = leaderboard?.slice(0, 3) ?? [];
  const rest = leaderboard?.slice(3) ?? [];

  const handleUserClick = (username: string) => {
    navigate({ to: '/profile/$userId', params: { userId: username } });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Race flag banner header */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/race-flag-banner.dim_1200x300.png"
          alt="Race Leaderboard"
          className="w-full h-32 object-cover object-center"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        {/* Header content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
            <CheckeredFlag className="w-8 h-8 text-foreground opacity-80" />
            <h1 className="font-heading text-3xl font-bold text-foreground tracking-widest drop-shadow-lg">
              RACE BOARD
            </h1>
            <CheckeredFlag className="w-8 h-8 text-foreground opacity-80" />
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium">
            Most Popular Drivers
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {/* Error state */}
        {error && (
          <div className="text-center py-8">
            <p className="text-destructive text-sm">Failed to load leaderboard</p>
          </div>
        )}

        {/* Podium — top 3 */}
        {!isLoading && top3.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Top Racers</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {top3.map((user, i) => (
                <PodiumCard
                  key={user.username}
                  user={user as any}
                  rank={i + 1}
                  onClick={() => handleUserClick(user.username)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ranked list */}
        <div>
          {top3.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Grid</p>
            </div>
          )}

          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : rest.length > 0 ? (
              rest.map((user, i) => (
                <RaceRow
                  key={user.username}
                  user={user as any}
                  rank={i + 4}
                  onClick={() => handleUserClick(user.username)}
                />
              ))
            ) : !isLoading && leaderboard?.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No racers yet. Be the first!</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
