# Issue #7449 testbed

[`<Video>` does not fast-refresh effects](https://github.com/remotion-dev/remotion/issues/7449)

## Run

```bash
cd packages/example
bun run dev
```

Open composition **`video-effects-fast-refresh`** (under the **effects** folder).

## Reproduce

1. Pause playback.
2. Edit `TINT_COLOR` or `TINT_AMOUNT` in `VideoEffectsFastRefresh.tsx`.
3. Save.

**Expected:** The `<Video>` panel updates its tint immediately.

**Actual (bug):** The video canvas keeps the previous tint until you seek, play, or remount.

## Compare

The right panel uses `<Solid>` with the same `tint()` call. If Solid updates on save but Video does not, the bug is in the media preview path (`packages/media/src/video/video-for-preview.tsx` and related).

The broader **`effects-testbed`** composition still shows all effect types; use **`video-effects-fast-refresh`** when you only need this repro.
