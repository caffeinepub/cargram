import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type CommentId = string;
export interface Comment {
    id: CommentId;
    authorId: UserId;
    createdAt: bigint;
    text: string;
    postId: PostId;
}
export type EventId = string;
export interface User {
    id: UserId;
    bio: string;
    username: string;
    displayName: string;
    followersCount: bigint;
    createdAt: bigint;
    profilePicData?: string;
    carInfo: string;
    followingCount: bigint;
    profilePic?: ExternalBlob;
}
export interface PostRecord {
    id: PostId;
    postType: PostType;
    authorId: UserId;
    createdAt: bigint;
    tags: Array<string>;
    reelCategory?: string;
    mediaData?: string;
    caption: string;
    image?: ExternalBlob;
}
export type PostId = string;
export interface Event {
    id: EventId;
    title: string;
    date: bigint;
    description: string;
    organizerId: UserId;
    image?: ExternalBlob;
    attendeesCount: bigint;
    location: string;
}
export type UserId = string;
export interface MarketplaceListing {
    id: MarketplaceListingId;
    title: string;
    authorId: UserId;
    createdAt: bigint;
    sold: boolean;
    description: string;
    imageUrl: string;
    category: string;
    price: string;
    condition: Variant_new_used;
}
export type MarketplaceListingId = string;
export type MessageId = string;
export interface Message {
    id: MessageId;
    createdAt: bigint;
    text: string;
    receiverId: UserId;
    senderId: UserId;
}
export interface BuildShowcase {
    id: BuildId;
    title: string;
    authorId: UserId;
    createdAt: bigint;
    description: string;
    specs: string;
    images: Array<ExternalBlob>;
}
export type BuildId = string;
export interface UserProfile {
    id: UserId;
    bio: string;
    username: string;
    displayName: string;
    followersCount: bigint;
    createdAt: bigint;
    profilePicData?: string;
    carInfo: string;
    followingCount: bigint;
    profilePic?: ExternalBlob;
}
export enum PostType {
    feed = "feed",
    reel = "reel",
    mechanic = "mechanic",
    build = "build"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_new_used {
    new_ = "new",
    used = "used"
}
export interface backendInterface {
    /**
     * / Add a comment; authorId is derived from the caller's stored profile
     */
    addComment(postId: PostId, text: string): Promise<CommentId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Mark attendance for an event (authenticated users only)
     */
    attendEvent(eventId: EventId): Promise<void>;
    /**
     * / Create a build showcase (authenticated users only)
     */
    createBuild(title: string, description: string, specs: string): Promise<BuildId>;
    /**
     * / Create an event (authenticated users only)
     */
    createEvent(title: string, description: string, location: string, date: bigint): Promise<EventId>;
    /**
     * / Create a marketplace listing
     */
    createListing(title: string, description: string, price: string, condition: Variant_new_used, category: string, imageUrl: string): Promise<MarketplaceListingId>;
    /**
     * / Create a post; authorId is derived from the caller's stored profile
     * / Allows up to 2MB of mediaData (base64-encoded image data as Text) and up to 2MB in the imageUrl field.
     */
    createPost(caption: string, tags: Array<string>, postType: PostType, reelCategory: string | null, mediaData: string | null, imageUrl: string): Promise<PostId>;
    /**
     * / Create a user record (authenticated users only)
     */
    createUser(username: string, displayName: string, bio: string, carInfo: string): Promise<UserId>;
    /**
     * / Delete a listing (author only)
     */
    deleteListing(listingId: MarketplaceListingId): Promise<void>;
    /**
     * / Delete post (author only)
     */
    deletePost(postId: PostId): Promise<void>;
    /**
     * / Follow another user; followerId is derived from the caller's profile
     */
    followUser(followeeId: UserId): Promise<void>;
    /**
     * / Get all build showcases (public read)
     */
    getAllBuilds(): Promise<Array<BuildShowcase>>;
    /**
     * / Get all events (public read)
     */
    getAllEvents(): Promise<Array<Event>>;
    /**
     * / Get all listings (public read)
     */
    getAllListings(): Promise<Array<MarketplaceListing>>;
    /**
     * / Get all posts (public read)
     */
    getAllPosts(): Promise<Array<PostRecord>>;
    /**
     * / Get a single build showcase (public read)
     */
    getBuild(buildId: BuildId): Promise<BuildShowcase | null>;
    /**
     * / Get the caller's own profile
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get total comment count for a post (public read)
     */
    getCommentCount(postId: PostId): Promise<bigint>;
    /**
     * / Get all comments for a post (public read)
     */
    getComments(postId: PostId): Promise<Array<Comment>>;
    /**
     * / Get a single event (public read)
     */
    getEvent(eventId: EventId): Promise<Event | null>;
    /**
     * / Get feed by post type (public read)
     */
    getFeed(postType: PostType): Promise<Array<PostRecord>>;
    /**
     * / Get the list of users that follow userId (public read)
     */
    getFollowers(userId: UserId): Promise<Array<UserId>>;
    /**
     * / Get the list of users that userId is following (public read)
     */
    getFollowing(userId: UserId): Promise<Array<UserId>>;
    /**
     * / Get like count for a post (public read)
     */
    getLikeCount(postId: PostId): Promise<bigint>;
    /**
     * / Get a single listing (public read)
     */
    getListing(listingId: MarketplaceListingId): Promise<MarketplaceListing | null>;
    /**
     * / Get messages in a conversation; caller must be one of the participants
     */
    getMessages(conversationId: string): Promise<Array<Message>>;
    /**
     * / Get a single post (public read)
     */
    getPost(postId: PostId): Promise<PostRecord | null>;
    /**
     * / Get a user by userId (public read)
     */
    getUser(userId: UserId): Promise<User | null>;
    /**
     * / Get another user's profile (caller must be the user themselves or an admin)
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Check if caller follows a specific user
     */
    isFollowing(userId: UserId): Promise<boolean>;
    /**
     * / Like a post; userId is derived from the caller's profile
     */
    likePost(postId: PostId): Promise<void>;
    /**
     * / Mark a listing as sold (author only)
     */
    markListingAsSold(listingId: MarketplaceListingId): Promise<void>;
    /**
     * / Save/update the caller's own profile
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Search listings by title, description, or category (public read)
     */
    searchListings(searchQuery: string): Promise<Array<MarketplaceListing>>;
    /**
     * / Search reels by category or username (authenticated users only)
     */
    searchReels(searchQuery: string): Promise<Array<PostRecord>>;
    /**
     * / Search users by username or display name (public read)
     */
    searchUsers(searchQuery: string): Promise<Array<User>>;
    /**
     * / Send a message; senderId is derived from the caller's profile
     */
    sendMessage(receiverId: UserId, text: string): Promise<MessageId>;
    /**
     * / Unfollow a user; followerId is derived from the caller's profile
     */
    unfollowUser(followeeId: UserId): Promise<void>;
    /**
     * / Unlike a post; userId is derived from the caller's profile
     */
    unlikePost(postId: PostId): Promise<void>;
    /**
     * / Update a listing (author only)
     */
    updateListing(listingId: MarketplaceListingId, title: string, description: string, price: string, condition: Variant_new_used, category: string, imageUrl: string): Promise<void>;
    /**
     * / Update the caller's profile picture (base64-encoded image data)
     */
    updateProfilePic(imageBase64: string): Promise<void>;
}
