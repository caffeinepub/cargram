import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Settings, Grid3X3, Film, Car, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  useGetUser,
  useGetCallerUserProfile,
  useGetAllPosts,
  useGetAllBuilds,
  useFollowUser,
  useUnfollowUser,
  useGetFollowing,
} from '../hooks/useQueries';
import { PostType } from '../backend';
import EditProfileModal from '../components/EditProfileModal';
import { toast } from 'sonner';

export default function ProfilePage() {
  const params = useParams({ strict: false }) as { userId?: string };
  const userId = params.userId;
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data: currentProfile, isLoading: currentLoading } = useGetCallerUserProfile();
  const isOwnProfile = !userId || userId === currentProfile?.username;
  const targetUserId = isOwnProfile ? currentProfile?.username : userId;

  const { data: targetUser, isLoading: userLoading } = useGetUser(isOwnProfile ? undefined : userId);
  const { data: following = [] } = useGetFollowing(currentProfile?.username);
  const { data: allPosts = [] } = useGetAllPosts();
  const { data: allBuilds = [] } = useGetAllBuilds();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const profile = isOwnProfile ? currentProfile : targetUser;
  const isFollowing = !isOwnProfile && following.includes(userId || '');

  const userPosts = allPosts.filter(p => p.authorId === targetUserId && p.postType === PostType.feed);
  const userReels = allPosts.filter(p => p.authorId === targetUserId && p.postType === PostType.reel);
  const userBuilds = allBuilds.filter(b => b.authorId === targetUserId);

  const handleFollow = async () => {
    if (!userId) return;
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(userId);
        toast.success(`Unfollowed @${userId}`);
      } else {
        await followUser.mutateAsync(userId);
        toast.success(`Following @${userId}`);
      }
    } catch {
      toast.error('Failed to update follow');
    }
  };

  if (currentLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <p className="text-muted-foreground">User not found</p>
        <Button onClick={() => navigate({ to: '/' })} variant="outline">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-asphalt-800 via-asphalt-700 to-asphalt-800 relative overflow-hidden">
        <div className="absolute inset-0 racing-stripe opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4 -mt-12 relative">
        <div className="flex items-end justify-between mb-3">
          <Avatar className="w-20 h-20 border-4 border-background">
            <AvatarImage
              src={profile.profilePic ? profile.profilePic.getDirectURL() : '/assets/generated/default-avatar.dim_128x128.png'}
              alt={profile.username}
            />
            <AvatarFallback className="bg-secondary text-foreground text-xl font-bold">
              {profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex gap-2 mt-14">
            {isOwnProfile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="border-border text-foreground font-bold text-xs"
              >
                <Settings className="w-3 h-3 mr-1" /> Edit Profile
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleFollow}
                disabled={followUser.isPending || unfollowUser.isPending}
                className={`font-bold text-xs ${
                  isFollowing
                    ? 'bg-secondary text-foreground border border-border'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        <h2 className="font-heading text-xl font-bold text-foreground">{profile.displayName}</h2>
        <p className="text-muted-foreground text-sm">@{profile.username}</p>

        {profile.carInfo && (
          <Badge className="mt-1 bg-primary/20 text-primary border-primary/30 text-xs">
            <Car className="w-3 h-3 mr-1" />
            {profile.carInfo}
          </Badge>
        )}

        {profile.bio && (
          <p className="text-sm text-foreground mt-2">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-6 mt-3">
          <div className="text-center">
            <p className="font-heading font-bold text-lg text-foreground">{userPosts.length + userReels.length}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <button
            className="text-center"
            onClick={() => navigate({ to: '/profile/$userId/followers', params: { userId: targetUserId || '' } })}
          >
            <p className="font-heading font-bold text-lg text-foreground">{Number(profile.followersCount)}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </button>
          <button
            className="text-center"
            onClick={() => navigate({ to: '/profile/$userId/following', params: { userId: targetUserId || '' } })}
          >
            <p className="font-heading font-bold text-lg text-foreground">{Number(profile.followingCount)}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-secondary rounded-none border-b border-border h-10 gap-0 p-0">
          <TabsTrigger value="posts" className="flex-1 rounded-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <Grid3X3 className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="builds" className="flex-1 rounded-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <Car className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="reels" className="flex-1 rounded-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <Film className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {userPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Grid3X3 className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {userPosts.map(post => (
                <div key={post.id} className="aspect-square bg-secondary overflow-hidden">
                  {post.image ? (
                    <img src={post.image.getDirectURL()} alt={post.caption} className="w-full h-full object-cover" />
                  ) : (
                    <img src="/assets/generated/build-placeholder.dim_800x600.png" alt="post" className="w-full h-full object-cover opacity-40" />
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="builds" className="mt-0">
          {userBuilds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Car className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No builds yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {userBuilds.map(build => (
                <div key={build.id} className="aspect-square bg-secondary overflow-hidden relative">
                  {build.images[0] ? (
                    <img src={build.images[0].getDirectURL()} alt={build.title} className="w-full h-full object-cover" />
                  ) : (
                    <img src="/assets/generated/build-placeholder.dim_800x600.png" alt="build" className="w-full h-full object-cover opacity-40" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-white text-xs font-semibold truncate">{build.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reels" className="mt-0">
          {userReels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Film className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No reels yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {userReels.map(reel => (
                <div key={reel.id} className="aspect-square bg-secondary overflow-hidden relative">
                  {reel.image ? (
                    <img src={reel.image.getDirectURL()} alt={reel.caption} className="w-full h-full object-cover" />
                  ) : (
                    <img src="/assets/generated/build-placeholder.dim_800x600.png" alt="reel" className="w-full h-full object-cover opacity-40" />
                  )}
                  <div className="absolute top-1 right-1">
                    <Film className="w-3 h-3 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EditProfileModal open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
