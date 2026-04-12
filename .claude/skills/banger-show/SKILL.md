---
name: banger-show
description: Create music videos and audio-reactive visuals using Banger.Show. Use when helping users build projects on the Banger.Show platform — lyric videos, audio visualizers, 3D visuals, camera animations, and exporting for YouTube, Spotify Canvas, and social media.
---

# Creating with Banger.Show

Banger.Show (https://banger.show) is a browser-based music video editor. When this skill is invoked, guide the user through creating their video step by step — gathering what they need, walking through each part of the editor, and ending with an exported file.

---

## Step 1: Understand the goal

Ask the user:

1. **What type of video?**
   - Lyric video (animated text synced to the track)
   - Audio visualizer (shapes/shaders that react to the music)
   - Spotify Canvas (3–8 second looping clip, 9:16)
   - General music video with 3D objects
   - Multiple types combined

2. **What platform?** — determines aspect ratio and resolution:
   - YouTube → 16:9, 1080p or 4K
   - Spotify Canvas → 9:16, max 8 seconds, must loop
   - Instagram Reel / TikTok → 9:16, 1080×1920
   - Instagram Post → 1:1, 1080×1080

3. **What assets do they have ready?**
   - Audio file (MP3, WAV, or AAC) — required
   - Lyrics or lyric SRT file — for lyric videos
   - Artwork, logo, or photos — for 3D images or logo extrusion
   - 3D model (GLB/GLTF) — optional

4. **What visual vibe?** — dark/moody, bright/colorful, minimal, glitchy/VHS, futuristic

---

## Step 2: Open Banger.Show and create a project

1. Go to **https://banger.show** and sign in
2. Click **New Project**
3. **Upload the audio file** (from device or Dropbox)
4. Select the portion of the track to use (drag the trim handles) — for Spotify Canvas, keep it 3–8 seconds
5. Choose a **starting template** that matches the vibe, or start blank

> At this point the timeline is set to the track duration. Everything from here is adding and adjusting clips.

---

## Step 3: Build the scene

Follow the sub-guide for whichever type was chosen in Step 1.

### 3A — Lyric Video

1. **Add a Text clip**: Clips panel → Text → drag onto the timeline at the right time position
2. Type the first lyric line into the text editor
3. **Trim the clip** so it covers exactly when that line is sung — drag the clip edges in the timeline
4. **Animate the entrance**: in clip properties, set an entrance animation (fade, slide up, typewriter, scale)
5. **Style**: font, size, color/gradient, letter spacing, 3D depth
6. Repeat for each lyric line — use **Duplicate** (Cmd/Ctrl+D) to copy styling across lines
7. Suggested background: add an audio-reactive background clip (Spectre or Waveform) behind the text, or upload the album artwork as a 3D image

### 3B — Audio Visualizer

1. **Add a visualizer clip**: Clips panel → Visualizers → choose one:
   - **Waveform** — classic wave; reacts to full spectrum
   - **Spectre** — frequency bars; shows bass vs. treble separation
   - **Oscilloscope** — raw waveform trace; precise and technical
   - **Ferro Fluid** — organic blob that pulses; great for dark/moody
   - **Pulsar** — radial rings; energetic
   - **Circle** — circular waveform; minimal and clean
2. Drag the visualizer clip across the full timeline
3. In clip properties, set **colors** to match the artwork/brand palette
4. Add album artwork or logo as a 3D image in the center of the scene (Clips panel → Image → select file)

### 3C — Spotify Canvas

- Keep the total duration **3–8 seconds** (already set at trim step)
- Use a looping-friendly visualizer (Pulsar or Circle loop naturally)
- Set aspect ratio to **9:16** in project settings
- Make sure the last frame transitions cleanly into the first — preview on loop before rendering

### 3D — 3D Objects

1. **Upload a 3D model**: Clips panel → 3D Model → Upload (GLB/GLTF)
   — or — browse **Sketchfab** from inside the editor to find a free CC-licensed model
   — or — use **Logo to 3D**: provide a PNG with transparent background; the tool extrudes it
2. Drag the model clip onto the timeline
3. In clip properties, adjust **position, rotation, scale** and set **material** (color, roughness, metalness, emissive glow)
4. Drag & drop the model onto the timeline like a video clip to set its duration

---

## Step 4: Add audio reactivity

For any clip (text, 3D object, image, visualizer):

1. Select the clip in the timeline
2. Open **Audio Reactivity** panel
3. Choose a **property** to animate: scale, opacity, position X/Y/Z, rotation, blur
4. Choose a **frequency band**:
   - **Bass** (20–250 Hz) — kick and bass; heavy, punchy reactions
   - **Mid** (250 Hz–2 kHz) — melody, vocals; sustained movement
   - **High** (2–20 kHz) — hi-hats, cymbals; fast shimmer
   - **Loudness** — overall energy; follows the mix
5. Adjust **sensitivity** and **multiplier** — preview in real-time to tune it

**Typical setups by vibe:**
- Heavy bass drop: scale or Z-position on Bass, high multiplier
- Vocal glow: opacity or emissive on Mid
- Hi-hat shimmer: rotation or blur on High, low multiplier

---

## Step 5: Camera movement

1. Open the **Camera panel**
2. To navigate the scene: use **WASD** keys (first-person fly mode)
3. Choose a movement type:
   - **Pre-defined**: pick a preset (pan, orbit, dolly, zoom) — it animates the whole timeline automatically
   - **Keyframe**: fly to a position → click **Add Keyframe** → scrub to another time → reposition → repeat
   - **Bass-reactive bumping**: in Camera panel, enable bump → link to Bass frequency → set intensity
4. Adjust easing between keyframes (linear, ease-in-out)

**Tips:**
- A slow orbit around a 3D logo works well for Spotify Canvas loops
- Bass-bump on Z axis (push toward camera) gives a strong drop effect
- Keep camera movement subtle for lyric videos so text stays readable

---

## Step 6: Add post-processing effects

Add from the **Effects panel** (applied globally):

| Goal | Effect to use |
|------|--------------|
| Dreamy glow | Bloom |
| Vintage / retro | VHS + Scanline + Film Grain |
| Color grade to match artwork | Hue/Saturation + Color Grading |
| Cinematic depth | Autofocus (depth of field) + Vignette |
| Glitchy / cyberpunk | Chromatic Aberration + Noise |

Stack multiple effects — order matters, they apply top to bottom.

---

## Step 7: Preview and adjust

1. Press **Play** to preview the full video with audio
2. Check that:
   - Audio reactivity feels right (not too subtle, not too jittery)
   - Lyrics appear and disappear at the right moments
   - Camera movement doesn't distract from the main visual focus
   - The loop point is clean (for Spotify Canvas)
3. Tweak anything that feels off

---

## Step 8: Render and export

1. **File → Export**
2. Set **resolution** and **format**:
   - YouTube: 1080p or 4K, H.264 or H.265, 30fps
   - Spotify Canvas: 1080×1920 (9:16), H.264, 30fps, 3–8 seconds
   - Instagram/TikTok: 1080×1920 (9:16) or 1080×1080 (1:1), H.264, 30fps
3. Click **Render** — typically takes about a minute
4. Preview the result, then **Download**
5. To share: copy the project link from **File → Share** to let others view or collaborate

---

## Reference

- Guides: https://banger.show/guides
- Discord (help & feedback): linked from the Banger.Show site
