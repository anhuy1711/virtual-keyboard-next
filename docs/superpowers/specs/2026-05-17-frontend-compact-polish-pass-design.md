# Frontend Compact Polish Pass Design

## Goal
Reduce the overall perceived scale of the storefront UI while preserving the current premium visual direction. The interface should feel more balanced and less oversized on desktop, without becoming dense or generic.

## Scope
This pass covers the main customer-facing frontend screens and shared layout primitives:
- global storefront container sizing
- home page
- products listing
- product detail
- cart
- checkout
- account
- shared navigation/footer only where their scale contributes to inconsistency

Admin pages are out of the primary scope unless a small consistency fix is directly related to shared tokens or obvious oversizing.

## Design Direction
Use a selective reduction strategy rather than a redesign:
- keep the existing Manrope + Inter pairing
- keep the current luxury/editorial tone
- reduce oversized headings on utility pages
- reduce large desktop paddings and vertical spacing where multiple generous values stack together
- retain larger type only where it is part of the intended hierarchy, especially the home hero

## Typography
- Hero headings remain the largest type in the system.
- Utility-page top-level headings should generally move down one visual step where currently oversized.
- Body text remains largely unchanged to protect readability.
- Account/profile headings should align more closely with the rest of the storefront scale.

## Layout
- Consolidate storefront horizontal spacing toward a smaller, more consistent desktop rhythm.
- The shared marketing container should remain generous but no longer use unusually wide side gutters.
- Existing page-specific max widths can remain where content structure requires them, but the most visibly inconsistent horizontal padding should be normalized.

## Spacing
- Reduce section padding, grid gaps, and stacked margins on the pages that currently combine several large spacing values.
- Preserve breathing room between major sections, but avoid simultaneously using very large section padding, content gaps, and large headings in the same viewport.
- Cart, checkout, and product list should become visibly tighter first because they currently read as the most oversized.

## Expected Outcome
After the pass:
- the UI still feels premium and calm
- desktop views feel less inflated
- more content fits naturally on screen
- the visual scale is more consistent across storefront pages
- no page should feel dramatically denser than the current design

## Non-goals
- no color-system redesign
- no component redesign
- no admin information architecture changes
- no behavior changes to data fetching, cart logic, checkout flow, or auth

## Verification
- run lint/build checks after edits
- manually review the adjusted Tailwind/CSS values for consistency across the touched screens
- confirm that responsive breakpoints still preserve adequate spacing on tablet and mobile
