import Map "mo:core/Map";
import Set "mo:core/Set";
import Storage "blob-storage/Storage";

module {
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

  type OldPostRecord = {
    id : PostId;
    authorId : UserId;
    image : ?Storage.ExternalBlob;
    caption : Text;
    tags : [Text];
    postType : PostType;
    createdAt : Int;
    reelCategory : ?Text;
  };

  type NewPostRecord = {
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

  type OldActor = {
    principalProfiles : Map.Map<Principal, UserProfile>;
    users : Map.Map<UserId, User>;
    posts : Map.Map<PostId, OldPostRecord>;
    comments : Map.Map<CommentId, Comment>;
    messages : Map.Map<MessageId, Message>;
    events : Map.Map<EventId, Event>;
    builds : Map.Map<BuildId, BuildShowcase>;
    marketplaceListings : Map.Map<MarketplaceListingId, MarketplaceListing>;
    follows : Map.Map<UserId, Set.Set<UserId>>;
    likes : Map.Map<PostId, Set.Set<UserId>>;
  };

  type NewActor = {
    principalProfiles : Map.Map<Principal, UserProfile>;
    users : Map.Map<UserId, User>;
    posts : Map.Map<PostId, NewPostRecord>;
    comments : Map.Map<CommentId, Comment>;
    messages : Map.Map<MessageId, Message>;
    events : Map.Map<EventId, Event>;
    builds : Map.Map<BuildId, BuildShowcase>;
    marketplaceListings : Map.Map<MarketplaceListingId, MarketplaceListing>;
    follows : Map.Map<UserId, Set.Set<UserId>>;
    likes : Map.Map<PostId, Set.Set<UserId>>;
  };

  public func run(old : OldActor) : NewActor {
    let newPosts = old.posts.map<PostId, OldPostRecord, NewPostRecord>(
      func(_postId, oldPost) {
        { oldPost with mediaData = null };
      }
    );
    {
      old with posts = newPosts
    };
  };
};

