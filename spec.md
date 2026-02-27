# Specification

## Summary
**Goal:** Fix the blank white screen preventing RevGrid from loading in production, and add a guest view mode so unauthenticated visitors can browse all content without being blocked.

**Planned changes:**
- Audit and fix `App.tsx`, `AuthGate.tsx`, and the routing/lazy-load setup to resolve the blank screen on first load
- Add `Suspense` fallbacks to all lazy-loaded page components so chunk failures do not silently render nothing
- Add an `ErrorBoundary` that displays a user-facing error message instead of a blank screen on critical render errors
- Update `AuthGate` so unauthenticated (guest) users are no longer redirected away from public pages — only action-requiring flows remain gated
- Allow guests to view all public pages: feed, reels, builds, events, marketplace, mechanics, leaderboard, discover, and user profiles
- Disable or prompt authentication on all interactive controls (like, comment, follow, post creation, messaging, etc.) when accessed by a guest
- Show a persistent, non-intrusive banner prompting guests to log in with Internet Identity
- Redirect guests who navigate directly to creation pages (e.g. `/create-post`, `/create-reel`) to the landing page or a login prompt

**User-visible outcome:** The app reliably loads visible content on first visit for all users. Unauthenticated visitors can browse the entire site in read-only mode and are gently prompted to log in when they attempt to use interactive features.
