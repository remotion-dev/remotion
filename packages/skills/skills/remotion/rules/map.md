---
name: maps
description: Choose between simple static maps, Mapbox GL JS maps, and MapLibre GL JS maps for Remotion videos.
metadata:
  tags: map, map animation, mapbox, maplibre, static map, route animation
---

Use this rule first for map-related Remotion work.

For simple maps with little flyovers, consider using static map images.

For complex maps with animated routes or flyovers, ask the user which renderer they want:

- Mapbox: nicer default styles and animations, requires a Mapbox access token. Then load [mapbox.md](mapbox.md).
- MapLibre: open-source renderer, no Mapbox token required for the default demo style. Then load [maplibre.md](maplibre.md).
