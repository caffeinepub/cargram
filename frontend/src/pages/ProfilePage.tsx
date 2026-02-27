import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetUser, useGetCallerUserProfile, useGetFollowers, useGetFollowing, useFollowUser, useUnfollowUser, useGetFeed, useDeletePost } from '../hooks/useQueries';
import { useGuestCheck } from '../hooks/useGuestCheck';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Settings, PlayCircle, UserPlus, UserMinus, MessageCircle, Loader2, Grid, Film, Wrench } from 'lucide-react';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';
import { PostType } from '../backend';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProfilePage() {
  const { userId } = useParams({ from: '/profile/$userId' });
  const navigate = useNavigate();
  const { isGuest, requireAuth } = useGuestCheck();
  const { data: profileUser, isLoading: userLoading } = useGetUser(userId);
  const { data: currentProfile } = useGetCallerUserProfile();
  const { data: followers = [] } = useGetFollowers(userId);
  const { data: following = [] } = useGetFollowing(userId);
  const { mutate: followUser, isPending: followPending } = useFollowUser();
  const { mutate: unfollowUser, isPending: unfollowPending } = useUnfollowUser();
  const { data: feedPosts = [] } = useGetFeed(PostType.feed);
  const { data: reelPosts = [] } = useGetFeed(PostType.reel);
  const { data: buildPosts = [] } = useGetFeed(PostType.build);
  const { mutate: deletePost, isPending: deletePending } = useDeletePost();
  const [editOpen, setEditOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const isOwnProfile = currentProfile?.username === userId;
  const isFollowingUser = currentProfile ? followers.includes(currentProfile.username) : false;

  const userFeedPosts = feedPosts.filter((p) => p.authorId === userId);
  const userReelPosts = reelPosts.filter((p) => p.authorId === userId);
  const userBuildPosts = buildPosts.filter((p) => p.authorId === userId);

  const handleFollow = () => {
    if (!requireAuth('Sign in to follow users')) return;
    if (isFollowingUser) {
      unfollowUser(userId, {
        onSuccess: () => toast.success(`Unfollowed @${userId}`),
        onError: () => toast.error('Failed to unfollow'),
      });
    } else {
      followUser(userId, {
        onSuccess: () => toast.success(`Following @${userId}`),
        onError: () => toast.error('Failed to follow'),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletePostId) return;
    deletePost(deletePostId, {
      onSuccess: () => {
        toast.success('Post deleted');
        setDeletePostId(null);
      },
      onError: () => toast.error('Failed to delete post'),
    });
  };

  if (userLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-16" />
        <Skeleton className="h-10" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Cover photo */}
      <div className="h-32 bg-muted relative">
        {profileUser.coverPhotoData ? (
          <img src={profileUser.coverPhotoData} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/5" />
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Avatar + actions row */}
        <div className="flex items-end justify-between -mt-10 mb-3">
          <div className="w-20 h-20 rounded-full border-4 border-background bg-muted overflow-hidden">
            {profileUser.profilePicData ? (
              <img src={profileUser.profilePicData} alt={profileUser.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {profileUser.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-1">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-full text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => navigate({ to: '/streettube' })}
                  className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-full text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <PlayCircle className="w-4 h-4 text-red-500" />
                  StreetTube
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                {isFollowingUser && !isGuest && (
                  <button
                    onClick={() => navigate({ to: '/messages/$userId', params: { userId } })}
                    className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-full text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                )}
                <button
                  onClick={handleFollow}
                  disabled={followPending || unfollowPending}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                    isFollowingUser
                      ? 'bg-muted text-foreground hover:bg-muted/80'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {followPending || unfollowPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowingUser ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {isFollowingUser ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Name & bio */}
        <h1 className="text-xl font-bold">{profileUser.displayName}</h1>
        <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
        {profileUser.bio && <p className="text-sm mt-1">{profileUser.bio}</p>}
        {profileUser.carInfo && (
          <p className="text-sm text-primary mt-1 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" />
            {profileUser.carInfo}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-6 mt-3">
          <div className="text-center">
            <p className="font-bold text-sm">{userFeedPosts.length + userReelPosts.length + userBuildPosts.length}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <button
            onClick={() => navigate({ to: '/profile/$userId/followers', params: { userId } })}
            className="text-center hover:opacity-80 transition-opacity"
          >
            <p className="font-bold text-sm">{followers.length}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </button>
          <button
            onClick={() => navigate({ to: '/profile/$userId/following', params: { userId } })}
            className="text-center hover:opacity-80 transition-opacity"
          >
            <p className="font-bold text-sm">{following.length}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="px-4">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="posts" className="flex-1 flex items-center gap-1.5">
            <Grid className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="reels" className="flex-1 flex items-center gap-1.5">
            <Film className="w-4 h-4" />
            Reels
          </TabsTrigger>
          <TabsTrigger value="builds" className="flex-1 flex items-center gap-1.5">
            <Wrench className="w-4 h-4" />
            Builds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 pb-6">
          {userFeedPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No posts yet</p>
          ) : (
            userFeedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>

        <TabsContent value="reels" className="space-y-4 pb-6">
          {userReelPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No reels yet</p>
          ) : (
            userReelPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>

        <TabsContent value="builds" className="space-y-4 pb-6">
          {userBuildPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No builds yet</p>
          ) : (
            userBuildPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      {editOpen && currentProfile && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          userProfile={currentProfile}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deletePostId} onOpenChange={(v) => !v && setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
