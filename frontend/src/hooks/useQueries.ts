import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PostType, type UserProfile, type PostRecord, type Comment, type Message, type Event, type BuildShowcase, type User } from '../backend';

// ─── User Profile ─────────────────────────────────────────────────────────────

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
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
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

export function useGetUser(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<User | null>({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUser(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useSearchUsers(searchQuery: string) {
  const { actor, isFetching } = useActor();

  return useQuery<User[]>({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!actor || !searchQuery.trim()) return [];
      return actor.searchUsers(searchQuery);
    },
    enabled: !!actor && !isFetching && searchQuery.trim().length > 0,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, displayName, bio, carInfo }: { username: string; displayName: string; bio: string; carInfo: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUser(username, displayName, bio, carInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<PostRecord[]>({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await actor.getAllPosts();
      return [...posts].sort((a, b) => Number(b.createdAt - a.createdAt));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFeed(postType: PostType) {
  const { actor, isFetching } = useActor();

  return useQuery<PostRecord[]>({
    queryKey: ['feed', postType],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await actor.getFeed(postType);
      return [...posts].sort((a, b) => Number(b.createdAt - a.createdAt));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPost(postId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<PostRecord | null>({
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
    mutationFn: async ({ caption, tags, postType }: { caption: string; tags: string[]; postType: PostType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(caption, tags, postType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export function useGetLikeCount(postId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
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

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useGetComments(postId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      const comments = await actor.getComments(postId);
      return [...comments].sort((a, b) => Number(a.createdAt - b.createdAt));
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
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export function useGetFollowers(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
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

  return useQuery<string[]>({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getFollowing(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followeeId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.followUser(followeeId);
    },
    onSuccess: (_data, followeeId) => {
      queryClient.invalidateQueries({ queryKey: ['followers', followeeId] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['user', followeeId] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followeeId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollowUser(followeeId);
    },
    onSuccess: (_data, followeeId) => {
      queryClient.invalidateQueries({ queryKey: ['followers', followeeId] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['user', followeeId] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useGetMessages(conversationId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!actor || !conversationId) return [];
      const msgs = await actor.getMessages(conversationId);
      return [...msgs].sort((a, b) => Number(a.createdAt - b.createdAt));
    },
    enabled: !!actor && !isFetching && !!conversationId,
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
  });
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['allEvents'],
    queryFn: async () => {
      if (!actor) return [];
      const evts = await actor.getAllEvents();
      return [...evts].sort((a, b) => Number(a.date - b.date));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEvent(eventId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Event | null>({
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
    mutationFn: async ({ title, description, location, date }: { title: string; description: string; location: string; date: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEvent(title, description, location, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEvents'] });
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
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['allEvents'] });
    },
  });
}

// ─── Builds ───────────────────────────────────────────────────────────────────

export function useGetAllBuilds() {
  const { actor, isFetching } = useActor();

  return useQuery<BuildShowcase[]>({
    queryKey: ['allBuilds'],
    queryFn: async () => {
      if (!actor) return [];
      const builds = await actor.getAllBuilds();
      return [...builds].sort((a, b) => Number(b.createdAt - a.createdAt));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBuild(buildId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<BuildShowcase | null>({
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
    mutationFn: async ({ title, description, specs }: { title: string; description: string; specs: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBuild(title, description, specs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBuilds'] });
    },
  });
}
