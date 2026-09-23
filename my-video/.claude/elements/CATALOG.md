# Remotion Elements — local reference library

Drop-in, remixable video building blocks, vendored from this monorepo's `packages/docs/elements`
(the source of https://www.remotion.dev/elements/). Each is a small, self-contained component
designed to be copied into a scene and edited directly, not installed as a dependency.

Copy the `.tsx` file (and `initial-props.ts` if present) from a category/slug folder below into
`src/showcase/` (or wherever), then import and use its exported component. Check the file's own
imports for any packages to install first.

## audio

- **Mirrored Spectrum** (`audio/mirrored-spectrum`) — Suitable for both music and speech visualization.
- **Oscilloscope** (`audio/oscilloscope`) — Suitable for visualizing speech.
- **Voice Note** (`audio/waveform-progress`) — A static audio waveform with playback progress.

## backgrounds

- **Liquid Contours** (`backgrounds/liquid-contours`) — A flowing two-color background made from animated liquid contour bands.
- **Moving Waves** (`backgrounds/moving-waves`) — A seamless wave background that flows upward.
- **Moving Zigzags** (`backgrounds/moving-zigzags`) — A seamless zigzag background that flows upward.
- **Notebook Paper** (`backgrounds/notebook-paper`) — A white paper background with subtle blue gridlines.
- **Paper Texture** (`backgrounds/paper-texture`) — A white animated paper texture background.
- **Rotating Starburst** (`backgrounds/rotating-starburst`) — A Solid background with a slowly rotating starburst effect.

## captions

- **Basic Captions** (`captions/basic-captions`) — Simple synchronized captions with white text on a translucent gray background.
- **Moving Pill Captions** (`captions/moving-pill-captions`) — Synchronized captions with a pill that moves between spoken words.
- **Popping Word Captions** (`captions/popping-word-captions`) — Synchronized captions that pop each spoken word into focus.
- **Rounded Captions** (`captions/rounded-captions`) — Synchronized captions on a white rounded text box, fitted with `@remotion/layout-utils`. Copied from the live site's source, since this monorepo's `packages/docs/elements` doesn't have it yet. Its font, Figtree, has no Vietnamese subset, so swap it for a font that has one (see "Language" in `AGENTS.md`).
- **Word Highlight Captions** (`captions/word-highlight-captions`) — Synchronized captions that highlight each spoken word.

## commerce

- **Rotating Cards** (`commerce/product-collection`) — Three cards which each take center once.
- **Wiggling Callout** (`commerce/product-discount-callout`) — An attention-grabbing speech bubble.
- **Shine** (`commerce/shine`) — Adds a diagonal shine sweep to any content.
- **Tear apart** (`commerce/tear`) — A tear effect that can be applied to any content.

## data

- **Horizontal Bar Chart** (`data/horizontal-bar-chart`) — A bold bar chart card with three directly labeled data points.
- **Line Chart** (`data/line-chart`) — A bold animated line chart with a directly labeled trend.
- **Number Counter** (`data/number-counter`) — A simple animated counter that counts up from a start value to an end value.
- **Pie Chart** (`data/pie-chart`) — A bold animated pie chart with four directly labeled data points.
- **Vertical Bar Chart** (`data/vertical-bar-chart`) — A bold vertical bar chart with three directly labeled data points.

## layouts

- **Picture in Picture Transition** (`layouts/picture-in-picture-transition`) — Animates an element from being fullscreen to being displayed in a box.
- **Slide to Split Screen** (`layouts/slide-to-split-screen`) — A fullscreen scene that opens into a 60/40 split-screen layout.

## maps

- **A-to-B Map Flyover** (`maps/map-flyover`) — An animated map flyover from point A to point B, with editable coordinates and location labels.
- **Watercolor Map** (`maps/watercolor-map`) — An animated watercolor map journey between two editable locations.

## overlays

- **Location Lower Third** (`overlays/location-lower-third`) — An animated lower third for an event location and venue.
- **Name Lower Third** (`overlays/name-lower-third`) — A clean animated lower third for introducing a speaker, guest, or host.
- **Social Safe Zones** (`overlays/social-safe-zones`) — Preview TikTok and Instagram Reels interfaces to keep important content visible.

## storytelling

- **On-Screen Messages** (`storytelling/on-screen-messages`) — An iMessage-inspired text exchange with staggered reveals, focus shifts, and familiar blue and gray chat bubbles.
- **Polaroid Pictures** (`storytelling/polaroid-pictures`) — A staggered instant-photo montage with handwritten captions, paper shadows, and developing-photo accents.

## text

- **Circle Marker** (`text/circle-marker`) — An animated hand-drawn circle around text.
- **Crossed Off** (`text/crossed-off`) — Animated hand-drawn crossed-off text.
- **News Article Highlight** (`text/news-article-highlight`) — A news article camera treatment with animated highlights for drawing attention to key passages.
- **Spinning Text Wheel** (`text/spinning-text-wheel`) — A 3D text wheel that spins through options and decelerates onto a highlighted selection.
- **Strike Through** (`text/strike-through`) — Animated hand-drawn strike-through text.
- **Text Marker** (`text/text-marker`) — A hand-drawn animated text highlight.

## youtube

- **YouTube Comment Highlight** (`youtube/youtube-comment-highlight`) — A YouTube-style card for featuring a viewer comment.
- **YouTube End Card** (`youtube/youtube-end-card`) — A clean YouTube endcard with social links and space for recommended videos.
- **YouTube Subscribe Nudge** (`youtube/youtube-subscribe-nudge`) — An animated creator-branded subscribe prompt with a subscribed-state confirmation. This copy is the newer live-site version, ahead of `packages/docs/elements`: `clickSrc`, `dingSrc` and `avatarSrc` props replace the click sound, bell sound and avatar, which otherwise load from remotion.media. The default click (`mouseClick`) is CC0, but the default bell (`ding`) has no free licence, so pass your own `dingSrc` for a published video.
