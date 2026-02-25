import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import Set "mo:core/Set";

module {
  type OldUserProfile = {
    id : Text;
    username : Text;
    displayName : Text;
    bio : Text;
    profilePic : ?Blob;
    carInfo : Text;
    followersCount : Nat;
    followingCount : Nat;
    createdAt : Int;
  };

  type OldActor = {
    principalProfiles : Map.Map<Principal, OldUserProfile>;
    users : Map.Map<Text, OldUserProfile>;
    follows : Map.Map<Text, Set.Set<Text>>;
  };

  type NewUserProfile = {
    id : Text;
    username : Text;
    displayName : Text;
    bio : Text;
    profilePic : ?Blob;
    carInfo : Text;
    followersCount : Nat;
    followingCount : Nat;
    createdAt : Int;
    profilePicData : ?Text;
  };

  type NewActor = {
    principalProfiles : Map.Map<Principal, NewUserProfile>;
    users : Map.Map<Text, NewUserProfile>;
    follows : Map.Map<Text, Set.Set<Text>>;
  };

  public func run(old : OldActor) : NewActor {
    let principalProfiles = old.principalProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldUser) {
        { oldUser with profilePicData = null };
      }
    );
    let users = old.users.map<Text, OldUserProfile, NewUserProfile>(
      func(_userId, oldUser) {
        { oldUser with profilePicData = null };
      }
    );
    {
      old with
      principalProfiles;
      users;
    };
  };
};
