# Specification

## Summary
**Goal:** Fix post persistence so that posts survive page refreshes, browser reloads, and canister upgrades in the RevGrid application.

**Planned changes:**
- Audit and update the backend Motoko actor (`backend/main.mo`) to ensure posts and all core state (users, comments, messages, events, builds, marketplace listings) are stored in `stable` variables so data survives canister upgrades and redeployments.
- Audit and fix the frontend React Query configuration (staleTime, cacheTime, refetch strategies) for feed and post queries so posts are properly re-fetched from the backend on page load or refresh.
- Investigate and fix the post creation flow (CreateFeedPostPage, CreateReelPage, CreateMechanicQuestionPage) and the backend `createPost` endpoint to prevent posts from being silently dropped, overwritten, or stored in transient (non-stable) structures.
- Ensure post IDs are never reused or overwritten by subsequent creates.
- Add error surfacing on post creation mutations so failures are shown to the user instead of being silently discarded.

**User-visible outcome:** Posts created by users remain visible in the feed after refreshing the browser, navigating away and back, or after a canister upgrade — no posts are lost between sessions.
