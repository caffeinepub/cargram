# Specification

## Summary
**Goal:** Add a dedicated `/install` route to the RevGrid app that renders the existing `InstallPage` component, and add a visible navigation entry point so users can discover and access it.

**Planned changes:**
- Register a `/install` route in the TanStack Router configuration (`App.tsx`) that renders the existing `InstallPage` component, nested under the root layout so TopBar and BottomNav remain visible.
- Add an "Install App" or "Download App" navigation element (link, button, or menu item) in the TopBar, BottomNav, or settings/about area that routes users to `/install`.

**User-visible outcome:** Users can navigate to `/install` directly or via an in-app link to access the PWA install/download page.
