---
name: Ráquira Civic Pulse
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#341100'
  on-tertiary-container: '#d95f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  vibrant-green: '#22C55E'
  surface-light: '#F8FAFC'
  white: '#FFFFFF'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
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

The design system for "Ráquira - Ciudad Guabinas" is built to serve as a reliable, modern, and high-functioning "Portal de Información y Servicios." It balances the vibrancy of a growing community with the professional rigors of an administrative and service-oriented platform. 

The aesthetic is **Corporate / Modern** with a infusion of **vibrant energy**. It prioritizes clarity, efficiency, and accessibility, ensuring that residents can navigate complex services—like maintenance requests or financial payments—with ease. The visual language uses crisp lines, generous whitespace, and purposeful color application to create an environment that feels organized, welcoming, and technologically advanced.

## Colors

The palette is derived from the "R" brand identity, blending deep professional tones with energetic accents. 

- **Primary (Midnight Blue):** Used for headlines, primary navigation, and high-importance UI elements to establish authority and trust.
- **Secondary (Azure Blue):** The workhorse for interactive elements, links, and primary actions.
- **Tertiary (Solar Orange):** Reserved for notifications, alerts, or key call-to-action moments that require immediate attention.
- **Vibrant Green:** Primarily used for success states, "completed" status, and maintenance-related indicators.
- **Neutrals:** A slate-based neutral scale ensures the UI feels clean and cool, avoiding the "muddy" look of warmer grays.

## Typography

This design system exclusively utilizes **Plus Jakarta Sans** for its friendly yet professional geometric character. 

- **Headlines:** Use heavy weights (700-800) with slight negative letter-spacing for a modern, compact look in titles.
- **Body Text:** Standardized at 16px for optimal legibility. Use the "Slate" neutral color to reduce eye strain.
- **Labels:** Used for navigation items, tags, and small captions. Increased weight (600) ensures visibility at smaller scales.
- **Hierarchy:** Maintain a clear distinction between administrative titles and informative body text through significant weight shifts rather than just size changes.

## Layout & Spacing

The system employs a **Fixed Grid** for desktop to maintain structural integrity of dense information, transitioning to a **Fluid Grid** for mobile.

- **Grid:** 12-column layout for desktop (1280px max-width). 4-column layout for mobile.
- **Rhythm:** An 8px linear scale governs all padding and margins.
- **Density:** The "Portal" theme requires a balance between information density and clarity. Cards and list items should use "Comfortable" padding (24px) for general information and "Compact" padding (16px) for data-heavy dashboard views.

## Elevation & Depth

To maintain a clean and professional look, depth is achieved through **Tonal Layers** supplemented by **Ambient Shadows**.

- **Surface Tiers:** Backgrounds use `surface-light`. Cards and interactive containers use `white` to pop against the background.
- **Shadows:** Use extremely soft, blurred shadows (Blur: 20px, Opacity: 4-6%) with a slight tint of the Primary color to avoid a "dirty" gray appearance.
- **Interactions:** On hover, elements should subtly lift (shadow increases) rather than change color drastically, maintaining the professional atmosphere.

## Shapes

The shape language is **Rounded**, reflecting the approachable and community-focused nature of the portal.

- **Components:** Standard buttons and input fields use a 0.5rem (8px) radius.
- **Containers:** Service cards and large modal containers use 1rem (16px) to feel distinct and modern.
- **Icons:** Should be housed in soft-square or circular containers to mimic the "R" brand's fluid curves.

## Components

- **Buttons:** Primary buttons use the Azure Blue background with white text. Secondary buttons use a Slate outline. All buttons include a subtle transition effect on hover.
- **Service Cards:** Central to the portal. Features a top-aligned icon in a colored circle (matching the brand palette), a Headline-MD title, and a short body description. Elevation should be "Low" (Level 1).
- **Input Fields:** Use the Slate neutral for borders (1px). Focus states must transition the border to Azure Blue with a soft 2px glow.
- **Chips/Badges:** Used for status (e.g., "Pending," "Paid," "Resolved"). Use low-saturation background tints of the status color with high-saturation text for readability.
- **Navigation:** A clean top-bar with Primary color branding. Mobile navigation utilizes a bottom-sheet for easier "thumb-zone" access to core services.