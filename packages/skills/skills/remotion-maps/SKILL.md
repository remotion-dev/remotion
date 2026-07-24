---
name: remotion-maps
description: Create deterministic maps in Remotion. Use for static locator maps, animated routes and markers, country or border explainers, Mapbox, MapLibre, MapTiler, GeoJSON, Turf, satellite or terrain maps, and Cesium 3D geographic flyovers.
---

# Remotion Maps

Choose the map pattern from the intended shot before choosing a renderer.

## Route the task

### Static locator map

Use a static map image when the camera and geographic data do not animate. Prefer this for simple location context.

### General 2D animated map

Use for animated routes, markers, labels, GeoJSON layers, and conventional map-camera movement.

- Load [Mapbox](references/mapbox.md) when the user wants Mapbox styles and has an access token.
- Load [MapLibre](references/maplibre.md) when the user wants an open-source renderer or has no Mapbox token.

### 2D geographic explainer

Use for prompts such as “draw the border of this country,” “show where this river flows,” “highlight these regions in sequence,” or “explain who is upstream.”

Load:

- [Map explainer](references/map-explainer.md) for the workflow.
- [Map data sources](references/map-data-sources.md) before choosing provider vectors, custom GeoJSON, or a hybrid.
- [Moving-map stability](references/render-stability.md) before implementing any 2D camera movement.
- [Geo preparation](references/map-geo-prep.md) when ordered routes, entry triggers, complete borders, or label anchors must be baked.
- [Map explainer architecture](references/map-explainer-architecture.md) when implementing the complete animation.

Reuse the templates in `assets/map-explainer/`. Adapt their sample geography, tokens, timings, and project paths. Run `scripts/prep-geo.mjs` only after configuring it for the production data.

### True 3D geographic flyover

Use when the camera travels through terrain or cities and changing position, heading, pitch, or bank is part of the story. Do not use a fixed 2D plate for a long-distance geographic journey or real perspective change.

Load:

- [3D flyover](references/3d-flyover.md) for mode and provider selection.
- [3D architecture](references/3d-flyover-architecture.md) for path smoothing, camera math, banking, and tile settling.
- [3D data sources](references/3d-data-sources.md) before choosing terrain, satellite, or photorealistic city tiles.
- [3D troubleshooting](references/3d-troubleshooting.md) for blank, coarse, unauthorized, or timed-out renders.

Reuse `assets/3d-flyover/` and configure its credentials, providers, path, altitude, duration, attribution, and current provider-policy constraints. Use `scripts/prep-cesium-path.mjs` to turn a detailed landscape centerline into a smooth camera route.

## Choose camera movement

- If geography animates but the framing does not, initialize the map camera once and keep it static.
- For a modest 2D pan or zoom within one geographic scene, prefer the fixed-map-plate pattern in [moving-map stability](references/render-stability.md), especially for satellite imagery and hillshade.
- Use per-frame `jumpTo()` only for a validated live 2D camera shot. Render a short MP4 and check thin lines, labels, hillshade, and raster texture for shimmer.
- If the camera journey itself is the story, or pitch and bearing must genuinely change in 3D, use the 3D flyover branch.

## Shared rules

- Treat coordinates as `[longitude, latitude]`.
- Prefer Turf for geospatial calculations instead of hand-rolled distance, slicing, or interpolation.
- Drive all animation from `useCurrentFrame()`; do not use CSS transitions or browser-timed animation.
- Disable map interaction and fades for rendering.
- Use `delayRender()` and `continueRender()` around map initialization and asynchronous per-frame tile work.
- Set `preserveDrawingBuffer: true` for WebGL capture.
- Render WebGL maps with `bunx remotion ... --gl=angle`.
- Keep required provider attribution visible and verify current provider terms before rendering.
- Record the source and effective date of custom or disputed geography.
- Inspect rendered pixels, not only Studio playback. Validate every required aspect ratio.
