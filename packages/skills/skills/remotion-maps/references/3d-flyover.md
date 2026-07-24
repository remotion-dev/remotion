---
name: 3d-flyover
description: Create smooth, deterministic Remotion flyover videos of real geography with CesiumJS. Use for cinematic aerial movement through landscapes, mountains, coastlines, cities, or landmarks. Selects MapTiler satellite-draped terrain for landscapes and Google Photorealistic 3D Tiles for cities, then rounds sparse camera routes into continuous swerving flight paths.
---

# 3D flyovers

Use CesiumJS to render the globe or 3D tiles. Use Remotion to control the camera, settle streamed
tiles, capture deterministic frames, and encode the video.

## Choose the mode

| Mode        | Data                                                  | Use for                                                |
| ----------- | ----------------------------------------------------- | ------------------------------------------------------ |
| `landscape` | MapTiler `terrain-quantized-mesh-v2` + `satellite-v2` | Mountains, gorges, rivers, coastlines and rural routes |
| `city`      | Google Photorealistic 3D Tiles                        | Cities, architecture and recognizable landmarks        |

Do not use footprint extrusions for city flyovers. They produce crude building blocks rather than
textured architecture.

## Credentials

For `landscape`, set:

```text
REMOTION_MAPTILER_KEY=...
```

Create a MapTiler key at https://cloud.maptiler.com/account/keys/.

For `city`, set:

```text
REMOTION_GOOGLE_MAPS_API_KEY=...
```

Create a billing-enabled Google Map Tiles API key by following
https://developers.google.com/maps/documentation/tile/get-api-key. Enable the **Map Tiles API** and
restrict the key to that API. Ensure its application restriction permits local headless Remotion
requests.

## Build the flight

1. Copy `../assets/3d-flyover/CesiumFlythrough.tsx`, a path JSON and
   `../assets/3d-flyover/example-Root.tsx` into the Remotion
   project, or import the component directly.
2. Supply the camera route as `[longitude, latitude][]`. Use only meaningful control points; do not
   hand-author dozens of tiny corrections.
3. Leave `pathSmoothingPasses={3}` initially. The component applies repeated Chaikin corner cutting,
   turning straight-then-corner input into a continuous swerve. Increase to `4` for a softer route or
   reduce to `2` when the camera must follow a tight corridor.
4. Set absolute camera altitudes for the location. City cameras normally fly lower than landscape
   cameras.
5. Render a middle-frame still before rendering the full video.

```tsx
<CesiumFlythrough
  mode="city"
  path={cameraPath}
  pathSmoothingPasses={3}
  altitudeStart={700}
  altitudeEnd={500}
  lookAheadKm={0.7}
  travelKm={4.5}
/>
```

## Camera behavior

Walk the smoothed curve by arc length for constant ground speed. Aim at a real point farther along
the curve rather than its next vertex. Derive roll from the change in look-ahead bearing so the
camera banks into a turn instead of twitching left and right.

For landscape routes, `../scripts/prep-cesium-path.mjs` also clips, resamples, smooths and dampens a
GeoJSON centerline before the component applies its final curve smoothing.

## Render

```bash
bunx remotion still src/index.ts <Comp> out.png --frame=N --gl=angle --timeout=180000
bunx remotion render src/index.ts <Comp> out.mp4 --gl=angle --concurrency=1 --timeout=180000
```

Keep these mechanics:

- Set `viewer.useDefaultRenderLoop = false`.
- Call `viewer.render()`, never `scene.render()`, while settling.
- Use `preserveDrawingBuffer: true`.
- Gate initialization and every frame with `delayRender`.
- Settle landscapes on `globe.tilesLoaded` and cities on `tileset.tilesLoaded`.
- Keep all provider attribution visible.

## Google constraint

Google's current Map Tiles policy allows promotional videos about the application, limited to 30
seconds and marked “For promotional purposes only.” The component rejects longer city compositions
and renders the marker. Do not remove the marker, crop credits, cache tiles, or assume this grants
general editorial-video rights.

Read `3d-flyover-architecture.md` for camera math, `3d-data-sources.md` for provider details,
and `3d-troubleshooting.md` for blank, coarse, unauthorized or timed-out renders.

## Files

- `../assets/3d-flyover/CesiumFlythrough.tsx` — reusable two-mode component.
- `../assets/3d-flyover/flight-path.ts` — dependency-free Chaikin route smoothing.
- `../assets/3d-flyover/example-Root.tsx` — landscape and city compositions.
- `../assets/3d-flyover/cesium-path.json` — sample landscape route.
- `../assets/3d-flyover/city-path.json` — sample city route.
- `../assets/3d-flyover/sample-river.geojson` — sample path-preparation input.
- `../scripts/prep-cesium-path.mjs` — dependency-free landscape route preparation.
