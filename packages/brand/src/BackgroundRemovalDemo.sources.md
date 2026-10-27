# Background removal demo source

Jonny requested a still from his presenter footage in the `WhatsNew` composition.

- Source: https://remotion.media/announcements/whats-new-in-remotion/whats1.mov
- Source registration: `src/announcements/whats-new-in-remotion/Scene1.tsx`
- Still: source frame 60 at 30 fps (2 seconds), corresponding to frame 33 of `Chapter01-Intro`
- Dimensions: 1920×1080

Only this single frame was processed locally with Remotion's MODNet model. The complementary background uses the inverse foreground alpha mask; the subject's former position remains transparent, not inpainted.

Derived files:

- [Foreground PNG](https://remotion.media/explore-remotion/whats-new-jonny-foreground-2026-10-27-d7cfb160e8d8.png)
- [Background PNG](https://remotion.media/explore-remotion/whats-new-jonny-background-2026-10-27-eb0e748dc4b9.png)
