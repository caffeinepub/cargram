import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import {
  UserProfile,
  PostRecord,
  PostType,
  Comment,
  Event,
  BuildShowcase,
  MarketplaceListing,
  User,
  LeaderboardUser,
  Message,
  Variant_new_used,
} from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (err) {
        console.error('getCallerUserProfile error:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUser(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<User | null>({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      try {
        return await actor.getUser(userId);
      } catch (err) {
        console.error('getUser error:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 30_000,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved!');
    },
    onError: (err: any) => {
      console.error('saveCallerUserProfile error:', err);
      toast.error(err?.message || 'Failed to save profile');
    },
  });
}

export function useUpdateProfilePic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageBase64: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProfilePic(imageBase64);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (err: any) => {
      console.error('updateProfilePic error:', err);
      toast.error(err?.message || 'Failed to update profile picture');
    },
  });
}

export function useUpdateCoverPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coverPhotoData: string | null) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateCoverPhoto(coverPhotoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (err: any) => {
      console.error('updateCoverPhoto error:', err);
      toast.error(err?.message || 'Failed to update cover photo');
    },
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      displayName,
      bio,
      carInfo,
    }: {
      username: string;
      displayName: string;
      bio: string;
      carInfo: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUser(username, displayName, bio, carInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (err: any) => {
      console.error('createUser error:', err);
      toast.error(err?.message || 'Failed to create user');
    },
  });
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export function useGetAllPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostRecord[]>({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPosts();
      } catch (err) {
        console.error('getAllPosts error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useGetPost(postId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostRecord | null>({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!actor || !postId) return null;
      try {
        return await actor.getPost(postId);
      } catch (err) {
        console.error('getPost error:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!postId,
    staleTime: 30_000,
  });
}

export function useGetFeed(postType: PostType) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostRecord[]>({
    queryKey: ['feed', postType],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getFeed(postType);
      } catch (err) {
        console.error('getFeed error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useInfiniteFeed(postType: PostType) {
  const { actor, isFetching: actorFetching } = useActor();

  return useInfiniteQuery<PostRecord[], Error>({
    queryKey: ['infiniteFeed', postType],
    queryFn: async ({ pageParam = 0 }) => {
      if (!actor) return [];
      try {
        const allPosts = await actor.getFeed(postType);
        const sorted = [...allPosts].sort(
          (a, b) => Number(b.createdAt) - Number(a.createdAt)
        );
        const pageSize = 10;
        const start = (pageParam as number) * pageSize;
        return sorted.slice(start, start + pageSize);
      } catch (err) {
        console.error('infiniteFeed error:', err);
        return [];
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length;
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caption,
      tags,
      postType,
      reelCategory,
      mediaData,
    }: {
      caption: string;
      tags: string[];
      postType: PostType;
      reelCategory?: string | null;
      mediaData?: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createPost(
        caption,
        tags,
        postType,
        reelCategory ?? null,
        mediaData ?? null
      );
      if (!result) throw new Error('Failed to create post — backend returned null');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteFeed'] });
    },
    onError: (err: any) => {
      console.error('createPost error:', err);
      toast.error(err?.message || 'Failed to create post');
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteFeed'] });
      toast.success('Post deleted');
    },
    onError: (err: any) => {
      console.error('deletePost error:', err);
      toast.error(err?.message || 'Failed to delete post');
    },
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useGetComments(postId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      try {
        return await actor.getComments(postId);
      } catch (err) {
        console.error('getComments error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!postId,
    staleTime: 30_000,
  });
}

export function useGetCommentCount(postId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['commentCount', postId],
    queryFn: async () => {
      if (!actor || !postId) return BigInt(0);
      try {
        return await actor.getCommentCount(postId);
      } catch (err) {
        console.error('getCommentCount error:', err);
        return BigInt(0);
      }
    },
    enabled: !!actor && !actorFetching && !!postId,
    staleTime: 30_000,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(postId, text);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['commentCount', postId] });
    },
    onError: (err: any) => {
      console.error('addComment error:', err);
      toast.error(err?.message || 'Failed to add comment');
    },
  });
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export function useGetLikeCount(postId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['likeCount', postId],
    queryFn: async () => {
      if (!actor || !postId) return BigInt(0);
      try {
        return await actor.getLikeCount(postId);
      } catch (err) {
        console.error('getLikeCount error:', err);
        return BigInt(0);
      }
    },
    enabled: !!actor && !actorFetching && !!postId,
    staleTime: 30_000,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likePost(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likeCount', postId] });
    },
    onError: (err: any) => {
      console.error('likePost error:', err);
      toast.error(err?.message || 'Failed to like post');
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unlikePost(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likeCount', postId] });
    },
    onError: (err: any) => {
      console.error('unlikePost error:', err);
      toast.error(err?.message || 'Failed to unlike post');
    },
  });
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export function useIsFollowing(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isFollowing', userId],
    queryFn: async () => {
      if (!actor || !userId) return false;
      try {
        return await actor.isFollowing(userId);
      } catch (err) {
        console.error('isFollowing error:', err);
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 30_000,
  });
}

export function useGetFollowers(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      try {
        return await actor.getFollowers(userId);
      } catch (err) {
        console.error('getFollowers error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 30_000,
  });
}

export function useGetFollowing(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      try {
        return await actor.getFollowing(userId);
      } catch (err) {
        console.error('getFollowing error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 30_000,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.followUser(userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userId] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (err: any) => {
      console.error('followUser error:', err);
      toast.error(err?.message || 'Failed to follow user');
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unfollowUser(userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userId] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (err: any) => {
      console.error('unfollowUser error:', err);
      toast.error(err?.message || 'Failed to unfollow user');
    },
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useGetMessages(conversationId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!actor || !conversationId) return [];
      try {
        return await actor.getMessages(conversationId);
      } catch (err) {
        console.error('getMessages error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!conversationId,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId, text }: { receiverId: string; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(receiverId, text);
    },
    onSuccess: (_, { receiverId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (err: any) => {
      console.error('sendMessage error:', err);
      toast.error(err?.message || 'Failed to send message');
    },
  });
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function useGetAllEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['allEvents'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllEvents();
      } catch (err) {
        console.error('getAllEvents error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useGetEvent(eventId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event | null>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!actor || !eventId) return null;
      try {
        return await actor.getEvent(eventId);
      } catch (err) {
        console.error('getEvent error:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!eventId,
    staleTime: 30_000,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      location,
      date,
    }: {
      title: string;
      description: string;
      location: string;
      date: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEvent(title, description, location, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEvents'] });
      toast.success('Event created!');
    },
    onError: (err: any) => {
      console.error('createEvent error:', err);
      toast.error(err?.message || 'Failed to create event');
    },
  });
}

export function useAttendEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.attendEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEvents'] });
      toast.success("You're attending this event!");
    },
    onError: (err: any) => {
      console.error('attendEvent error:', err);
      toast.error(err?.message || 'Failed to attend event');
    },
  });
}

// ─── Builds ───────────────────────────────────────────────────────────────────

export function useGetAllBuilds() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BuildShowcase[]>({
    queryKey: ['allBuilds'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBuilds();
      } catch (err) {
        console.error('getAllBuilds error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useGetBuild(buildId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BuildShowcase | null>({
    queryKey: ['build', buildId],
    queryFn: async () => {
      if (!actor || !buildId) return null;
      try {
        return await actor.getBuild(buildId);
      } catch (err) {
        console.error('getBuild error:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!buildId,
    staleTime: 30_000,
  });
}

export function useCreateBuild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      specs,
    }: {
      title: string;
      description: string;
      specs: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBuild(title, description, specs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBuilds'] });
      toast.success('Build showcase created!');
    },
    onError: (err: any) => {
      console.error('createBuild error:', err);
      toast.error(err?.message || 'Failed to create build');
    },
  });
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

export function useGetAllListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketplaceListing[]>({
    queryKey: ['allListings'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllListings();
      } catch (err) {
        console.error('getAllListings error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useGetListing(listingId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketplaceListing | null>({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      if (!actor || !listingId) return null;
      try {
        return await actor.getListing(listingId);
      } catch (err) {
        console.error('getListing error:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!listingId,
    staleTime: 30_000,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      price,
      condition,
      category,
      imageUrl,
    }: {
      title: string;
      description: string;
      price: string;
      condition: Variant_new_used;
      category: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createListing(title, description, price, condition, category, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      toast.success('Listing created!');
    },
    onError: (err: any) => {
      console.error('createListing error:', err);
      toast.error(err?.message || 'Failed to create listing');
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      title,
      description,
      price,
      condition,
      category,
      imageUrl,
    }: {
      listingId: string;
      title: string;
      description: string;
      price: string;
      condition: Variant_new_used;
      category: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateListing(listingId, title, description, price, condition, category, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      toast.success('Listing updated!');
    },
    onError: (err: any) => {
      console.error('updateListing error:', err);
      toast.error(err?.message || 'Failed to update listing');
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      toast.success('Listing deleted');
    },
    onError: (err: any) => {
      console.error('deleteListing error:', err);
      toast.error(err?.message || 'Failed to delete listing');
    },
  });
}

export function useMarkListingAsSold() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markListingAsSold(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      toast.success('Listing marked as sold!');
    },
    onError: (err: any) => {
      console.error('markListingAsSold error:', err);
      toast.error(err?.message || 'Failed to mark listing as sold');
    },
  });
}

export function useSearchListings(searchQuery: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketplaceListing[]>({
    queryKey: ['searchListings', searchQuery],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.searchListings(searchQuery);
      } catch (err) {
        console.error('searchListings error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && searchQuery.length > 0,
    staleTime: 10_000,
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function useSearchUsers(searchQuery: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<User[]>({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.searchUsers(searchQuery);
      } catch (err) {
        console.error('searchUsers error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && searchQuery.length > 0,
    staleTime: 10_000,
  });
}

export function useSearchReels(searchQuery: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostRecord[]>({
    queryKey: ['searchReels', searchQuery],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.searchReels(searchQuery);
      } catch (err) {
        console.error('searchReels error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && searchQuery.length > 0,
    staleTime: 10_000,
  });
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export function useGetLeaderboard() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LeaderboardUser[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getLeaderboard();
      } catch (err) {
        console.error('getLeaderboard error:', err);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
  });
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────

export function useAskAutomotiveAssistant(question: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['automotiveAssistant', question],
    queryFn: async () => {
      if (!actor || !question) return '';
      try {
        return await actor.askAutomotiveAssistant(question);
      } catch (err) {
        console.error('askAutomotiveAssistant error:', err);
        return '';
      }
    },
    enabled: !!actor && !actorFetching && !!question,
    staleTime: Infinity,
  });
}
