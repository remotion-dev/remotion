---
name: map-explainer
description: Use when you need a 2D geographic explainer map for video — showing where something is, a river or route's path, or who is upstream/downstream of whom, with MapTiler provider vectors or custom geodata and countries or regions highlighting in sequence. Keywords map, explainer, river, route, roads, boundaries, choropleth, country highlight, dataviz, geography, upstream, watershed, border, label, vector tiles, geojson, remotion, maptiler.
---

# Map Explainer — 2D geographic explainer maps

## Overview

A flat investigative map beat: a **river (or route) draws on**, and as it flows into each country the
country **animates in** — its border draws, its fill blooms, its label rises. The bundled assets are a
working sample; replace all geography, visual tokens, and typography with the production's own system.

For 3D terrain fly-overs use the **3d-flyover** skill; for plain animated maps see remotion's
`maps.md` / `maplibre.md`.

## When to use

- "Where is this?" / "what's the path of this river/route?" / "who is upstream of whom?"
- A choropleth-style reveal where countries or regions light up in a meaningful sequence.
- **Not** for: 3D terrain reveals (→ 3d-flyover) or non-geographic data viz.

## Architecture — three layers, each one job

| Layer                              | Role                                                                                                                                                                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MapTiler SDK** (`@maptiler/sdk`) | Draws the basemap plus MapTiler Planet vector layers and custom GeoJSON into a WebGL canvas. Default styled-vector starting point: `MapStyle.BASIC`; satellite is an equally valid evidence-led choice.                                             |
| **Remotion**                       | Frame-by-frame harness. Imperatively update `setData`/`setPaintProperty`; use `jumpTo` only for a static shot, or a fixed map plate for any pan/zoom. Gate with `delayRender` until `map.once('idle')`. `--gl=angle`, `preserveDrawingBuffer:true`. |
| **React HTML overlay**             | The country **labels** — positioned `<div>`s, NOT MapLibre symbols. Gives full project-defined typography and animation control. Positioned each frame via `map.project(lngLat)` → `setState`.                                                      |

Env `REMOTION_MAPTILER_KEY` (unrestricted). Init the map once (ref guard); update imperatively per frame.

When constructing MapLibre/MapTiler layer objects, omit optional properties that are absent. In particular,
use `...(layer.filter ? {filter: layer.filter} : {})`; do not pass `filter: undefined`. An undefined filter
can suppress the layer while separately created halo or border layers continue rendering, producing missing
country fills and dark marker halos with no coloured cores.

Choose the basemap by evidence: begin styled-vector work with `MapStyle.BASIC`; use satellite when terrain,
land use, construction, or a river's physical course is itself evidence. The skill owns no fixed palette,
font, or branded treatment—put those in the production's local configuration.

## Choose the source for each map element

Do not begin by manufacturing GeoJSON. First check whether MapTiler Planet already exposes the element
as filtered vector data. Make the choice separately for roads, waterways, water bodies, boundaries, land
cover, places, and every story-specific overlay.

| Mode                | Use when                                                                                                                                      | Animation                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **MapTiler vector** | The feature exists in a provider `source-layer`, its attributes support an exact filter, and provider geometry is editorially acceptable.     | Fade, bloom, recolour, widen, blur, pulse, change radius, or use stable feature state. |
| **Custom GeoJSON**  | The feature is proposed, historical, disputed, corrected, privately sourced, absent from provider data, or must be drawn in a verified order. | Full paint animation plus deterministic line/perimeter slicing and geometry changes.   |
| **Hybrid**          | Ordinary geographic context can come from MapTiler while the claim depends on custom evidence.                                                | Animate each layer according to its source and meaning.                                |

MapTiler vector features remain split across tiles. Do not use them for a semantic start-to-end line draw;
extract, verify, order, and bake that element to GeoJSON first. Read **`map-data-sources.md`** and
reuse **`../assets/map-explainer/MapTilerVectorElement.ts`** for provider-layer setup and per-frame paint updates.

## Motion stability — use a fixed map plate for camera moves

**Do not call `map.jumpTo()` on every Remotion frame when the camera moves.** In headless capture it can
make both MapTiler hillshade **and satellite imagery** shimmer/jitter, even when the source tiles load
correctly. This is renderer resampling, not a data, network, or label problem.

For the implementation, read **`render-stability.md`** before building or debugging any moving
map. It contains the fixed-map-plate recipe, diagnostics, and render checks.

- Use the live MapTiler camera only for a static shot.
- Keep pitch and bearing constant for a fixed plate. A genuine changing 3D camera needs the
  `3d-flyover` skill instead.
- Verify the moving preview and a short rendered MP4 before approving a beat. If any basemap detail
  wavers, switch to the fixed-plate pattern; do not try to solve it with tile retries or camera easing.

## How it works (the shape)

1. **Source selection** — use MapTiler vector layers for suitable provider features and custom GeoJSON
   for story-specific or ordered geometry. If the beat needs country-entry triggers or a progressive line
   draw, run `../scripts/prep-geo.mjs` to bake `country-meta.json`, `borders.geojson`, and the ordered line.
   Details → `map-data-sources.md` and `map-geo-prep.md`.
