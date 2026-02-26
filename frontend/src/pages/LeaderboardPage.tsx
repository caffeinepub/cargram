import { useNavigate } from '@tanstack/react-router';
import { Trophy, Flag, Zap, Users, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetLeaderboard } from '../hooks/useQueries';

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
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${style.bg} ${style.glow} transition-transform active:scale-95 hover:scale-105 cursor-pointer w-full`}
    >
      <span className="text-2xl">{style.icon}</span>
      <div className={`relative w-14 h-14 rounded-full ring-2 ${style.ringColor} overflow-hidden`}>
        <img src={avatarSrc} alt={user.username} className="w-full h-full object-cover" />
      </div>
      <div className="text-center">
        <p className={`font-heading font-bold text-sm tracking-wide ${style.textColor}`}>
          @{user.username}
        </p>
        <p className="text-xs text-muted-foreground truncate max-w-[80px]">{user.displayName}</p>
      </div>
      <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
        {Number(user.followersCount).toLocaleString()} followers
      </div>
      <div className={`${style.height} w-full rounded-sm mt-1 ${style.badge} opacity-30`} />
    </button>
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
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-card/80 transition-all active:scale-[0.99] group"
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

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-border group-hover:ring-primary/40 transition-all">
        <img src={avatarSrc} alt={user.username} className="w-full h-full object-cover" />
      </div>

      {/* User info */}
      <div className="flex-1 text-left min-w-0">
        <p className="font-heading font-bold text-sm text-foreground tracking-wide truncate">
          @{user.username}
        </p>
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
    </button>
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

      {/* Racing stripe divider */}
      <div className="h-1.5 racing-stripe opacity-60" />

      <div className="px-4 pt-4 space-y-6">

        {/* Loading state */}
        {isLoading && (
          <>
            {/* Podium skeleton */}
            <div className="flex items-end justify-center gap-3 pt-2">
              <Skeleton className="flex-1 h-48 rounded-lg" />
              <Skeleton className="flex-1 h-56 rounded-lg" />
              <Skeleton className="flex-1 h-44 rounded-lg" />
            </div>
            {/* Row skeletons */}
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Flag className="w-12 h-12 text-destructive opacity-60" />
            <p className="text-muted-foreground text-sm">Failed to load leaderboard</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && leaderboard?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <Trophy className="w-16 h-16 text-primary opacity-40" />
              <CheckeredFlag className="w-8 h-8 text-muted-foreground absolute -bottom-2 -right-2" />
            </div>
            <div className="text-center">
              <p className="font-heading text-lg font-bold text-foreground tracking-wide">NO RACERS YET</p>
              <p className="text-muted-foreground text-sm mt-1">Be the first to join the grid!</p>
            </div>
          </div>
        )}

        {/* Podium — top 3 */}
        {!isLoading && !error && top3.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-primary" />
              <h2 className="font-heading text-sm font-bold text-primary tracking-widest uppercase">
                Podium Finishers
              </h2>
            </div>

            {/* Podium layout: 2nd | 1st | 3rd */}
            <div className="flex items-end justify-center gap-2">
              {top3[1] && (
                <div className="flex-1">
                  <PodiumCard user={top3[1]} rank={2} onClick={() => handleUserClick(top3[1].username)} />
                </div>
              )}
              {top3[0] && (
                <div className="flex-1">
                  <PodiumCard user={top3[0]} rank={1} onClick={() => handleUserClick(top3[0].username)} />
                </div>
              )}
              {top3[2] && (
                <div className="flex-1">
                  <PodiumCard user={top3[2]} rank={3} onClick={() => handleUserClick(top3[2].username)} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Racing stripe divider */}
        {!isLoading && !error && leaderboard && leaderboard.length > 3 && (
          <div className="h-px racing-stripe opacity-40" />
        )}

        {/* Rest of the grid */}
        {!isLoading && !error && rest.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <h2 className="font-heading text-sm font-bold text-primary tracking-widest uppercase">
                Full Grid
              </h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {leaderboard?.length} racers
              </span>
            </div>
            <div className="space-y-2">
              {rest.map((user, idx) => (
                <RaceRow
                  key={user.username}
                  user={user}
                  rank={idx + 4}
                  onClick={() => handleUserClick(user.username)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer attribution */}
        <footer className="pt-4 pb-2 text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} RevGrid — Built with{' '}
            <span className="text-red-500">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'revgrid')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
