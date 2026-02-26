# Specification

## Summary
**Goal:** Replace the BullBoost Performance banner image in the sponsor row with the newly uploaded logo.

**Planned changes:**
- Save the cropped/resized BullBoost Performance logo as `frontend/public/assets/generated/bullboost-logo.dim_760x200.png`
- Update the BullBoost banner in `Layout.tsx` to use the new image, keeping it as a clickable link to `https://bullboostperformance.com/?ref=xprbexxu` with `target="_blank"` and `rel="noopener noreferrer"`

**User-visible outcome:** The BullBoost Performance sponsor banner displays the correct new logo, shown alongside the eBay and Enjuku Racing banners in the horizontal sponsor row.
