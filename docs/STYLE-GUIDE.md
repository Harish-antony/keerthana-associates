> **Current-theme note:** Earlier descriptions of a forest-green theme are superseded by the approved white-glass theme with charcoal text and bronze accents.

# Role 2 — style guide
Edit `assets/css/tokens.css` to change the visual system. Forest green is the primary surface, bronze is the accent and button colour, cream is the warm background. Dark green text on cream and cream text on green carry body copy; bronze is decorative on cream, not used as small text there. Headings use self-hosted Poppins; body uses self-hosted Work Sans. Both use `font-display: swap` and have system fallbacks. Fluid type uses clamp, with 8px-based spacing tokens. Primary buttons are bronze with dark text; secondary buttons are outlined. Cards have 18px radii and restrained shadows. Thin bronze rules label section transitions. Focus rings are thick and offset; motion is suppressed for reduced-motion users.

## Glass surfaces
The sticky header, hero note, service cards and form panel use restrained translucent surfaces with backdrop blur where supported. Opaque CSS fallbacks retain legibility in browsers without `backdrop-filter`. The glass treatment is decorative; foreground text remains dark on light panels.

## Updated palette
The requested revision replaces green with white glass surfaces, pale cool-gray backgrounds, charcoal typography and restrained bronze accents. Hero, process, contact and final CTA are now light; the footer alone uses charcoal for separation. The CSS variable names remain unchanged for compatibility with existing component rules, but their values are neutral.

## Composition principles
- **Balance:** the hero uses a 1.08:0.92 text/image relationship and caps photo width; Why Us and FAQ use intentionally offset columns. Section headings and supporting copy share a dividing baseline.
- **Hierarchy:** small uppercase labels lead into large serif headings, larger lead copy, quieter body copy, then high-salience actions. Spacing separates major sections from individual cards.
- **Contrast:** charcoal on light glass carries essential text; the primary CTA uses dark text on light gold, with a stronger border and focus outline. Core pair checks: bronze `#936924` on white **4.90:1**, bronze on page gray **4.61:1**, charcoal `#242932` on CTA gold **10.06:1**, body gray `#535b66` on white **6.87:1**. These calculations cover flat colours; final visual review remains necessary over imagery and translucent surfaces.

## Typography update
The client-selected pairing is **Poppins for headings** and **Work Sans for body text**. Both are self-hosted WOFF2 with `font-display: swap`; system sans fallbacks keep the page readable during loading. Headings now use semibold weight and less extreme tracking to suit the approachable sans-serif shape, while supporting copy remains regular weight. The previous font files were removed.
