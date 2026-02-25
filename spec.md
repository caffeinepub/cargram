# Specification

## Summary
**Goal:** Add a Marketplace for car parts/vehicles, enable post/reel/build deletion by authors, and enhance the Mechanics Help and Build Showcase pages.

**Planned changes:**
- Add a Marketplace page where users can browse and create listings (title, description, price, condition, category, image URL, seller info) with a contact/inquiry button on each listing
- Add backend data model and CRUD operations for marketplace listings (createListing, getAllListings, getListing, updateListing, deleteListing — owner only), persisted across upgrades
- Add a `/marketplace` route in App.tsx and a Marketplace entry in BottomNav; add a "List Item for Sale" option in the CreatePostSheet
- Add delete functionality for posts and reels (visible only to the author), with confirmation prompt, calling the backend deletePost function and removing the item from the UI without a full reload
- Expose a deletePost backend function that verifies the caller is the author before deleting
- Surface delete options on the user's own profile page for posts, reels, and builds
- Enhance the Mechanics Help question creation form with optional image URL and car model/year fields; display the image on the thread detail page when present
- Update the Build Showcase creation form to support 1–6 image URLs (dynamic add/remove); display all images in a swipeable carousel on BuildDetailPage; show a delete button on build cards for the author

**User-visible outcome:** Users can list and browse car parts/vehicles in a new Marketplace, delete their own posts/reels/builds, attach images and car info to mechanic questions, and view multiple build photos in a swipeable gallery.
