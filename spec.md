# Specification

## Summary
**Goal:** Add a static "Altered Imports" Tuner Shop page to the RevGrid app with full shop content, styled in the existing dark asphalt/amber automotive theme.

**Planned changes:**
- Create `frontend/src/pages/TunerShopPage.tsx` with the following sections:
  - Hero section with shop name "Altered Imports" and subheading
  - About/Mission section with full shop description
  - Services section ("What We Specialize In") displaying 7 specializations as styled cards/list
  - Closing paragraph
  - Amber-styled tagline: "Build different. Build altered."
  - Location section showing "Wenatchee"
  - Contact section with Instagram @mr.altered link (opens in new tab) and tappable phone link (tel:509-679-1389)
- Register an authenticated route `/tuner-shop` in `frontend/src/App.tsx` pointing to `TunerShopPage`
- Add a "Tuner Shop" navigation entry point in the TopBar or Profile page linking to `/tuner-shop`

**User-visible outcome:** Authenticated users can navigate to a "Tuner Shop" page that displays all content for Altered Imports, including services, location, and contact info, styled consistently with the rest of the app.
