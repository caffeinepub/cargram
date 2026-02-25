# Specification

## Summary
**Goal:** Allow users to upload a profile picture that is stored on-chain and displayed throughout the app.

**Planned changes:**
- Add an optional `profilePicData : ?Text` field to the `UserProfile` backend data model
- Add an `updateProfilePic(data: Text) : async ()` backend function that stores base64 image data for the authenticated caller
- Ensure all existing profile query functions return the new `profilePicData` field
- Update `EditProfileModal` to include a file input (`accept="image/*"`) for selecting a profile picture
- Show a circular preview of the selected image in `EditProfileModal` before saving
- Encode the selected image as base64 and call `updateProfilePic` on save
- Display the updated profile picture wherever user avatars appear: `ProfilePage`, `PostCard`, `CommentsSheet`, `UserListItem`, `ReelsPage`

**User-visible outcome:** Users can upload a profile picture from their device in the Edit Profile modal; the image is saved on-chain and immediately shown as their avatar across the entire app.
