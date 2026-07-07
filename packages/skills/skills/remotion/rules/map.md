---
name: maps
description: Route Remotion map requests between simple static maps, Mapbox GL JS maps, and MapLibre GL JS maps.
metadata:
  tags: map, map animation, mapbox, maplibre, static map, route animation
---

Use this rule first for map-related Remotion work. Decide whether the user needs a simple static map, Mapbox, or MapLibre, then load the matching guidance.

## Routing

For simple maps, small location callouts, or short flyovers that do not need live vector map animation, prefer a static map image. Use a local or remote image with Remotion's `<Img>` and animate the image with normal Remotion transforms. This is the most deterministic option and avoids WebGL render cost.

For high-polish animated maps, Mapbox styles, 3D-looking map visuals, or when the user specifically asks for Mapbox, ask whether they have a Mapbox access token. If yes, load [mapbox.md](mapbox.md). If no, offer MapLibre instead.

For open-source map rendering, no Mapbox token, or when the user specifically asks for MapLibre, load [maplibre.md](maplibre.md).

If the user only says "make a map animation" and the choice is not obvious, ask:

```text
Do you want Mapbox (nicer default styles and animations, requires an API key) or MapLibre (open-source, no Mapbox key required for the default style)?
```

## Simple Static Maps

Use this route when the map is background context rather than the main technical subject of the animation.

Good fits:

- A city or venue location card.
- A zoom or pan over one map screenshot.
- A short route where a custom SVG/path overlay is enough.
- A branded video where deterministic rendering matters more than map interactivity.

Implementation pattern:

```tsx
import {Img, staticFile, useCurrentFrame, interpolate} from 'remotion';

export const StaticMap = () => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, 90], [1, 1.08], {
		extrapolateRight: 'clamp',
	});

	return (
		<Img
			src={staticFile('map.png')}
			style={{
				width: '100%',
				height: '100%',
				objectFit: 'cover',
				scale,
			}}
		/>
	);
};
```

If the static map needs markers or route lines, overlay them with absolutely positioned HTML/SVG elements and animate those with `useCurrentFrame()` and `interpolate()`. Keep coordinates and positioning explicit in composition pixels so frames stay deterministic.

## WebGL Maps

Use Mapbox or MapLibre for animated routes, flyovers, camera movement, markers driven by GeoJSON, or map-native labels.

For both renderers:

- Use Turf for route geometry, distances, route slicing, and positions along routes.
- Use GeoJSON sources and map layers rather than DOM markers unless the user asks for HTML markers.
- Disable non-deterministic behavior with `interactive: false` and `fadeDuration: 0`.
- Use `delayRender()` / `continueRender()` around map loading and per-frame updates.
- For renders, prefer `--gl=angle --concurrency=1`.
