import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PostType, type UserProfile, type Variant_new_used, type PostRecord } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (err) {
        console.error('[useGetCallerUserProfile] Error:', err);
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUser(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      try {
        return await actor.getUser(userId);
      } catch (err) {
        console.error('[useGetUser] Error:', err);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!userId,
    retry: 1,
  });
}

export function useGetFeed(postType: PostType) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['feed', postType],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getFeed(postType);
      } catch (err) {
        console.error('[useGetFeed] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPosts();
      } catch (err) {
        console.error('[useGetAllPosts] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

const FEED_PAGE_SIZE = 20;

/**
 * Infinite scroll hook for the home feed.
 * Fetches all posts once and paginates them client-side in pages of 20.
 * getNextPageParam returns the next offset when more posts are available.
 */
export function useInfiniteFeed() {
  const { actor, isFetching } = useActor();

  return useInfiniteQuery<PostRecord[], Error, { pages: PostRecord[][] }, ['infiniteFeed'], number>({
    queryKey: ['infiniteFeed'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      if (!actor) return [];
      try {
        // Fetch all posts once; React Query caches the full list.
        // We slice client-side to avoid re-fetching on every page load.
        const allPosts = await actor.getAllPosts();
        // Sort newest-first by createdAt
        const sorted = [...allPosts].sort((a, b) => {
          const diff = Number(b.createdAt) - Number(a.createdAt);
          return diff;
        });
        const offset = pageParam as number;
        return sorted.slice(offset, offset + FEED_PAGE_SIZE);
      } catch (err) {
        console.error('[useInfiniteFeed] Error:', err);
        return [];
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < FEED_PAGE_SIZE) return undefined;
      return allPages.reduce((sum, page) => sum + page.length, 0);
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    // Keep previous data so the feed doesn't flash on refetch
    staleTime: 30_000,
  });
}

export function useGetPost(postId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!actor || !postId) return null;
      try {
        return await actor.getPost(postId);
      } catch (err) {
        console.error('[useGetPost] Error:', err);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!postId,
    retry: 1,
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
      return actor.createPost(caption, tags, postType, reelCategory ?? null, mediaData ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteFeed'] });
    },
    onError: (error: Error) => {
      console.error('[useCreatePost] Error:', error.message);
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteFeed'] });
    },
    onError: (error: Error) => {
      console.error('[useDeletePost] Error:', error.message);
    },
  });
}

export function useGetComments(postId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      try {
        return await actor.getComments(postId);
      } catch (err) {
        console.error('[useGetComments] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!postId,
    retry: 1,
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
    },
    onError: (error: Error) => {
      console.error('[useAddComment] Error:', error.message);
    },
  });
}

export function useGetLikeCount(postId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['likeCount', postId],
    queryFn: async () => {
      if (!actor || !postId) return BigInt(0);
      try {
        return await actor.getLikeCount(postId);
      } catch (err) {
        console.error('[useGetLikeCount] Error:', err);
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching && !!postId,
    retry: 1,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likePost(postId);
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likeCount', postId] });
    },
    onError: (error: Error) => {
      console.error('[useLikePost] Error:', error.message);
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlikePost(postId);
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likeCount', postId] });
    },
    onError: (error: Error) => {
      console.error('[useUnlikePost] Error:', error.message);
    },
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.followUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
    },
    onError: (error: Error) => {
      console.error('[useFollowUser] Error:', error.message);
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollowUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
    },
    onError: (error: Error) => {
      console.error('[useUnfollowUser] Error:', error.message);
    },
  });
}

export function useGetFollowers(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      try {
        return await actor.getFollowers(userId);
      } catch (err) {
        console.error('[useGetFollowers] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!userId,
    retry: 1,
  });
}

export function useGetFollowing(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      try {
        return await actor.getFollowing(userId);
      } catch (err) {
        console.error('[useGetFollowing] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!userId,
    retry: 1,
  });
}

export function useIsFollowing(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isFollowing', userId],
    queryFn: async () => {
      if (!actor || !userId) return false;
      try {
        return await actor.isFollowing(userId);
      } catch (err) {
        console.error('[useIsFollowing] Error:', err);
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!userId,
    retry: 1,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: Error) => {
      console.error('[useSaveCallerUserProfile] Error:', error.message);
    },
  });
}

export function useUpdateProfilePic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageBase64: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProfilePic(imageBase64);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('[useUpdateProfilePic] Error:', error.message);
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
    onError: (error: Error) => {
      console.error('[useCreateUser] Error:', error.message);
    },
  });
}

export function useSearchUsers(query: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['searchUsers', query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      try {
        return await actor.searchUsers(query);
      } catch (err) {
        console.error('[useSearchUsers] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!query.trim(),
    retry: 1,
  });
}

export function useSearchReels(query: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['searchReels', query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      try {
        return await actor.searchReels(query);
      } catch (err) {
        console.error('[useSearchReels] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!query.trim(),
    retry: 1,
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
      console.error('[useSendMessage] Error:', error.message);
    },
  });
}

export function useGetMessages(conversationId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!actor || !conversationId) return [];
      try {
        return await actor.getMessages(conversationId);
      } catch (err) {
        console.error('[useGetMessages] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!conversationId,
    refetchInterval: 3000,
    retry: 1,
  });
}

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllEvents();
      } catch (err) {
        console.error('[useGetAllEvents] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useGetEvent(eventId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!actor || !eventId) return null;
      try {
        return await actor.getEvent(eventId);
      } catch (err) {
        console.error('[useGetEvent] Error:', err);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!eventId,
    retry: 1,
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
      console.error('[useCreateEvent] Error:', error.message);
    },
  });
}

export function useAttendEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.attendEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: Error) => {
      console.error('[useAttendEvent] Error:', error.message);
    },
  });
}

export function useGetAllBuilds() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['builds'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBuilds();
      } catch (err) {
        console.error('[useGetAllBuilds] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useGetBuild(buildId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['build', buildId],
    queryFn: async () => {
      if (!actor || !buildId) return null;
      try {
        return await actor.getBuild(buildId);
      } catch (err) {
        console.error('[useGetBuild] Error:', err);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!buildId,
    retry: 1,
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
      console.error('[useCreateBuild] Error:', error.message);
    },
  });
}

// ─── Marketplace Hooks ────────────────────────────────────────────────────────

export function useGetAllListings() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['marketplaceListings'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllListings();
      } catch (err) {
        console.error('[useGetAllListings] Error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
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
      queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] });
    },
    onError: (error: Error) => {
      console.error('[useCreateListing] Error:', error.message);
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] });
    },
    onError: (error: Error) => {
      console.error('[useDeleteListing] Error:', error.message);
    },
  });
}

export function useMarkListingAsSold() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markListingAsSold(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] });
    },
    onError: (error: Error) => {
      console.error('[useMarkListingAsSold] Error:', error.message);
    },
  });
}
