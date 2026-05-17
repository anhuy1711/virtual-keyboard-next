# Frontend Compact Polish Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the perceived scale of the storefront UI while preserving its premium visual direction.

**Architecture:** Keep the existing page/component structure intact and apply a focused polish pass through shared layout primitives plus page-local Tailwind/CSS adjustments. The work is split by surface area so each task can be verified independently without changing data flow or component behavior.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, CSS modules/global CSS

---

## File Map

- `app/globals.css` — shared storefront container spacing and reusable global scale defaults.
- `app/page.tsx` — homepage hero, section spacing, product/component grids, and spec grid rhythm.
- `app/components/products-grid.tsx` — products listing page spacing and heading scale.
- `app/products/[id]/page.tsx` — product detail title size, section gutters, tab section spacing.
- `app/cart/page.tsx` — cart page title scale, content spacing, and summary-card density.
- `app/checkout/page.tsx` — checkout outer spacing, form rhythm, summary-card padding.
- `app/account/account.css` — account page heading scale, sidebar/content padding, card spacing.
- `app/components/top-nav.css` — only if navbar spacing needs minor proportional adjustment after the storefront shrink pass.
- `app/components/footer.css` — only if footer spacing feels inconsistent after the storefront shrink pass.

## Task 1: Tighten shared storefront layout scale

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Capture current shared container values**

Record the current `.layout-container` values in `app/globals.css`:
```css
.layout-container {
  max-width: 100%;
  padding-left: 160px;
  padding-right: 160px;
}
```

- [ ] **Step 2: Update desktop container spacing**

Replace the desktop and large-tablet values with a tighter scale while keeping mobile values intact:
```css
.layout-container {
  max-width: 100%;
  padding-left: 120px;
  padding-right: 120px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 1280px) {
  .layout-container {
    padding-left: 64px;
    padding-right: 64px;
  }
}
```

- [ ] **Step 3: Review shared admin typography utilities for unintended storefront dependency**

Confirm no storefront pages depend on `.admin-*` utilities before leaving them unchanged.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "style: tighten shared storefront container spacing"
```

## Task 2: Reduce homepage scale without losing hierarchy

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Reduce homepage hero and section rhythm**

Update the main homepage spacing classes as follows:
```tsx
<main className="pt-20">
...
<div className="relative h-[300px] md:h-[390px] lg:h-[460px] xl:h-[520px] overflow-hidden bg-surface-container-low rounded-xl mt-6">
...
<h2 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
```

- [ ] **Step 2: Tighten section padding and headings**

Apply these targeted reductions:
```tsx
<section className="py-14 md:py-20 bg-surface">
...
<h2 className="font-headline text-2xl md:text-3xl font-bold text-primary tracking-tight mb-3">
...
<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-5">
...
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
```

Use the same pattern for the components section and spec section:
```tsx
<section className="py-20 bg-surface-container-low">
<section className="py-14 md:py-20 bg-surface border-t border-outline-variant/15">
```

- [ ] **Step 3: Tighten secondary banner spacing**

Update:
```tsx
<section className="w-full py-10">
<div className="relative h-[260px] md:h-[340px] lg:h-[430px] rounded-xl overflow-hidden">
<h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold text-on-primary mb-5">
```

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "style: reduce homepage visual scale"
```

## Task 3: Tighten product listing density

**Files:**
- Modify: `app/components/products-grid.tsx`

- [ ] **Step 1: Reduce outer page spacing and heading scale**

Update:
```tsx
<div className="pt-28 pb-16 px-6 md:px-10 max-w-480 mx-auto">
...
<div className="flex flex-col md:flex-row justify-between items-end mb-7 gap-6">
...
<h1 className="text-4xl font-extrabold text-primary tracking-tighter">
```

- [ ] **Step 2: Tighten filters and product grid**

Update:
```tsx
<div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-5 border-y border-outline-variant/15 mb-10">
...
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
...
<div className="group flex flex-col space-y-4 cursor-pointer">
...
<h2 className="text-lg font-bold tracking-tight text-on-surface group-hover:text-secondary transition-colors">
```

- [ ] **Step 3: Tighten pagination spacing**

Update:
```tsx
<div className="mt-16 flex items-center justify-center space-x-4">
```

- [ ] **Step 4: Commit**

```bash
git add app/components/products-grid.tsx
git commit -m "style: tighten product listing layout"
```

## Task 4: Refine product detail proportions

**Files:**
- Modify: `app/products/[id]/page.tsx`

- [ ] **Step 1: Reduce page section spacing and grid gap**

Update:
```tsx
<main className="pt-28 pb-16">
<section className="max-w-360 mx-auto px-6 md:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
```

- [ ] **Step 2: Reduce product-title and CTA scale**

Update:
```tsx
<div className="lg:col-span-5 flex flex-col gap-8">
<h1 className="text-4xl font-extrabold tracking-tighter text-primary mb-4">
<p className="text-2xl font-light text-on-surface">
...
<button className="w-full py-5 bg-linear-to-r from-primary to-primary-container text-on-primary rounded-md text-base font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
```

