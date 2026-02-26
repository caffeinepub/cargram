import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetUser, useGetAllPosts, useGetFollowers, useGetFollowing, useIsFollowing, useFollowUser, useUnfollowUser, useDeletePost } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { PostType } from '../backend';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Settings, Grid, Film, Wrench, MessageCircle, UserPlus, UserMinus, Loader2, PlayCircle } from 'lucide-react';
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
  const params = useParams({ strict: false }) as { username?: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const { data: currentUserProfile } = useGetCallerUserProfile();
  const profileUsername = params.username || currentUserProfile?.username;
  const isOwnProfile = !params.username || params.username === currentUserProfile?.username;

  const { data: profileUser, isLoading: userLoading } = useGetUser(profileUsername);
  const { data: allPosts } = useGetAllPosts();
  const { data: followers } = useGetFollowers(profileUsername);
  const { data: following } = useGetFollowing(profileUsername);
  const { data: isFollowingUser } = useIsFollowing(profileUsername);

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const deletePost = useDeletePost();

  const userPosts = allPosts?.filter(p => p.authorId === profileUsername && p.postType === PostType.feed) || [];
  const userReels = allPosts?.filter(p => p.authorId === profileUsername && p.postType === PostType.reel) || [];
  const userBuilds = allPosts?.filter(p => p.authorId === profileUsername && p.postType === PostType.build) || [];

  const displayUser = isOwnProfile ? currentUserProfile : profileUser;

  const handleFollow = async () => {
    if (!profileUsername) return;
    if (isFollowingUser) {
      await unfollowUser.mutateAsync(profileUsername);
    } else {
      await followUser.mutateAsync(profileUsername);
    }
  };

  const handleDeletePost = async () => {
    if (!deletePostId) return;
    await deletePost.mutateAsync(deletePostId);
    setDeletePostId(null);
  };

  const avatarUrl = displayUser?.profilePicData
    ? `data:image/jpeg;base64,${displayUser.profilePicData}`
    : '/assets/generated/default-avatar.dim_128x128.png';

  if (userLoading && !isOwnProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {/* Profile Header */}
      <div className="pt-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <img
            src={avatarUrl}
            alt={displayUser.displayName}
            className="w-20 h-20 rounded-full object-cover border-2 border-border flex-shrink-0"
          />

          {/* Info + Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-foreground">{displayUser.displayName}</h1>
                <p className="text-sm text-muted-foreground">@{displayUser.username}</p>
              </div>

              {isOwnProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {isFollowingUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: `/messages/${profileUsername}` })}
                      className="flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleFollow}
                    disabled={followUser.isPending || unfollowUser.isPending}
                    className="flex items-center gap-1.5"
                  >
                    {followUser.isPending || unfollowUser.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowingUser ? (
                      <UserMinus className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {isFollowingUser ? 'Unfollow' : 'Follow'}
                  </Button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-3 text-sm">
              <div className="text-center">
                <span className="font-bold text-foreground">{userPosts.length + userReels.length + userBuilds.length}</span>
                <p className="text-muted-foreground text-xs">Posts</p>
              </div>
              <div className="text-center">
                <span className="font-bold text-foreground">{followers?.length ?? Number(displayUser.followersCount)}</span>
                <p className="text-muted-foreground text-xs">Followers</p>
              </div>
              <div className="text-center">
                <span className="font-bold text-foreground">{following?.length ?? Number(displayUser.followingCount)}</span>
                <p className="text-muted-foreground text-xs">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Car Info */}
        {displayUser.carInfo && (
          <p className="mt-3 text-sm font-medium text-primary flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" />
            {displayUser.carInfo}
          </p>
        )}
        {displayUser.bio && (
          <p className="mt-1 text-sm text-foreground">{displayUser.bio}</p>
        )}

        {/* StreetTube link — own profile only */}
        {isOwnProfile && (
          <button
            onClick={() => navigate({ to: '/streettube' })}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <PlayCircle className="w-4 h-4 text-red-500" />
            <span>StreetTube</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="w-full">
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

        <TabsContent value="posts" className="mt-4 space-y-4">
          {userPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No posts yet.</p>
          ) : (
            userPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDeleteRequest={isOwnProfile ? (id) => setDeletePostId(id) : undefined}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="reels" className="mt-4 space-y-4">
          {userReels.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reels yet.</p>
          ) : (
            userReels.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDeleteRequest={isOwnProfile ? (id) => setDeletePostId(id) : undefined}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="builds" className="mt-4 space-y-4">
          {userBuilds.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No builds yet.</p>
          ) : (
            userBuilds.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDeleteRequest={isOwnProfile ? (id) => setDeletePostId(id) : undefined}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      {editModalOpen && currentUserProfile && (
        <EditProfileModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          userProfile={currentUserProfile}
        />
      )}

      {/* Delete Post Confirmation */}
      <AlertDialog open={!!deletePostId} onOpenChange={(v) => !v && setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
