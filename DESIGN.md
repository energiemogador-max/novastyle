# Design

## Color strategy: Committed

One warm terracotta-burgundy carries the brand. Neutrals tinted toward it. No competing accents.

### Palette (OKLCH)

```
--color-brand:        oklch(38% 0.12 28);    /* deep terracotta — primary */
--color-brand-light:  oklch(52% 0.10 28);    /* hover/interactive */
--color-brand-dim:    oklch(38% 0.12 28 / 0.08); /* tint backgrounds */
--color-wa:           oklch(58% 0.18 148);   /* WhatsApp green — conversion only */
--color-surface:      oklch(99% 0.005 28);   /* near-white, warm tint */
--color-surface-2:    oklch(97% 0.006 28);   /* card backgrounds */
--color-border:       oklch(90% 0.008 28);   /* subtle borders */
--color-border-strong:oklch(82% 0.010 28);   /* stronger dividers */
--color-text:         oklch(16% 0.010 28);   /* near-black, warm */
--color-text-soft:    oklch(42% 0.010 28);   /* secondary text */
--color-text-muted:   oklch(62% 0.008 28);   /* metadata, captions */
--color-price:        oklch(38% 0.12 28);    /* price = brand color */
```

### Dark mode
Not required for v1. The user base is mobile-during-day. Revisit when analytics show demand.

## Typography

### Fonts
- **Display/headings:** Gilda Display (Google Fonts) — old-style serif with artisan quality, not editorial cliché. Warm, confident, slightly architectural.
- **Body/UI:** Figtree (Google Fonts) — humanist sans, warm, legible at small sizes on mobile. Not Inter. Not DM Sans.

Three brand-voice words: **warm, mechanical, confident**. Gilda gives warmth; Figtree gives mechanical precision; together they signal craft.

### Scale (fluid, clamp-based)
```
--text-xs:   clamp(0.7rem,  1.5vw, 0.75rem);
--text-sm:   clamp(0.8rem,  1.8vw, 0.875rem);
--text-base: clamp(0.9rem,  2vw,   1rem);
--text-lg:   clamp(1rem,    2.5vw, 1.125rem);
--text-xl:   clamp(1.1rem,  3vw,   1.25rem);
--text-2xl:  clamp(1.25rem, 4vw,   1.5rem);
--text-3xl:  clamp(1.5rem,  5vw,   2rem);
--text-4xl:  clamp(1.8rem,  6vw,   2.75rem);
--text-5xl:  clamp(2.2rem,  8vw,   3.5rem);
```

### Line heights
- Display: 1.1
- Headings: 1.25
- Body: 1.7
- UI labels: 1.4

## Spacing

8px base unit. Scale: 4 8 12 16 24 32 48 64 96 128.

Section padding: `clamp(48px, 8vw, 96px)` vertical.
Container max-width: 1200px, padding 0 24px (mobile: 0 16px).

## Elevation / Borders

No box-shadow by default. Border instead: `1px solid var(--color-border)`.
Hover state: border strengthens to `--color-border-strong`, slight background tint.
Cards: `border-radius: 4px`. Buttons: `border-radius: 6px`. Pills: `border-radius: 999px`.
No drop shadows on product cards — the image provides depth.

## Components

### Product card
Image fills top (aspect-ratio 1/1, object-fit cover). Name + price below. No icons. No decorative borders. Hover: slight scale(1.02) on image, border strengthens.

### WhatsApp CTA
Always visible on mobile as a sticky bar (bottom). On desktop: prominent in header right area and in product page sidebar. Color: --color-wa. Never hidden behind a scroll.

### Buttons
- Primary (order/WhatsApp): filled brand or wa color, 44px min height, full-width on mobile
- Secondary: outlined, brand color border
- Ghost: text only, brand color

### Bottom bar (mobile sticky)
Two buttons: phone call (left) + WhatsApp (right). Height 56px. Always on top of content.

## Motion

`prefers-reduced-motion: reduce` → no transitions.
Default: `transition: 0.15s ease-out` for color/border changes.
Image hover: `transform: scale(1.02)` with `transition: 0.2s ease-out`.
No animate-in on scroll for v1 — adds complexity without conversion lift.

## Layout patterns

- **Category page:** 2-col mobile → 3-col tablet → 4-col desktop product grid. No sidebar.
- **Product page:** single column mobile (image stack → info → specs → reviews → related). Desktop: 60/40 split (images left, info right), sticky add-to-cart sidebar.
- **Blog:** max 680px body, generous vertical rhythm.
- **Home/landing:** full-width sections, alternating image+text blocks.
