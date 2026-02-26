# Specification

## Summary
**Goal:** Replace the text-based eBay affiliate banner with an image banner and display all three sponsor banners (eBay, BullBoost, Enjuku Racing) side-by-side in a single horizontal row.

**Planned changes:**
- Create a new eBay banner image by compositing the slammed orange Honda Civic rear photo with the RevGrid logo overlaid, saved as `ebay-banner.dim_940x313.jpg`
- Replace the existing text-based eBay affiliate banner in `Layout.tsx` with the new image banner linked to the eBay affiliate URL
- Arrange all three sponsor banners (eBay, BullBoost, Enjuku Racing) side-by-side in one horizontal row, each as a clickable image linking to their respective URLs in a new tab
- Style the banner row with the app's dark asphalt/amber automotive theme

**User-visible outcome:** Users see a horizontal strip with all three sponsor banners displayed as images side-by-side on every authenticated page, replacing the previous text-based eBay banner.
