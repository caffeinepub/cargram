# Specification

## Summary
**Goal:** Add a fully functional Marketplace feature to RevReel, allowing users to browse and create vehicle parts/accessories listings with images.

**Planned changes:**
- Add `MarketplaceListing` type and CRUD functions (`createListing`, `getAllListings`, `getListing`, `deleteListing`) to the backend `main.mo` actor
- Create `MarketplacePage.tsx` displaying a grid of listing cards with seller info, item details, condition badge, category, and image; includes category filter chips and empty state
- Create `CreateListingPage.tsx` with a form for title, description, price, condition, category, and image upload (base64, max 1.5 MB with preview)
- Add `useGetAllListings` and `useCreateListing` React Query hooks to `useQueries.ts`
- Register `/marketplace` and `/marketplace/create` routes in `App.tsx`
- Add a "Marketplace" / "List for Sale" option to `CreatePostSheet.tsx` navigating to `/marketplace/create`
- Add a Marketplace entry point on `DiscoverPage.tsx` linking to `/marketplace`

**User-visible outcome:** Users can browse all marketplace listings on a dedicated Marketplace page, filter by category, and create new listings with photos via a form accessible from both the Create Post sheet and the Discover page.
