---
name: Lumina Bridge
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
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
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  stat-gradient:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered to facilitate high-value cross-continental trade and collaboration. The brand personality is **Visionary, Prestigious, and Multi-Dimensional**, reflecting the robust link between African and Chinese markets. 

The visual style is **3D Modern Glassmorphism**. This aesthetic moves beyond flat design into a world of physical depth, utilizing stacked translucent layers, light refraction, and tactile elevation. It evokes an emotional response of security and technological advancement, positioning the platform as a premium, future-proof bridge for global enterprise.

## Colors

The palette uses sophisticated gradients to create a sense of light-source directionality.

- **Primary:** A deep Indigo gradient representing stability and institutional trust.
- **Secondary:** A Slate-based surface gradient used for subtle background differentiation.
- **Accent:** A vibrant Indigo-to-Purple blend for highlights, CTA states, and data visualizations.
- **Neutral:** Pure whites and high-contrast slates maintain a clean, professional canvas for the 3D elements to inhabit.

## Typography

This design system utilizes **Inter** exclusively to maintain a systematic, utilitarian foundation that balances the complex 3D visual effects. 

- **Headlines:** Use heavy weights (700-800) with subtle text-shadows to "lift" the text off glass surfaces.
- **Gradients:** Statistics and hero headers should utilize the Accent Gradient via text-clipping for maximum impact.
- **Legibility:** Maintain a minimum 1.6 line-height for body text to ensure readability against blurred glass backgrounds.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous margins to allow the deep shadows of 3D components to breathe without clipping.

- **Grid:** 12-column system on desktop, 4-column on mobile.
- **Negative Space:** Use large padding values (64px+) between major sections to emphasize the "floating" nature of the UI.
- **Responsive Reflow:** On mobile, 3D cards stack vertically and horizontal padding is reduced, but the 3D depth (shadows/highlights) remains consistent.

## Elevation & Depth

Hierarchy is established through **Extreme Multi-Layering**:

1.  **Level 0 (Background):** Slate-50 gradient with subtle geometric patterns.
2.  **Level 1 (Glass Layer):** White/70 opacity with a 20px backdrop-blur. Features a 1px top border (border-white/50) to simulate a "specular highlight" on the edge of the glass.
3.  **Level 2 (Floating Elements):** Use the `deep_shadow` token. These elements appear to hover 20px above the glass surface.
4.  **Interaction Depth:** On hover, elements should translate -8px on the Y-axis and increase shadow spread by 15%, simulating a physical lift toward the user.

## Shapes

The design system uses a **Rounded** language (0.5rem base) to maintain a friendly yet professional demeanor.

- **Cards/Containers:** Use `rounded-xl` (1.5rem) to soften the large surface areas of glass panels.
- **Buttons/Inputs:** Use `rounded-lg` (1rem) for a modern, tactile feel.
- **Icon Containers:** Use `rounded-lg` with a distinct 3D inner-bevel effect.

## Components

### 3D Buttons
Buttons use the Primary Gradient with a 1px top-border highlight. They must feature a "Shadow Depth" — a drop shadow colored with a darker version of the gradient (Indigo-900 at 30% opacity). On press, they translate +2px down to simulate physical compression.

### 3D Cards
Glass panels with `backdrop-blur-xl`. Every card requires a `border-t border-white/50` to catch light and a `shadow-[0_20px_50px_rgba(79,70,229,0.15)]`. Hover states must trigger a smooth Y-axis lift.

### 3D Inputs
Unlike cards, inputs use **Inner Shadows** (`inset 0 2px 4px rgba(0,0,0,0.06)`) to appear recessed into the glass surface. On focus, they transition to a white background with a `ring-4 ring-indigo-500/30` glow.

### 3D Icon Containers
Icons are placed inside small glass squares with a 10% primary-color tint. Icons themselves should use the Accent Gradient and a small drop-shadow to appear 3D within their container.

### Accessibility
- **Contrast:** All text on glass must meet WCAG AA (4.5:1).
- **Focus:** Use a high-visibility `ring-4` for keyboard navigation.
- **Motion:** All 3D lifts and transitions must be wrapped in `prefers-reduced-motion: no-preference` media queries; otherwise, use simple opacity fades.