2. **Basemap** — strip clutter on `load`: remove `symbol` layers (place labels) and `/other border/i`
   (admin-1 inner borders); hide the logo via CSS. Keep country + disputed borders.
3. **River** — `turf.lineSliceAlong(line, 0, lineKm*reveal)` per frame, led by a **white-hot electric
   draw-head** (the last few % in its own bright+glow layers), faded out at the mouth. No dark casing.
4. **Countries** — triggered as the river enters each (`stop`): a sequence of **complete border draws
   (constant ~2.5 s, darker-shade line) → fill blooms (opacity overshoot) → country label rises**.
5. **Render** — `bunx remotion render … --gl=angle`.

The timing model, per-frame code, the electric-head logic, the country sequence, and label projection →
**`map-explainer-architecture.md`**. The geo pipeline (entry stops, pole of inaccessibility, complete
borders, bbox/nudge tuning) → **`map-geo-prep.md`**.

## Visual semantics — label and border rules

- **Country or geographic region:** uppercase, high-contrast display label with a short accent divider.
  Place it in clear territory, never over a river or marker cluster.
- **River or route:** anchor a leader directly to the real line geometry, then run it to the label. Use the
  route accent colour and omit redundant category words such as “RIVER”.
- **Constructed object** (dam, tunnel, plant, site): smaller italic callout beside its actual point or
  line. Do not use the country/region divider treatment; infrastructure is not geography.
- Reveal a label only after the geographic/data layer it names is established, and keep it on-screen long
  enough to read. Validate placement in both 16:9 and 9:16 renders.
- Use complete named administrative geometry. **Never crop a country or bilateral border to the viewport**
  to make its animation easier; it may continue off-frame naturally. For a highlighted bilateral boundary,
  source the named full bilateral line. For country fills, avoid duplicating full outline strokes, which
  makes shared borders double up.

## Quick start

1. Inventory the required map elements and choose MapTiler vector, custom GeoJSON, or hybrid mode for
   each one using `map-data-sources.md`.
2. For provider elements, copy `../assets/map-explainer/MapTilerVectorElement.ts`, add each exact `source-layer` and
   attribute filter, then drive paint properties from the Remotion frame.
3. For ordered custom geometry, copy the templates in `../assets/map-explainer/`. Supply one clean
   ordered LineString and polygon GeoJSONs, configure `../scripts/prep-geo.mjs`, and run it to produce
   the line, `country-meta.json`, and `borders.geojson`.
4. Keep the country keys identical across `prep-geo.mjs`, `RiverReveal.tsx` `ORDER`, and `tokens.ts`.
   Set `REMOTION_MAPTILER_KEY`; add a font package only if the
   project's typography requires one.
5. Render with `bunx remotion render … --gl=angle --timeout=120000`.

## Tuning knobs (each is one number)

| Want                         | Knob                                                                 | Where                               |
| ---------------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| River colour / electric glow | `COLORS.river` / `riverGlow` / `riverHead`                           | `../assets/map-explainer/tokens.ts` |
| Electric head size           | `lineKm * 0.03` + head/headglow widths                               | `RiverReveal.tsx`                   |
| Border draw time             | `BORDER_S` (2.5 s, constant per country)                             | `RiverReveal.tsx`                   |
| Border visibility            | lighten `COUNTRY_DARK` or bump `trail` width/opacity                 | tokens / component                  |
| Fill bloom strength          | `[0,0.6,1] → [0, ×1.25, ×1]` overshoot                               | `RiverReveal.tsx`                   |
| Label position               | `NUDGE` + `ANCHOR_BBOX` (pole of inaccessibility)                    | `../scripts/prep-geo.mjs`           |
| Label look                   | project typography, divider/callout treatment, letter-spacing        | `CountryLabel.tsx`                  |
| When a country lights up     | its `stop` (river-arrival fraction)                                  | recompute in prep                   |
| Overall pace                 | `RIVER_START`/`RIVER_END` + sequence durations (beat length follows) | `RiverReveal.tsx`                   |

## Files

- `../assets/map-explainer/RiverReveal.tsx` — the main component.
- `../assets/map-explainer/MapTilerVectorElement.ts` — filtered MapTiler Planet elements.
- `../assets/map-explainer/CountryLabel.tsx` — reusable example label.
- `../assets/map-explainer/tokens.ts` — example palette and durations.
- `../assets/map-explainer/example-Root.tsx` — minimal composition scaffold.
- `../assets/map-explainer/sample-data/` — example route and generated country metadata.
- `../scripts/prep-geo.mjs` — geo pipeline.
- `map-explainer-architecture.md` — timing model and implementation.
- `map-data-sources.md` — provider vector versus custom GeoJSON selection.
- `map-geo-prep.md` — basemap stripping and geo preparation.
- `render-stability.md` — camera motion and stable headless renders.
