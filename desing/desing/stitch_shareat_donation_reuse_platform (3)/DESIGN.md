---
name: Ethos & Heritage
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#454652'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#767683'
  outline-variant: '#c6c5d4'
  surface-tint: '#4c56af'
  primary: '#000666'
  on-primary: '#ffffff'
  primary-container: '#1a237e'
  on-primary-container: '#8690ee'
  inverse-primary: '#bdc2ff'
  secondary: '#964900'
  on-secondary: '#ffffff'
  secondary-container: '#fc820c'
  on-secondary-container: '#5e2c00'
  tertiary: '#3a0800'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f1300'
  on-tertiary-container: '#ff663c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000767'
  on-primary-fixed-variant: '#343d96'
  secondary-fixed: '#ffdcc6'
  secondary-fixed-dim: '#ffb786'
  on-secondary-fixed: '#311300'
  on-secondary-fixed-variant: '#723600'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a1'
  on-tertiary-fixed: '#3b0800'
  on-tertiary-fixed-variant: '#881f00'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is built on the pillars of **Generosity, Trust, and Cultural Continuity**. It targets a socially conscious audience that values both modern efficiency and traditional community spirit. 

The design style is **Corporate Modern with a Soft Minimalism edge**. It avoids the sterility of purely Western platforms by infusing warmth through a palette inspired by Indian earth and spirituality. The interface prioritizes clarity and high-quality typography to ensure the act of donation feels dignified and professional. Visual depth is achieved through layered cards rather than heavy lines, creating a sense of openness and accessibility.

## Colors

The color strategy leverages the psychological weight of **Deep Indigo** to establish institutional trust. This is balanced by the vibrant energy of **Warm Saffron** for primary calls to action, and **Terracotta** for secondary interactions, reflecting the clay and earth of shared heritage.

- **Primary (Deep Indigo):** Use for navigation bars, primary headings, and critical iconography.
- **Secondary (Saffron):** Use for "Donate" buttons, active states, and high-priority alerts.
- **Tertiary (Terracotta):** Use for categorical tags, hover states, and meaningful secondary accents.
- **Background (Cream):** A warm, off-white base that prevents the high-contrast fatigue typical of pure white screens.

## Typography

This design system utilizes **Plus Jakarta Sans** (as a highly legible, modern alternative to Poppins with similar geometric friendliness) for all headings to provide an approachable yet premium feel. **Inter** is utilized for all body copy and UI elements due to its exceptional readability at small sizes and neutral character.

Maintain a strict vertical rhythm by using the defined line heights. For long-form reading, prioritize `body-lg` to ensure the "Cream" background and "Indigo" text maintain optimal contrast and comfort.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid Grid**. For desktop, use a 12-column grid with a maximum container width of 1280px. For mobile, use a single-column fluid layout with 20px side margins.

Generous whitespace is mandatory to evoke a feeling of "Premium Simplicity." Avoid crowding cards; instead, use the `lg` (48px) and `xl` (80px) spacing tokens to separate major sections. The rhythm is based on an 8px baseline to ensure consistency across all components.

## Elevation & Depth

Visual hierarchy is managed through **Ambient Shadows** and **Tonal Layering**. 

1.  **Level 0 (Base):** The Cream background (#FAF9F6).
2.  **Level 1 (Cards):** White surfaces (#FFFFFF) with a very soft, diffused shadow: `0px 4px 20px rgba(26, 35, 126, 0.05)`. Note the subtle Indigo tint in the shadow to maintain color harmony.
3.  **Level 2 (Active/Hover):** Increased elevation for interactive elements: `0px 8px 30px rgba(26, 35, 126, 0.08)`.

To incorporate the cultural touch, use **watermarked patterns**: Apply a 3% opacity Indigo mandala or geometric "Jaali" pattern to the background (Level 0) behind specific sections, ensuring it never competes with text legibility.

## Shapes

The shape language is defined by significant **roundedness**, conveying warmth and safety. 

- **Standard UI Elements:** (Buttons, Input Fields) use a 12px radius.
- **Surface Containers:** (Cards, Modals) use a 16px radius.
- **Decorative Accents:** Occasional use of full-circle (pill) shapes for status indicators or "New" tags.

Borders should be kept minimal. When necessary, use a 1px border in a lightened Indigo tint (#E8EAF6) rather than pure grey.

## Components

- **Buttons:** Primary buttons use Saffron (#F57C00) with white text. Hover states should transition to Terracotta (#BF360C) smoothly (200ms ease-in-out). Secondary buttons use Indigo outlines.
- **Cards:** Cards are the primary container. They feature a white background, 16px corner radius, and the standard Level 1 shadow. A subtle 4px top-border in Saffron or Indigo can be used to categorize items.
- **Input Fields:** Use the 12px radius with a light Indigo border. On focus, the border thickens to 2px and changes to Saffron.
- **Chips/Tags:** Small, pill-shaped elements used for food categories (e.g., "Vegetarian," "Fast Pickup"). Use light tinted backgrounds of the Tertiary or Success colors with dark text.
- **Cultural Motifs:** Use faint, geometric Indian-inspired borders (1px width, 10% opacity) as dividers between long sections of text to reinforce the brand identity without cluttering the UI.
- **Progress Bars:** For donation goals, use a Deep Teal to Saffron gradient to signify growth and positive action.