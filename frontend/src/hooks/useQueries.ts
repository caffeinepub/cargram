import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PostType, type PostRecord, type UserProfile, type Comment, type User, type Event, type BuildShowcase, type MarketplaceListing, type LeaderboardUser } from '../backend';
import { toast } from 'sonner';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
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
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });
}

export function useGetUser(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<User | null>({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUser(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 1000 * 60 * 2,
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
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile picture: ${error.message}`);
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
    onError: (error: Error) => {
      toast.error(`Failed to update cover photo: ${error.message}`);
    },
  });
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export function useGetAllPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostRecord[]>({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGetFeed(postType: PostType) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostRecord[]>({
    queryKey: ['feed', postType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeed(postType);
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useInfiniteFeed() {
  const { actor, isFetching: actorFetching } = useActor();
  const PAGE_SIZE = 20;

  return useInfiniteQuery<PostRecord[], Error>({
    queryKey: ['infiniteFeed'],
    queryFn: async ({ pageParam = 0 }) => {
      if (!actor) return [];
      const allPosts = await actor.getAllPosts();
      const sorted = [...allPosts].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      const start = (pageParam as number) * PAGE_SIZE;
      return sorted.slice(start, start + PAGE_SIZE);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGetPost(postId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostRecord | null>({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!actor || !postId) return null;
      return actor.getPost(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
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
      reelCategory: string | null;
      mediaData: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createPost(caption, tags, postType, reelCategory, mediaData);
      if (result === null) {
        throw new Error('Failed to create post: backend returned null. Please ensure you are logged in and have a profile.');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteFeed'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create post: ${error.message}`);
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
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
}

// ─── Builds ──────────────────────────────────────────────────────────────────

export function useGetAllBuilds() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BuildShowcase[]>({
    queryKey: ['builds'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBuilds();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useGetBuild(buildId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BuildShowcase | null>({
    queryKey: ['build', buildId],
    queryFn: async () => {
      if (!actor || !buildId) return null;
      return actor.getBuild(buildId);
    },
    enabled: !!actor && !actorFetching && !!buildId,
    staleTime: 1000 * 60,
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
      queryClient.invalidateQueries({ queryKey: ['builds'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create build: ${error.message}`);
    },
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function useGetComments(postId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useGetCommentCount(postId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['commentCount', postId],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getCommentCount(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
    staleTime: 1000 * 30,
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['commentCount', variables.postId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });
}

// ─── Likes ───────────────────────────────────────────────────────────────────

export function useGetLikeCount(postId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['likeCount', postId],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getLikeCount(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
    staleTime: 1000 * 30,
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
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likeCount', postId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to like post: ${error.message}`);
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
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likeCount', postId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to unlike post: ${error.message}`);
    },
  });
}

// ─── Follow ──────────────────────────────────────────────────────────────────

export function useIsFollowing(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isFollowing', userId],
    queryFn: async () => {
      if (!actor || !userId) return false;
      return actor.isFollowing(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 1000 * 30,
  });
}

export function useGetFollowers(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getFollowers(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 1000 * 60,
  });
}

export function useGetFollowing(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getFollowing(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    staleTime: 1000 * 60,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followeeId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.followUser(followeeId);
    },
    onSuccess: (_data, followeeId) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', followeeId] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['user', followeeId] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to follow user: ${error.message}`);
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followeeId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unfollowUser(followeeId);
    },
    onSuccess: (_data, followeeId) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', followeeId] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['user', followeeId] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to unfollow user: ${error.message}`);
    },
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function useGetMessages(conversationId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages(conversationId);
    },
    enabled: !!actor && !actorFetching && !!conversationId,
    staleTime: 0,
    refetchInterval: 5000,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
}

// ─── Events ──────────────────────────────────────────────────────────────────

export function useGetAllEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useGetEvent(eventId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event | null>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!actor || !eventId) return null;
      return actor.getEvent(eventId);
    },
    enabled: !!actor && !actorFetching && !!eventId,
    staleTime: 1000 * 60,
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
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create event: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to attend event: ${error.message}`);
    },
  });
}

// ─── Marketplace ─────────────────────────────────────────────────────────────

export function useGetAllListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketplaceListing[]>({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListings();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGetListing(listingId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketplaceListing | null>({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      if (!actor || !listingId) return null;
      return actor.getListing(listingId);
    },
    enabled: !!actor && !actorFetching && !!listingId,
    staleTime: 1000 * 60,
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
      condition: import('../backend').Variant_new_used;
      category: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createListing(title, description, price, condition, category, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create listing: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete listing: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark listing as sold: ${error.message}`);
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
      condition: import('../backend').Variant_new_used;
      category: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateListing(listingId, title, description, price, condition, category, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update listing: ${error.message}`);
    },
  });
}

export function useSearchListings(searchQuery: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketplaceListing[]>({
    queryKey: ['searchListings', searchQuery],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchListings(searchQuery);
    },
    enabled: !!actor && !actorFetching && searchQuery.length > 0,
    staleTime: 1000 * 30,
  });
}

// ─── Search ──────────────────────────────────────────────────────────────────

export function useSearchUsers(searchQuery: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<User[]>({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchUsers(searchQuery);
    },
    enabled: !!actor && !actorFetching && searchQuery.length > 0,
    staleTime: 1000 * 30,
  });
}

export function useSearchReels(searchQuery: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostRecord[]>({
    queryKey: ['searchReels', searchQuery],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchReels(searchQuery);
    },
    enabled: !!actor && !actorFetching && searchQuery.length > 0,
    staleTime: 1000 * 30,
  });
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export function useGetLeaderboard() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LeaderboardUser[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 1000 * 60,
    refetchOnMount: true,
  });
}

// ─── AI Mechanic Assistant ────────────────────────────────────────────────────

export function useAskMechanicAI(question: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['mechanicAI', question],
    queryFn: async () => {
      if (!actor || !question) return '';
      return actor.askAutomotiveAssistant(question);
    },
    enabled: !!actor && !actorFetching && question.length > 0,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}
