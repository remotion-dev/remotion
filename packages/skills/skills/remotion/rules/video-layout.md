---
name: video-layout
description: Video-first layout, composition, and text sizing guidance for Remotion.
metadata:
  tags: layout, composition, typography, text, motion graphics, promo
---

# Video layout

Videos are watched differently than web pages are read. Design for quick understanding from the full frame, not for a dense UI that rewards close inspection.

## Start from the frame

- Decide what the viewer should notice first in each scene. Build the frame around that one thing.
- Keep important content inside a generous safe area. For 1080px-wide videos, keep key text at least 80px from the sides and 100px from the top and bottom.
- Prefer centered, stacked, or strongly aligned layouts. Avoid scattered dashboard-like layouts.
- Use empty space intentionally. A video frame with one strong message is usually better than a frame full of widgets.
- Do not place objects side by side just because there is room. If two elements compete, show them one after another or make one clearly secondary.

## Default scene structure

For promos, explainers, and motion graphics, a good default scene is:

- One main text message
- One supporting visual, such as an icon, product card, shape, or screenshot-style mockup
- One or two background accents

Avoid defaulting to many cards, badges, borders, pills, or tiny labels. Those are web UI patterns and often make videos feel cluttered.

## Prevent overlap by construction

- Do not manually position every readable element with independent `top`, `left`, `right`, or `bottom` values.
- Put readable content in normal layout containers using `flex`, `grid`, `gap`, `justifyContent`, and `alignItems`.
- Use absolute positioning mainly for backgrounds, decorative shapes, glows, particles, and elements that are meant to layer behind the content.
- Reserve a slot for each major element in the scene. For example, a vertical promo scene can use a centered column with `gap` for headline, card, and CTA.
- Animate elements from their reserved slot using `opacity`, `transform`, and `scale`; do not animate them into a space occupied by another element.
- If an element enters from offscreen or from another part of the frame, its final resting position must still belong to a layout slot.
- When text length is unknown or user-provided, assume it may wrap. Give the text block enough width and vertical room instead of placing another object immediately under it.

## Text in video

- Text must be readable at video-viewing distance. If unsure, make it larger, not smaller.
- Treat small text as decorative unless the user explicitly needs it to be read.
- For 1080px-wide compositions, use these rough minimums:
  - Main headline: 84px
  - Important supporting text: 44px
  - Labels or short callouts: 32px
- Scale those values with the composition width. For example, a 1920px-wide composition needs larger text than a 1080px-wide composition.
- Keep line lengths short. Break long ideas into multiple scenes instead of shrinking the font.
- Use strong contrast between text and background. Add a subtle backing shape or simplify the background if the text is hard to read.
- Do not stack many text blocks in the same area. Give each message its own moment or clearly separated region.

## Solve crowding with time

- Let time solve layout problems. Instead of showing every feature at once, reveal them one after another.
- If a frame feels crowded, remove an element, enlarge the focal element, or move the secondary element to another scene.
- Favor centered or strongly aligned compositions over scattered UI layouts.
- Use background shapes, gradients, and cards to support the message, not to create visual noise.
- Keep the visual system consistent across scenes: repeated spacing, repeated alignment, and a small set of shapes/colors.

## Pre-render check

Before rendering, inspect a representative frame at normal size:

- Can the main message be read quickly?
- Is there one obvious focal point?
- Are any objects touching, overlapping, or awkwardly sitting next to each other?
- Would the frame still make sense if seen for less than one second?
