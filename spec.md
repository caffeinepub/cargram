# Specification

## Summary
**Goal:** Add a persistent, clickable BullBoost Performance logo banner to every authenticated page in the RevGrid app.

**Planned changes:**
- Save the BullBoost Performance logo as a static asset at `frontend/public/assets/generated/bullboost-logo.dim_760x200.png`
- Add a clickable banner strip inside the Layout component, visible on all authenticated routes
- Wrap the logo image in an anchor tag linking to `https://bullboostperformance.com/?ref=xprbexxu` with `target="_blank"` and `rel="noopener noreferrer"`
- Style the banner with a dark/asphalt background consistent with the app's automotive theme, placed between the TopBar and main content (or above the BottomNav), similar to the existing eBay affiliate banner
- Banner does not appear on unauthenticated/landing/intro pages

**User-visible outcome:** On every authenticated page, users see a slim BullBoost Performance banner. Clicking it opens the BullBoost Performance website in a new tab.
