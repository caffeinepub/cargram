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
    coverPhotoData?: string;
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
    coverPhotoData?: string;
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
    addComment(postId: PostId, text: string): Promise<CommentId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    attendEvent(eventId: EventId): Promise<void>;
    createBuild(title: string, description: string, specs: string): Promise<BuildId>;
    createEvent(title: string, description: string, location: string, date: bigint): Promise<EventId>;
    createListing(title: string, description: string, price: string, condition: Variant_new_used, category: string, imageUrl: string): Promise<MarketplaceListingId>;
    createPost(caption: string, tags: Array<string>, postType: PostType, reelCategory: string | null, mediaData: string | null): Promise<PostRecord | null>;
    createUser(username: string, displayName: string, bio: string, carInfo: string): Promise<UserId>;
    deleteListing(listingId: MarketplaceListingId): Promise<void>;
    deletePost(postId: PostId): Promise<void>;
    followUser(followeeId: UserId): Promise<void>;
    getAllBuilds(): Promise<Array<BuildShowcase>>;
    getAllEvents(): Promise<Array<Event>>;
    getAllListings(): Promise<Array<MarketplaceListing>>;
    getAllPosts(): Promise<Array<PostRecord>>;
    getBuild(buildId: BuildId): Promise<BuildShowcase | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentCount(postId: PostId): Promise<bigint>;
    getComments(postId: PostId): Promise<Array<Comment>>;
    getEvent(eventId: EventId): Promise<Event | null>;
    getFeed(postType: PostType): Promise<Array<PostRecord>>;
    getFollowers(userId: UserId): Promise<Array<UserId>>;
    getFollowing(userId: UserId): Promise<Array<UserId>>;
    getLikeCount(postId: PostId): Promise<bigint>;
    getListing(listingId: MarketplaceListingId): Promise<MarketplaceListing | null>;
    getMessages(conversationId: string): Promise<Array<Message>>;
    getPost(postId: PostId): Promise<PostRecord | null>;
    getUser(userId: UserId): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isFollowing(userId: UserId): Promise<boolean>;
    likePost(postId: PostId): Promise<void>;
    markListingAsSold(listingId: MarketplaceListingId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListings(searchQuery: string): Promise<Array<MarketplaceListing>>;
    searchReels(searchQuery: string): Promise<Array<PostRecord>>;
    searchUsers(searchQuery: string): Promise<Array<User>>;
    sendMessage(receiverId: UserId, text: string): Promise<MessageId>;
    unfollowUser(followeeId: UserId): Promise<void>;
    unlikePost(postId: PostId): Promise<void>;
    updateCoverPhoto(coverPhotoData: string | null): Promise<void>;
    updateListing(listingId: MarketplaceListingId, title: string, description: string, price: string, condition: Variant_new_used, category: string, imageUrl: string): Promise<void>;
    updateProfilePic(imageBase64: string): Promise<void>;
}
