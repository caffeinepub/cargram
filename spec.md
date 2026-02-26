# Specification

## Summary
**Goal:** Increase the file upload size limit from ~1.5 MB to 10 MB across all post creation pages in RevGrid.

**Planned changes:**
- Update file size validation on `CreateFeedPostPage` to allow files up to 10 MB and show a clear error message for files exceeding the limit
- Update file size validation on `CreateMechanicQuestionPage` to allow files up to 10 MB with the same error messaging
- Update file size validation on `CreateBuildPage` to allow files up to 10 MB per image input with the same error messaging
- Update file size validation on `CreateListingPage` to allow files up to 10 MB with the same error messaging
- Remove any artificial size cap or assertion on `mediaData`/`imageUrl` fields in the backend `createPost` function, and add a comment documenting the ICP ingress message size limit

**User-visible outcome:** Users can upload image files up to 10 MB when creating feed posts, mechanic questions, builds, and marketplace listings. Files over 10 MB are rejected with a clear error message stating the limit.
