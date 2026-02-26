import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserId = Text;
  type PostId = Text;
  type CommentId = Text;
  type MessageId = Text;
  type EventId = Text;
  type BuildId = Text;
  type MarketplaceListingId = Text;

  type PersistedActor = {
    principalProfiles : Map.Map<Principal, UserProfile>;
    users : Map.Map<UserId, User>;
    posts : Map.Map<PostId, PostRecord>;
    comments : Map.Map<CommentId, Comment>;
    messages : Map.Map<MessageId, Message>;
    events : Map.Map<EventId, Event>;
    builds : Map.Map<BuildId, BuildShowcase>;
    marketplaceListings : Map.Map<MarketplaceListingId, MarketplaceListing>;
    follows : Map.Map<UserId, Set.Set<UserId>>;
    likes : Map.Map<PostId, Set.Set<UserId>>;
  };

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
    coverPhotoData : ?Text;
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
    mediaData : ?Text;
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

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };
    principalProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    principalProfiles.add(caller, profile);
    users.add(profile.username, profile);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    principalProfiles.get(user);
  };

  public shared ({ caller }) func updateProfilePic(imageBase64 : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
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
      case (null) {};
    };
  };

  public shared ({ caller }) func updateCoverPhoto(coverPhotoData : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };

    switch (principalProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile : UserProfile = { profile with coverPhotoData };
        principalProfiles.add(caller, updatedProfile);
        users.add(profile.username, updatedProfile);
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func createUser(username : Text, displayName : Text, bio : Text, carInfo : Text) : async UserId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return "";
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
      coverPhotoData = null;
    };
    users.add(userId, newUser);
    principalProfiles.add(caller, newUser);
    follows.add(userId, Set.empty<UserId>());
    userId;
  };

  public query func getUser(userId : UserId) : async ?User {
    users.get(userId);
  };

  public shared ({ caller }) func createPost(
    caption : Text,
    tags : [Text],
    postType : PostType,
    reelCategory : ?Text,
    mediaData : ?Text,
  ) : async ?PostRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };

    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return null };
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
      mediaData;
    };
    posts.add(postId, newPost);
    ?newPost;
  };

  public query func getPost(postId : PostId) : async ?PostRecord {
    posts.get(postId);
  };

  public shared ({ caller }) func deletePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    let maybePost = posts.get(postId);

    switch (maybePost) {
      case (null) {};
      case (?post) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { return };
        };
        if (post.authorId != callerUsername) {
          return;
        };

        posts.remove(postId);
        likes.remove(postId);

        let commentEntries = comments.entries();
        for ((commentId, comment) in commentEntries) {
          if (comment.postId == postId) {
            comments.remove(commentId);
          };
        };
      };
    };
  };

  public shared ({ caller }) func addComment(postId : PostId, text : Text) : async CommentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return "";
    };
    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return "" };
    };
    let commentId = postId # Time.now().toText();
    let newComment : Comment = { id = commentId; postId; authorId; text; createdAt = Time.now() };
    comments.add(commentId, newComment);
    commentId;
  };

  public query func getComments(postId : PostId) : async [Comment] {
    comments.values().toArray().filter(func(c : Comment) : Bool { c.postId == postId });
  };

  public query func getCommentCount(postId : PostId) : async Nat {
    var count = 0;
    for (comment in comments.values()) {
      if (comment.postId == postId) {
        count += 1;
      };
    };
    count;
  };

  public shared ({ caller }) func followUser(followeeId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    let followerId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return };
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

  public shared ({ caller }) func unfollowUser(followeeId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    let followerId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return };
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
        let newCount = if (user.followersCount > 0) { user.followersCount - 1 : Nat } else { 0 };
        users.add(followeeId, { user with followersCount = newCount });
      };
      case (null) {};
    };
    switch (users.get(followerId)) {
      case (?user) {
        let newCount = if (user.followingCount > 0) { user.followingCount - 1 : Nat } else { 0 };
        users.add(followerId, { user with followingCount = newCount });
      };
      case (null) {};
    };
  };

  public query func getFollowers(userId : UserId) : async [UserId] {
    var result : [UserId] = [];
    for ((followerId, followeeSet) in follows.entries()) {
      if (followeeSet.contains(userId)) {
        result := result.concat([followerId]);
      };
    };
    result;
  };

  public query func getFollowing(userId : UserId) : async [UserId] {
    switch (follows.get(userId)) {
      case (?f) { f.toArray() };
      case (null) { [] };
    };
  };

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

  public shared ({ caller }) func sendMessage(receiverId : UserId, text : Text) : async MessageId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return "";
    };
    let senderId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return "" };
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

  public query ({ caller }) func getMessages(conversationId : Text) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return [];
    };
    let callerUsername = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return [] };
    };
    messages.values().toArray().filter(
      func(m : Message) : Bool {
        let matches = (m.senderId # m.receiverId == conversationId) or (m.receiverId # m.senderId == conversationId);
        let isParticipant = (m.senderId == callerUsername) or (m.receiverId == callerUsername);
        matches and isParticipant;
      }
    );
  };

  public shared ({ caller }) func createEvent(title : Text, description : Text, location : Text, date : Int) : async EventId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return "";
    };
    let organizerId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return "" };
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

  public query func getEvent(eventId : EventId) : async ?Event {
    events.get(eventId);
  };

  public query func getAllEvents() : async [Event] {
    events.values().toArray();
  };

  public shared ({ caller }) func attendEvent(eventId : EventId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    switch (events.get(eventId)) {
      case (?event) {
        events.add(eventId, { event with attendeesCount = event.attendeesCount + 1 });
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func createBuild(title : Text, description : Text, specs : Text) : async BuildId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return "";
    };
    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return "" };
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

  public query func getBuild(buildId : BuildId) : async ?BuildShowcase {
    builds.get(buildId);
  };

  public query func getAllBuilds() : async [BuildShowcase] {
    builds.values().toArray();
  };

  public shared ({ caller }) func likePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    let userId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return };
    };
    let currentLikes = switch (likes.get(postId)) {
      case (?l) { l };
      case (null) { Set.empty<UserId>() };
    };
    currentLikes.add(userId);
    likes.add(postId, currentLikes);
  };

  public shared ({ caller }) func unlikePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    let userId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return };
    };
    let currentLikes = switch (likes.get(postId)) {
      case (?l) { l };
      case (null) { Set.empty<UserId>() };
    };
    currentLikes.remove(userId);
    likes.add(postId, currentLikes);
  };

  public query func getLikeCount(postId : PostId) : async Nat {
    switch (likes.get(postId)) {
      case (?l) { l.size() };
      case (null) { 0 };
    };
  };

  public query func getFeed(postType : PostType) : async [PostRecord] {
    posts.values().toArray().filter(func(p : PostRecord) : Bool { p.postType == postType });
  };

  public query func getAllPosts() : async [PostRecord] {
    posts.values().toArray();
  };

  public query func searchUsers(searchQuery : Text) : async [User] {
    users.values().toArray().filter(
      func(u : User) : Bool {
        u.username.contains(#text searchQuery) or u.displayName.contains(#text searchQuery);
      }
    );
  };

  public query func searchReels(searchQuery : Text) : async [PostRecord] {
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

  public shared ({ caller }) func createListing(
    title : Text,
    description : Text,
    price : Text,
    condition : { #new; #used },
    category : Text,
    imageUrl : Text
  ) : async MarketplaceListingId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return "";
    };
    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { return "" };
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

  public query func getListing(listingId : MarketplaceListingId) : async ?MarketplaceListing {
    marketplaceListings.get(listingId);
  };

  public query func getAllListings() : async [MarketplaceListing] {
    marketplaceListings.values().toArray();
  };

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
      return;
    };
    let maybeListing = marketplaceListings.get(listingId);

    switch (maybeListing) {
      case (null) {};
      case (?listing) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { return };
        };
        if (listing.authorId != callerUsername) {
          return;
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

  public shared ({ caller }) func deleteListing(listingId : MarketplaceListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    let maybeListing = marketplaceListings.get(listingId);

    switch (maybeListing) {
      case (null) {};
      case (?listing) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { return };
        };
        if (listing.authorId != callerUsername) {
          return;
        };
        marketplaceListings.remove(listingId);
      };
    };
  };

  public shared ({ caller }) func markListingAsSold(listingId : MarketplaceListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    let maybeListing = marketplaceListings.get(listingId);

    switch (maybeListing) {
      case (null) {};
      case (?listing) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { return };
        };
        if (listing.authorId != callerUsername) {
          return;
        };
        let updatedListing : MarketplaceListing = {
          listing with sold = true
        };
        marketplaceListings.add(listingId, updatedListing);
      };
    };
  };

  public query func searchListings(searchQuery : Text) : async [MarketplaceListing] {
    marketplaceListings.values().toArray().filter(
      func(l : MarketplaceListing) : Bool {
        l.title.contains(#text searchQuery) or l.description.contains(#text searchQuery) or l.category.contains(#text searchQuery);
      }
    );
  };
};
