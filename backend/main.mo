import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  // Mixin core components
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type UserId = Text;
  type PostId = Text;
  type CommentId = Text;
  type MessageId = Text;
  type EventId = Text;
  type BuildId = Text;
  type MarketplaceListingId = Text;

  type UserProfile = {
    id : UserId;
    username : Text;
    displayName : Text;
    bio : Text;
    profilePic : ?Storage.ExternalBlob;
    carInfo : Text;
    followersCount : Nat;
    followingCount : Nat;
    createdAt : Int;
    profilePicData : ?Text;
  };

  type User = UserProfile;

  type PostType = { #feed; #reel; #build; #mechanic };

  type PostRecord = {
    id : PostId;
    authorId : UserId;
    image : ?Storage.ExternalBlob;
    caption : Text;
    tags : [Text];
    postType : PostType;
    createdAt : Int;
    reelCategory : ?Text;
  };

  type Comment = {
    id : CommentId;
    postId : PostId;
    authorId : UserId;
    text : Text;
    createdAt : Int;
  };

  type Message = {
    id : MessageId;
    senderId : UserId;
    receiverId : UserId;
    text : Text;
    createdAt : Int;
  };

  type Event = {
    id : EventId;
    organizerId : UserId;
    title : Text;
    description : Text;
    location : Text;
    date : Int;
    image : ?Storage.ExternalBlob;
    attendeesCount : Nat;
  };

  type BuildShowcase = {
    id : BuildId;
    authorId : UserId;
    title : Text;
    description : Text;
    images : [Storage.ExternalBlob];
    specs : Text;
    createdAt : Int;
  };

  type MarketplaceListing = {
    id : MarketplaceListingId;
    authorId : UserId;
    title : Text;
    description : Text;
    price : Text;
    condition : { #new; #used };
    category : Text;
    imageUrl : Text;
    createdAt : Int;
    sold : Bool;
  };

  // State
  let principalProfiles = Map.empty<Principal, UserProfile>();
  let users = Map.empty<UserId, User>();
  let posts = Map.empty<PostId, PostRecord>();
  let comments = Map.empty<CommentId, Comment>();
  let messages = Map.empty<MessageId, Message>();
  let events = Map.empty<EventId, Event>();
  let builds = Map.empty<BuildId, BuildShowcase>();
  let marketplaceListings = Map.empty<MarketplaceListingId, MarketplaceListing>();
  let follows = Map.empty<UserId, Set.Set<UserId>>();
  let likes = Map.empty<PostId, Set.Set<UserId>>();

  // ─── Required profile functions ───────────────────────────────────────────

  /// Get the caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    principalProfiles.get(caller);
  };

  /// Save/update the caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    principalProfiles.add(caller, profile);
    users.add(profile.username, profile);
  };

  /// Get another user's profile (caller must be the user themselves or an admin)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    principalProfiles.get(user);
  };

  /// Update the caller's profile picture (base64-encoded image data)
  public shared ({ caller }) func updateProfilePic(imageBase64 : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profile picture");
    };

    switch (principalProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile : UserProfile = {
          profile with
          profilePicData = ?imageBase64;
        };
        principalProfiles.add(caller, updatedProfile);
        users.add(profile.username, updatedProfile);
      };
      case (null) { Runtime.trap("User profile not found") };
    };
  };

  // ─── User operations ──────────────────────────────────────────────────────

  /// Create a user record (authenticated users only)
  public shared ({ caller }) func createUser(username : Text, displayName : Text, bio : Text, carInfo : Text) : async UserId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create a user profile");
    };
    let userId = username;
    let newUser : User = {
      id = userId;
      username;
      displayName;
      bio;
      profilePic = null;
      carInfo;
      followersCount = 0;
      followingCount = 0;
      createdAt = Time.now();
      profilePicData = null;
    };
    users.add(userId, newUser);
    principalProfiles.add(caller, newUser);
    follows.add(userId, Set.empty<UserId>());
    userId;
  };

  /// Get a user by userId (public read)
  public query func getUser(userId : UserId) : async ?User {
    users.get(userId);
  };

  // ─── Post operations ──────────────────────────────────────────────────────

  /// Create a post; authorId is derived from the caller's stored profile
  public shared ({ caller }) func createPost(caption : Text, tags : [Text], postType : PostType, reelCategory : ?Text) : async PostId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    let postId = authorId # Time.now().toText();
    let newPost : PostRecord = {
      id = postId;
      authorId;
      image = null;
      caption;
      tags;
      postType;
      createdAt = Time.now();
      reelCategory;
    };
    posts.add(postId, newPost);
    postId;
  };

  /// Get a single post (public read)
  public query func getPost(postId : PostId) : async ?PostRecord {
    posts.get(postId);
  };

  /// Delete post (author only)
  public shared ({ caller }) func deletePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };
    let maybePost = posts.get(postId);

    switch (maybePost) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { Runtime.trap("Unauthorized: Caller has no profile") };
        };
        if (post.authorId != callerUsername) {
          Runtime.trap("Unauthorized: Only the author can delete their post");
        };

        // Remove post
        posts.remove(postId);

        // Remove all associated likes
        ignore likes.remove(postId);

        // Remove all comments for this post
        let commentEntries = comments.entries();
        for ((commentId, comment) in commentEntries) {
          if (comment.postId == postId) {
            comments.remove(commentId);
          };
        };
      };
    };
  };

  // ─── Comment operations ───────────────────────────────────────────────────

  /// Add a comment; authorId is derived from the caller's stored profile
  public shared ({ caller }) func addComment(postId : PostId, text : Text) : async CommentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };
    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    let commentId = postId # Time.now().toText();
    let newComment : Comment = { id = commentId; postId; authorId; text; createdAt = Time.now() };
    comments.add(commentId, newComment);
    commentId;
  };

  /// Get all comments for a post (public read)
  public query func getComments(postId : PostId) : async [Comment] {
    comments.values().toArray().filter(func(c : Comment) : Bool { c.postId == postId });
  };

  // ─── Follow operations ────────────────────────────────────────────────────

  /// Follow another user; followerId is derived from the caller's profile
  public shared ({ caller }) func followUser(followeeId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    let followerId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    if (followerId == followeeId) { return };
    let currentFollows = switch (follows.get(followerId)) {
      case (?f) { f };
      case (null) { Set.empty<UserId>() };
    };
    currentFollows.add(followeeId);
    follows.add(followerId, currentFollows);

    switch (users.get(followeeId)) {
      case (?user) {
        users.add(followeeId, { user with followersCount = user.followersCount + 1 });
      };
      case (null) {};
    };
    switch (users.get(followerId)) {
      case (?user) {
        users.add(followerId, { user with followingCount = user.followingCount + 1 });
      };
      case (null) {};
    };
  };

  /// Unfollow a user; followerId is derived from the caller's profile
  public shared ({ caller }) func unfollowUser(followeeId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };
    let followerId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    if (followerId == followeeId) { return };
    let currentFollows = switch (follows.get(followerId)) {
      case (?f) { f };
      case (null) { Set.empty<UserId>() };
    };
    currentFollows.remove(followeeId);
    follows.add(followerId, currentFollows);

    switch (users.get(followeeId)) {
      case (?user) {
        let newCount = if (user.followersCount > 0) { user.followersCount - 1.toNat() } else { 0 };
        users.add(followeeId, { user with followersCount = newCount });
      };
      case (null) {};
    };
    switch (users.get(followerId)) {
      case (?user) {
        let newCount = if (user.followingCount > 0) { user.followingCount - 1.toNat() } else { 0 };
        users.add(followerId, { user with followingCount = newCount });
      };
      case (null) {};
    };
  };

  /// Get the list of users that follow userId (public read)
  public query func getFollowers(userId : UserId) : async [UserId] {
    var result : [UserId] = [];
    for ((followerId, followeeSet) in follows.entries()) {
      if (followeeSet.contains(userId)) {
        result := result.concat([followerId]);
      };
    };
    result;
  };

  /// Get the list of users that userId is following (public read)
  public query func getFollowing(userId : UserId) : async [UserId] {
    switch (follows.get(userId)) {
      case (?f) { f.toArray() };
      case (null) { [] };
    };
  };

  /// Check if caller follows a specific user
  public query ({ caller }) func isFollowing(userId : UserId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    let callerId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return false };
    };
    switch (follows.get(callerId)) {
      case (?f) { f.contains(userId) };
      case (null) { false };
    };
  };

  // ─── Message operations ───────────────────────────────────────────────────

  /// Send a message; senderId is derived from the caller's profile
  public shared ({ caller }) func sendMessage(receiverId : UserId, text : Text) : async MessageId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    let senderId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    let messageId = senderId # Time.now().toText();
    let newMessage : Message = {
      id = messageId;
      senderId;
      receiverId;
      text;
      createdAt = Time.now();
    };
    messages.add(messageId, newMessage);
    messageId;
  };

  /// Get messages in a conversation; caller must be one of the participants
  public query ({ caller }) func getMessages(conversationId : Text) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can read messages");
    };
    let callerUsername = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    messages.values().toArray().filter(
      func(m : Message) : Bool {
        let matches = (m.senderId # m.receiverId == conversationId) or (m.receiverId # m.senderId == conversationId);
        let isParticipant = (m.senderId == callerUsername) or (m.receiverId == callerUsername);
        matches and isParticipant;
      }
    );
  };

  // ─── Event operations ─────────────────────────────────────────────────────

  /// Create an event (authenticated users only)
  public shared ({ caller }) func createEvent(title : Text, description : Text, location : Text, date : Int) : async EventId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create events");
    };
    let organizerId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    let eventId = organizerId # Time.now().toText();
    let newEvent : Event = {
      id = eventId;
      organizerId;
      title;
      description;
      location;
      date;
      image = null;
      attendeesCount = 0;
    };
    events.add(eventId, newEvent);
    eventId;
  };

  /// Get a single event (public read)
  public query func getEvent(eventId : EventId) : async ?Event {
    events.get(eventId);
  };

  /// Get all events (public read)
  public query func getAllEvents() : async [Event] {
    events.values().toArray();
  };

  /// Mark attendance for an event (authenticated users only)
  public shared ({ caller }) func attendEvent(eventId : EventId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can attend events");
    };
    switch (events.get(eventId)) {
      case (?event) {
        events.add(eventId, { event with attendeesCount = event.attendeesCount + 1 });
      };
      case (null) { Runtime.trap("Event not found") };
    };
  };

  // ─── Build Showcase operations ────────────────────────────────────────────

  /// Create a build showcase (authenticated users only)
  public shared ({ caller }) func createBuild(title : Text, description : Text, specs : Text) : async BuildId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create build showcases");
    };
    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    let buildId = authorId # Time.now().toText();
    let newBuild : BuildShowcase = {
      id = buildId;
      authorId;
      title;
      description;
      images = [];
      specs;
      createdAt = Time.now();
    };
    builds.add(buildId, newBuild);
    buildId;
  };

  /// Get a single build showcase (public read)
  public query func getBuild(buildId : BuildId) : async ?BuildShowcase {
    builds.get(buildId);
  };

  /// Get all build showcases (public read)
  public query func getAllBuilds() : async [BuildShowcase] {
    builds.values().toArray();
  };

  // ─── Like operations ──────────────────────────────────────────────────────

  /// Like a post; userId is derived from the caller's profile
  public shared ({ caller }) func likePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    let userId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    let currentLikes = switch (likes.get(postId)) {
      case (?l) { l };
      case (null) { Set.empty<UserId>() };
    };
    currentLikes.add(userId);
    likes.add(postId, currentLikes);
  };

  /// Unlike a post; userId is derived from the caller's profile
  public shared ({ caller }) func unlikePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };
    let userId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    let currentLikes = switch (likes.get(postId)) {
      case (?l) { l };
      case (null) { Set.empty<UserId>() };
    };
    currentLikes.remove(userId);
    likes.add(postId, currentLikes);
  };

  /// Get like count for a post (public read)
  public query func getLikeCount(postId : PostId) : async Nat {
    switch (likes.get(postId)) {
      case (?l) { l.size() };
      case (null) { 0 };
    };
  };

  // ─── Feed & Search ────────────────────────────────────────────────────────

  /// Get feed by post type (public read)
  public query func getFeed(postType : PostType) : async [PostRecord] {
    posts.values().toArray().filter(func(p : PostRecord) : Bool { p.postType == postType });
  };

  /// Get all posts (public read)
  public query func getAllPosts() : async [PostRecord] {
    posts.values().toArray();
  };

  /// Search users by username or display name (public read)
  public query func searchUsers(searchQuery : Text) : async [User] {
    users.values().toArray().filter(
      func(u : User) : Bool {
        u.username.contains(#text searchQuery) or u.displayName.contains(#text searchQuery);
      }
    );
  };

  /// Search reels by category or username (authenticated users only)
  public query ({ caller }) func searchReels(searchQuery : Text) : async [PostRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search reels");
    };

    posts.values().toArray().filter(
      func(p : PostRecord) : Bool {
        if (p.postType == #reel) {
          let categoryMatches = switch (p.reelCategory) {
            case (null) { false };
            case (?category) { category.toLower().contains(#text (searchQuery.toLower())) };
          };

          let authorMatches = p.authorId.toLower().contains(#text (searchQuery.toLower()));

          categoryMatches or authorMatches;
        } else {
          false;
        };
      }
    );
  };

  // ─── Marketplace CRUD Operations ──────────────────────────────────────────

  /// Create a marketplace listing
  public shared ({ caller }) func createListing(
    title : Text,
    description : Text,
    price : Text,
    condition : { #new; #used },
    category : Text,
    imageUrl : Text
  ) : async MarketplaceListingId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };
    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("Unauthorized: Caller has no user profile") };
    };
    let listingId = authorId # Time.now().toText();
    let newListing : MarketplaceListing = {
      id = listingId;
      authorId;
      title;
      description;
      price;
      condition;
      category;
      imageUrl;
      createdAt = Time.now();
      sold = false;
    };
    marketplaceListings.add(listingId, newListing);
    listingId;
  };

  /// Get a single listing (public read)
  public query func getListing(listingId : MarketplaceListingId) : async ?MarketplaceListing {
    marketplaceListings.get(listingId);
  };

  /// Get all listings (public read)
  public query func getAllListings() : async [MarketplaceListing] {
    marketplaceListings.values().toArray();
  };

  /// Update a listing (author only)
  public shared ({ caller }) func updateListing(
    listingId : MarketplaceListingId,
    title : Text,
    description : Text,
    price : Text,
    condition : { #new; #used },
    category : Text,
    imageUrl : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };
    let maybeListing = marketplaceListings.get(listingId);

    switch (maybeListing) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { Runtime.trap("Unauthorized: Caller has no profile") };
        };
        if (listing.authorId != callerUsername) {
          Runtime.trap("Unauthorized: Only the author can update their listing");
        };
        let updatedListing : MarketplaceListing = {
          id = listingId;
          authorId = listing.authorId;
          title;
          description;
          price;
          condition;
          category;
          imageUrl;
          createdAt = listing.createdAt;
          sold = listing.sold;
        };
        marketplaceListings.add(listingId, updatedListing);
      };
    };
  };

  /// Delete a listing (author only)
  public shared ({ caller }) func deleteListing(listingId : MarketplaceListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };
    let maybeListing = marketplaceListings.get(listingId);

    switch (maybeListing) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { Runtime.trap("Unauthorized: Caller has no profile") };
        };
        if (listing.authorId != callerUsername) {
          Runtime.trap("Unauthorized: Only the author can delete their listing");
        };
        marketplaceListings.remove(listingId);
      };
    };
  };

  /// Mark a listing as sold (author only)
  public shared ({ caller }) func markListingAsSold(listingId : MarketplaceListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark listings as sold");
    };
    let maybeListing = marketplaceListings.get(listingId);

    switch (maybeListing) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { Runtime.trap("Unauthorized: Caller has no profile") };
        };
        if (listing.authorId != callerUsername) {
          Runtime.trap("Unauthorized: Only the author can mark their listing as sold");
        };
        let updatedListing : MarketplaceListing = {
          listing with sold = true
        };
        marketplaceListings.add(listingId, updatedListing);
      };
    };
  };

  /// Search listings by title, description, or category (public read)
  public query func searchListings(searchQuery : Text) : async [MarketplaceListing] {
    marketplaceListings.values().toArray().filter(
      func(l : MarketplaceListing) : Bool {
        l.title.contains(#text searchQuery) or l.description.contains(#text searchQuery) or l.category.contains(#text searchQuery);
      }
    );
  };
};