- [ ] **Step 3: Tighten lower tabbed section**

Update:
```tsx
<section className="max-w-[1440px] mx-auto px-6 md:px-10 py-16" id="product-details-tabs">
<div className="flex border-b border-outline-variant/30 mb-10">
```

- [ ] **Step 4: Commit**

```bash
git add 'app/products/[id]/page.tsx'
git commit -m "style: refine product detail proportions"
```

## Task 5: Make cart layout more balanced

**Files:**
- Modify: `app/cart/page.tsx`

- [ ] **Step 1: Reduce page-level spacing**

Update each cart-state `<main>` wrapper to:
```tsx
<main className="pt-28 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
```

- [ ] **Step 2: Reduce top heading and content gaps**

Update:
```tsx
<div className="mb-12">
<h1 className="text-4xl font-extrabold tracking-tighter text-primary">
...
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
<div className="lg:col-span-8 space-y-10">
<div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-outline-variant/15">
```

- [ ] **Step 3: Tighten summary card and supporting elements**

Update:
```tsx
<div className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-outline-variant/10">
<h2 className="text-xl font-bold tracking-tight text-primary mb-6">
...
<div className="mt-6 flex flex-col gap-4">
<div className="mt-6 px-4 flex justify-center gap-5">
```

- [ ] **Step 4: Commit**

```bash
git add app/cart/page.tsx
git commit -m "style: rebalance cart spacing"
```

## Task 6: Tighten checkout rhythm

**Files:**
- Modify: `app/checkout/page.tsx`

- [ ] **Step 1: Reduce page and column spacing**

Update the outer content wrappers to use tighter values:
```tsx
<main className="pt-28 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
```

- [ ] **Step 2: Reduce form rhythm and heading scale**

Update:
```tsx
<form onSubmit={handleCheckout} className="space-y-10">
<section className="space-y-6">
<h2 className="text-2xl font-bold tracking-tight text-primary font-headline">
...
<section className="space-y-6 border-t border-outline-variant/15 pt-8">
```

- [ ] **Step 3: Tighten summary panel**

Update:
```tsx
<div className="sticky top-32 p-6 md:p-8 bg-surface-container-low rounded-xl">
<h3 className="text-lg font-bold tracking-tight text-primary mb-6 font-headline">
<div className="space-y-5 mb-8">
```

- [ ] **Step 4: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "style: tighten checkout spacing"
```

## Task 7: Align account page scale with storefront

**Files:**
- Modify: `app/account/account.css`

- [ ] **Step 1: Reduce desktop content scale**

Update:
```css
.account-sidebar {
  width: 264px;
  padding: 40px 20px;
}

.account-content {
  padding: 40px;
}

.content-header {
  margin-bottom: 28px;
}

.content-header h1 {
  font-size: 32px;
}

.profile-section {
  border-radius: 16px;
  padding: 32px;
}

.info-grid {
  gap: 24px;
  margin-bottom: 28px;
}

.info-item p {
  font-size: 16px;
}
```

- [ ] **Step 2: Tighten order cards**

Update:
```css
.orders-section {
  gap: 14px;
}

.order-card {
  padding: 20px;
}
```

- [ ] **Step 3: Keep responsive overrides coherent**

Check the existing media queries and ensure the mobile values still remain equal to or smaller than the desktop scale after the changes.

- [ ] **Step 4: Commit**

```bash
git add app/account/account.css
git commit -m "style: align account page scale"
```

## Task 8: Verify shared chrome and consistency

**Files:**
- Inspect: `app/components/top-nav.css`
- Inspect: `app/components/footer.css`
- Modify only if necessary after comparison with updated pages.

- [ ] **Step 1: Review nav/footer against new page scale**

Confirm whether `height: 80px`, footer `padding: 3rem 0 1rem`, and desktop gutters still feel proportionate relative to the reduced storefront scale.

- [ ] **Step 2: Apply only minor proportional fixes if needed**

Allowed examples if review shows mismatch:
```css
.navbar-container {
  padding: 0 40px;
}

.footer {
  padding: 2.5rem 0 1rem;
}
```

- [ ] **Step 3: Commit only if files changed**

```bash
git add app/components/top-nav.css app/components/footer.css
git commit -m "style: tune shared chrome spacing"
```

## Task 9: Run verification

**Files:**
- No code changes required unless verification exposes a formatting or lint issue.

- [ ] **Step 1: Run lint**

```bash
npm run lint
```
Expected: command completes successfully.

- [ ] **Step 2: Run production build**

```bash
npm run build
```
Expected: Next.js build completes successfully.

- [ ] **Step 3: Inspect git diff summary**

```bash
git diff --stat HEAD~8..HEAD
```
Expected: only the intended styling files are changed.

- [ ] **Step 4: Final commit if verification fixes were needed**

```bash
git add .
git commit -m "chore: finalize frontend compact polish pass"
```
