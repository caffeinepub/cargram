import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type definitions
  type UserId = Text;
  type PostId = Text;
  type CommentId = Text;
  type MessageId = Text;
  type EventId = Text;
  type BuildId = Text;
  type MarketplaceListingId = Text;

  public type UserProfile = {
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

  public type User = UserProfile;

  public type PostType = { #feed; #reel; #build; #mechanic };

  public type PostRecord = {
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

  public type Comment = {
    id : CommentId;
    postId : PostId;
    authorId : UserId;
    text : Text;
    createdAt : Int;
  };

  public type Message = {
    id : MessageId;
    senderId : UserId;
    receiverId : UserId;
    text : Text;
    createdAt : Int;
  };

  public type Event = {
    id : EventId;
    organizerId : UserId;
    title : Text;
    description : Text;
    location : Text;
    date : Int;
    image : ?Storage.ExternalBlob;
    attendeesCount : Nat;
  };

  public type BuildShowcase = {
    id : BuildId;
    authorId : UserId;
    title : Text;
    description : Text;
    images : [Storage.ExternalBlob];
    specs : Text;
    createdAt : Int;
  };

  public type MarketplaceListing = {
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

  // Stable data stores (now private)
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

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    principalProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    principalProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    principalProfiles.add(caller, profile);
    users.add(profile.username, profile);
  };

  public shared ({ caller }) func updateProfilePic(imageBase64 : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profile pictures");
    };
    switch (principalProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile : UserProfile = { profile with profilePicData = ?imageBase64 };
        principalProfiles.add(caller, updatedProfile);
        users.add(profile.username, updatedProfile);
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func updateCoverPhoto(coverPhotoData : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cover photos");
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

  // Post management
  public shared ({ caller }) func createPost(
    caption : Text,
    tags : [Text],
    postType : PostType,
    reelCategory : ?Text,
    mediaData : ?Text,
  ) : async ?PostRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("No profile found for caller") };
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
      Runtime.trap("Unauthorized: Only users can delete posts");
    };
    let maybePost = posts.get(postId);
    switch (maybePost) {
      case (null) {};
      case (?post) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { Runtime.trap("No profile found for caller") };
        };
        if (post.authorId != callerUsername and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own posts");
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

  // Comments
  public shared ({ caller }) func addComment(postId : PostId, text : Text) : async CommentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };
    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("No profile found for caller") };
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

  // Follow functionality
  public shared ({ caller }) func followUser(followeeId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    let followerId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("No profile found for caller") };
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
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };
    let followerId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("No profile found for caller") };
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
      Runtime.trap("Unauthorized: Only users can check following status");
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

  // Messaging
  public shared ({ caller }) func sendMessage(receiverId : UserId, text : Text) : async MessageId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    let senderId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("No profile found for caller") };
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
      Runtime.trap("Unauthorized: Only users can read messages");
    };
    let callerUsername = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("No profile found for caller") };
    };
    messages.values().toArray().filter(
      func(m : Message) : Bool {
        let matches = (m.senderId # m.receiverId == conversationId) or (m.receiverId # m.senderId == conversationId);
        let isParticipant = (m.senderId == callerUsername) or (m.receiverId == callerUsername);
        matches and isParticipant;
      }
    );
  };

  // Event management
  public shared ({ caller }) func createEvent(title : Text, description : Text, location : Text, date : Int) : async EventId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create events");
    };
    let organizerId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("No profile found for caller") };
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
      Runtime.trap("Unauthorized: Only users can attend events");
    };
    switch (events.get(eventId)) {
      case (?event) {
        events.add(eventId, { event with attendeesCount = event.attendeesCount + 1 });
      };
      case (null) {};
    };
  };

  // Build showcase
  public shared ({ caller }) func createBuild(title : Text, description : Text, specs : Text) : async BuildId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create builds");
    };
    let authorId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("No profile found for caller") };
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

  // Likes
  public shared ({ caller }) func likePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    let userId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("No profile found for caller") };
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
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };
    let userId = switch (principalProfiles.get(caller)) {
      case (?p) { p.username };
      case (null) { Runtime.trap("No profile found for caller") };
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

  // Search functionality
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

  // Marketplace listings
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
      case (null) { Runtime.trap("No profile found for caller") };
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
      Runtime.trap("Unauthorized: Only users can update listings");
    };
    let maybeListing = marketplaceListings.get(listingId);

    switch (maybeListing) {
      case (null) {};
      case (?listing) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { Runtime.trap("No profile found for caller") };
        };
        if (listing.authorId != callerUsername and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own listings");
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
      Runtime.trap("Unauthorized: Only users can delete listings");
    };
    let maybeListing = marketplaceListings.get(listingId);

    switch (maybeListing) {
      case (null) {};
      case (?listing) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { Runtime.trap("No profile found for caller") };
        };
        if (listing.authorId != callerUsername and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own listings");
        };
        marketplaceListings.remove(listingId);
      };
    };
  };

  public shared ({ caller }) func markListingAsSold(listingId : MarketplaceListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark listings as sold");
    };
    let maybeListing = marketplaceListings.get(listingId);

    switch (maybeListing) {
      case (null) {};
      case (?listing) {
        let callerUsername = switch (principalProfiles.get(caller)) {
          case (?p) { p.username };
          case (null) { Runtime.trap("No profile found for caller") };
        };
        if (listing.authorId != callerUsername and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only mark your own listings as sold");
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

  // Leaderboard
  type LeaderboardUser = {
    username : Text;
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    followersCount : Nat;
    postCount : Nat;
  };

  public query func getLeaderboard() : async [LeaderboardUser] {
    let userEntries = users.values().toArray();

    let leaderboardUsers = userEntries.map(
      func(user) {
        let postCount = posts.values().toArray().filter(func(p) { p.authorId == user.username }).size();
        {
          username = user.username;
          displayName = user.displayName;
          avatar = user.profilePic;
          followersCount = user.followersCount;
          postCount;
        };
      }
    );

    let sortedLeaderboard = leaderboardUsers.sort(
      func(a, b) {
        if (a.followersCount == b.followersCount) {
          Nat.compare(b.postCount, a.postCount);
        } else {
          Int.compare(b.followersCount, a.followersCount);
        };
      }
    );

    switch (sortedLeaderboard.size()) {
      case (size) {
        if (size <= 50) { sortedLeaderboard } else {
          Array.tabulate<LeaderboardUser>(
            50,
            func(i) { sortedLeaderboard[i] },
          );
        };
      };
    };
  };

  // Automotive Assistant Query
  public query func askAutomotiveAssistant(question : Text) : async Text {
    "Automotive AI Response for Question: \n".concat(
      "<h2>Car Building Topics: </h2>" #
      "<li>engine</li><li>suspension</li><li>brakes</li><li>turbo</li><li>supercharging</li><li>exhaust</li><li>diagnostics</li><li>maintenance</li><li>performance</li><li>tuning</li><li>modifications</li><li>bodywork</li>" #
      "<h2>Detailed Answer: </h2>" #
      matchQuestionToAnswer(question)
    );
  };

  func matchQuestionToAnswer(question : Text) : Text {
    let lower = question.toLower();
    if (lower.contains(#text "engine")) { engineExpertAnswer() } else if (lower.contains(#text "transmission")) {
      transmissionExpertAnswer();
    } else if (lower.contains(#text "suspension")) { suspensionExpertAnswer() } else if (lower.contains(#text "brakes")) {
      brakesExpertAnswer();
    } else if (lower.contains(#text "turbo")) { forcedInductionExpertAnswer() } else if (lower.contains(#text "supercharger")) {
      forcedInductionExpertAnswer();
    } else if (lower.contains(#text "exhaust")) { exhaustExpertAnswer() } else if (lower.contains(#text "bodywork")) {
      bodyworkExpertAnswer();
    } else if (lower.contains(#text "diagnostics")) {
      diagnosticsExpertAnswer();
    } else if (lower.contains(#text "maintenance")) {
      maintenanceExpertAnswer();
    } else if (lower.contains(#text "performance")) {
      performanceExpertAnswer();
    } else {
      genericExpertAnswer();
    };
  };

  func engineExpertAnswer() : Text {
    "<h2>Engine Building and Tuning (Expert AI):</h2>
      <p>
       Building a high-performance engine involves careful planning, precise machining, and expert tuning.
       Key steps include balancing rotating assembly, blueprinting, and optimizing airflow.
      </p>
      <h4>Assembly Checklist:</h4>
        <ul>
          <li>Install forged pistons, rods, and crankshaft for higher RPM reliability</li>
          <li>Upgrade valvetrain, camshaft, and compression for performance gains</li>
          <li>Balance and tune all components precisely</li>
        </ul>

        <h4>Fuel and Air Delivery:</h4>
        <ul>
          <li>Ported cylinder heads</li>
          <li>High-flow intake and headers</li>
          <li>Tuned exhaust system for optimal pressure</li>
        </ul>

        <h4>Forced Induction:</h4>
        <ul>
          <li>Twin-turbo or supercharger setup</li>
          <li>Intercooler and fuel management for higher boost</li>
          <li>Tuned for significant horsepower gains</li>
        </ul>
        With expert setup, 1000+ horsepower is achievable while maintaining drivability.";
  };

  func transmissionExpertAnswer() : Text {
    "<h2>Transmission and Driveline (Expert AI):</h2>
     <p>
      Transmission upgrades are crucial for handling increased power.
      Swap options, gear ratios, and torque converters impact performance.
     </p>
     <h4>Transmission Types:</h4>
       <ul>
         <li>Manual gearboxes for sports cars</li>
         <li>Automatic for drag racing and daily driving</li>
       </ul>

       <h4>High-Performance Features:</h4>
       <ul>
         <li>Strengthened input shafts, synchros, and bearings</li>
         <li>Performance clutches and torque converters</li>
         <li>Proper tuning for smooth shifting at high RPMs</li>
       </ul>";
  };

  func suspensionExpertAnswer() : Text {
    "<h2>Suspension and Handling (Expert AI):</h2>
     <p>
      Expert suspension tuning transforms handling and stability. Key areas include alignment, coilovers, sway bars, and bushings.
     </p>
     <h4>Performance Upgrades:</h4>
       <ul>
         <li>Fully adjustable coilovers for ride height and damping</li>
         <li>Tuned spring rates for desired handling characteristics</li>
         <li>Upgraded sway bars and bushings for reduced body roll</li>
       </ul>";
  };

  func brakesExpertAnswer() : Text {
    "<h2>Brakes, Wheels & Safety (Expert AI):</h2>
     <p>
      High-performance builds require braking and safety upgrades. Balance power with high-quality brakes and safety systems.
     </p>
     <h4>Braking & Handling:</h4>
       <ul>
         <li>Large, multi-piston calipers and rotors for fade resistance</li>
         <li>Performance brake pads tailored to street/track use</li>
         <li>Proper torque management for stability at high speeds</li>
       </ul>";
  };

  func forcedInductionExpertAnswer() : Text {
    "<h2>Forced Induction Tuning (Expert AI):</h2>
     <p>
      Turbocharging and supercharging require expert tuning. Key areas include air/fuel management, cooling, and engine internals.
     </p>
     <h4>Performance Upgrades:</h4>
       <ul>
         <li>Larger turbo or supercharger for increased boost</li>
         <li>Intercoolers for intense cooling and durability</li>
         <li>Engine internal upgrades to handle higher pressures</li>
       </ul>";
  };

  func exhaustExpertAnswer() : Text {
    "<h2>Exhaust System Optimization (Expert AI):</h2>
     <p>
      Exhaust tuning is crucial for optimizing airflow and engine performance. Key considerations include materials, pipe diameter, and sound management.
     </p>
     <h4>Performance Enhancements:</h4>
       <ul>
         <li>High-flow headers and collectors for improved scavenging</li>
         <li>Differently sized exhaust pipes for optimal backpressure</li>
         <li>Customizable mufflers to strike a balance between power and legal sound levels</li>
       </ul>";
  };

  func bodyworkExpertAnswer() : Text {
    "<h2>Bodywork and Exterior Customization (Expert AI):</h2>
     <p>
      Bodywork and exterior modifications enhance both form and function. Professional guidance ensures a perfect finish and optimal performance.
     </p>
     <h4>Professional Techniques:</h4>
       <ul>
         <li>High-quality paint and clear-coat application for durability</li>
         <li>Comprehensive dent and scratch repair for a flawless surface</li>
         <li>Advanced rustproofing and glass treatments to maintain long-lasting aesthetics</li>
       </ul>";
  };

  func diagnosticsExpertAnswer() : Text {
    "<h2>Advanced Diagnostics and Electronics (Expert AI):</h2>
     <p>
      Mastering diagnostics for complex systems involves expert interpretation of sensor data, oscilloscope analysis. Utilizing diagnostic tools alongside a deep understanding of automotive electronics enables accurate troubleshooting and optimization.
     </p>
     <h4>Specialized Tools:</h4>
       <ul>
         <li>Sophisticated diagnostic scanners for comprehensive system analysis</li>
         <li>Precision multimeters and oscilloscopes for electrical testing</li>
         <li>Variable tuning equipment for fine-tuning performance parameters</li>
       </ul>
       With expert guidance, you can achieve precise repairs, maximum performance, and reliable operation.";
  };

  func maintenanceExpertAnswer() : Text {
    "<h2>Automotive Maintenance (Expert AI):</h2>
     <p>
      Proper maintenance habits extend car lifespan. Key areas include regular inspections, fluid changes, suspension checks, and seasonal prep.
     </p>
     <h4>Expert Maintenance Tips:</h4>
       <ul>
         <li>Use synthetic oils for superior lubrication and extended engine life</li>
         <li>Perform comprehensive wheel alignments and tire balancing for optimal handling</li>
         <li>Conduct thorough pre-season inspections to address specific seasonal challenges</li>
       </ul>";
  };

  func performanceExpertAnswer() : Text {
    "<h2>Performance Tuning and Optimization (Expert AI):</h2>
     <p>
      Performance tuning maximizes your car's capabilities. Proper upgrades and tuning lead to significant gains in power, handling, and durability.
     </p>
     <h4>Expert Tuning:</h4>
       <ul>
         <li>Advanced engine management system</li>
         <li>Custom calibration for fuel ratio and ignition timing</li>
         <li>Precise intake/exhaust flow optimization for maximum power</li>
       </ul>";
  };

  func genericExpertAnswer() : Text {
    "<h2>General Car Building Advice (Expert AI):</h2>
     <p>
      Building custom cars is a blend of passion and process. Start with careful planning, prioritize quality parts, and seek expert guidance for safety and performance.
     </p>
     <h4>Expert Tips:</h4>
       <ul>
         <li>Start with a clear vision - Plan upgrades, performance goals, and overall design</li>
         <li>Choose reputable, high-quality parts for reliability and optimal performance</li>
         <li>Regularly maintain and inspect your build to ensure long-term reliability</li>
       </ul>
       Enjoy the rewarding journey of custom car building!";
  };
};
