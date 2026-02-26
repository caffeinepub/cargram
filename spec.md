# Specification

## Summary
**Goal:** Increase the maximum file size allowed for reel/video uploads from ~2 MB to 10 MB on the CreateReelPage, and ensure the backend handles larger media payloads consistently.

**Planned changes:**
- Update the file size validation on `CreateReelPage` to accept files up to 10 MB instead of the current ~1.5–2 MB cap.
- Update the user-facing error message to reflect the new 10 MB limit (e.g., "File too large — please select a file under 10 MB").
- Ensure video preview, base64 encoding, and submission flow continue to work correctly for files up to 10 MB.
- Update the backend `createPost` function in `backend/main.mo` to handle larger `mediaData` payloads without trapping, returning a structured `#err` result for invalid or oversized input.
- Align frontend and backend size limits so users see consistent error messages.

**User-visible outcome:** Users can upload reel/video files up to 10 MB on the CreateReelPage without encountering false size errors, and the post creation flow completes successfully for files within the new limit.
