import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PostType, type UserProfile, type Variant_new_used } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
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
      return actor.getUser(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetFeed(postType: PostType) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['feed', postType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeed(postType);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPost(postId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!actor || !postId) return null;
      return actor.getPost(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
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
    },
  });
}

export function useGetComments(postId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
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
  });
}

export function useGetLikeCount(postId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['likeCount', postId],
    queryFn: async () => {
      if (!actor || !postId) return BigInt(0);
      return actor.getLikeCount(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
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
  });
}

export function useGetFollowers(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getFollowers(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetFollowing(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getFollowing(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useIsFollowing(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isFollowing', userId],
    queryFn: async () => {
      if (!actor || !userId) return false;
      return actor.isFollowing(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
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
      console.error('Failed to update profile picture:', error.message);
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
  });
}

export function useSearchUsers(query: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['searchUsers', query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      return actor.searchUsers(query);
    },
    enabled: !!actor && !isFetching && !!query.trim(),
  });
}

export function useSearchReels(query: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['searchReels', query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      return actor.searchReels(query);
    },
    enabled: !!actor && !isFetching && !!query.trim(),
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
  });
}

export function useGetMessages(conversationId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!actor || !conversationId) return [];
      return actor.getMessages(conversationId);
    },
    enabled: !!actor && !isFetching && !!conversationId,
    refetchInterval: 3000,
  });
}

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEvent(eventId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!actor || !eventId) return null;
      return actor.getEvent(eventId);
    },
    enabled: !!actor && !isFetching && !!eventId,
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
  });
}

export function useGetAllBuilds() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['builds'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBuilds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBuild(buildId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['build', buildId],
    queryFn: async () => {
      if (!actor || !buildId) return null;
      return actor.getBuild(buildId);
    },
    enabled: !!actor && !isFetching && !!buildId,
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
  });
}

// ─── Marketplace Hooks ────────────────────────────────────────────────────────

export function useGetAllListings() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['marketplaceListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListings();
    },
    enabled: !!actor && !isFetching,
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
  });
}
