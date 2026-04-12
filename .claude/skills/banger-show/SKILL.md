---
name: banger-show
description: Create music videos and audio-reactive visuals using Banger.Show. Use when helping users build projects on the Banger.Show platform — lyric videos, audio visualizers, 3D visuals, camera animations, and exporting for YouTube, Spotify Canvas, and social media.
---

# Banger.Show

Banger.Show (https://banger.show) is an online music video creation platform for musicians and artists. It renders audio-reactive 3D visuals, lyric videos, and music visualizers using a timeline-based editor. Videos can be exported for YouTube, Spotify Canvas, and social media.

Banger.Show uses Remotion internally for its cloud rendering pipeline.

## Getting Started

1. Go to https://banger.show and sign in
2. Create a new project and **upload your audio track** (MP3, WAV, or AAC)
3. Choose a **template** or start from a blank canvas
4. Customize visuals using the Clips panel, Timeline, and property editors
5. Preview in real-time, then **render and export**

## Lyric Videos

Create animated text synchronized to your track.

1. **Add a Text clip** from the Clips panel
2. Type or paste your lyrics into the text editor
3. **Set in/out points** on the timeline for each lyric line — scrub to the right moment and trim
4. **Choose an entrance/exit animation**: fade, slide, typewriter, scale, etc.
5. **Style the text**: font family, size, color, gradient, letter spacing, 3D depth
6. Repeat for each lyric line, stacking clips in the timeline

**Tips:**
- Work verse-by-verse — add all clips for a section before moving to the next
- Use the snap-to-playhead feature for precise timing
- Duplicate clips to reuse styling across multiple lines

## Audio Reactivity

Link visual properties to your music so they pulse and react automatically.

1. **Select a clip** in the timeline or canvas
2. Open the **Audio Reactivity panel** in the properties sidebar
3. **Choose a property** to animate: scale, opacity, position X/Y, rotation, blur, etc.
4. **Choose a frequency band**:
   - **Bass** (20–250 Hz) — kick drums, bass lines; gives punchy, heavy reactions
   - **Mid** (250 Hz–2 kHz) — melody, vocals; good for sustained movement
   - **High** (2–20 kHz) — hi-hats, cymbals; creates fast, subtle shimmer
   - **Overall loudness** — reacts to the full mix energy
5. **Adjust sensitivity** (how strongly the audio drives the property) and **multiplier** (scales the effect range)
6. Preview with the play button; tweak until it feels right

**Built-in visualizers** (add from the Clips panel):
- Waveform, Spectre, Oscilloscope, Ferro Fluid, Pulsar, Circle

## Camera Movements

Add cinematic motion to your 3D scene.

1. Open the **Camera panel**
2. Choose a movement approach:
   - **Pre-defined animations** — pan, zoom, orbit, dolly; pick and apply directly
   - **Keyframe animation** — position the camera manually at a frame, click "Add Keyframe", move to another frame, reposition, repeat
   - **Bass-reactive bumping** — camera shakes or pulses in sync with low frequencies; configure intensity and direction
3. Adjust **easing** between keyframes: linear, ease-in, ease-out, ease-in-out
4. Use **orbit mode** to rotate around a central subject automatically

**Tips:**
- Subtle slow camera drift reads well on loop videos (Spotify Canvas)
- Bass bumping on the Z axis (push/pull) creates an impactful drop effect
- Lock camera Y position to avoid unwanted vertical drift on simple pans

## Clips and Timeline

The timeline is the core editing surface.

- **Add clips**: open the Clips panel → drag onto the timeline or click to insert at playhead
- **Clip types**: 3D objects, images, text, video, audio-reactive backgrounds (GLSL shaders), effects overlays
- **Trim**: drag the left or right edge of a clip to adjust its start/end
- **Move**: drag the clip body to shift its position in time
- **Layer order**: clips higher in the stack appear in front; drag to reorder
- **Transitions**: right-click the boundary between two clips to add a transition (fade, wipe, dissolve)
- **Duplicate**: Cmd/Ctrl+D to copy a clip with all its settings

## 3D Objects

- **Upload your own model**: GLB or GLTF format; drag into the editor or use File → Import
- **Browse Sketchfab**: search thousands of free CC-licensed 3D models from inside the editor
- **Logo to 3D**: use the built-in tool to extrude your artist logo (PNG with transparent background) into a 3D object
- **Images and text** are automatically given 3D depth — adjust extrusion depth in the properties panel
- **Materials**: change color, roughness, metalness, and emissive glow on any 3D object

## Post-Processing Effects

Effects are applied globally to the scene. Add them from the Effects panel.

| Category   | Effects |
|------------|---------|
| Color      | Hue/Saturation, Color Grading, Bloom |
| Distortion | VHS, Chromatic Aberration, Scanline |
| Depth      | Autofocus (depth of field), Vignette |
| Texture    | Noise, Film Grain |

Stack multiple effects; order matters — effects are applied top to bottom.

## Export Settings

Open **File → Export** to configure your render.

| Setting    | Options |
|------------|---------|
| Resolution | 720p, 1080p, 1440p, 4K (3840×2160) |
| Format     | MP4 (H.264 or H.265) |
| HDR        | Available for supported bundles |
| Frame rate | 24, 30, 60 fps |

**Platform presets:**

| Platform        | Aspect Ratio | Max Duration | Notes |
|-----------------|--------------|--------------|-------|
| YouTube         | 16:9         | Full track   | 1080p or 4K recommended |
| Spotify Canvas  | 9:16         | 3–8 seconds  | Must loop cleanly |
| Instagram Reel  | 9:16         | Up to 90s    | 1080×1920 |
| Instagram Post  | 1:1          | Up to 60s    | 1080×1080 |
| TikTok          | 9:16         | Up to 10 min | 1080×1920 |

**Tips:**
- For Spotify Canvas: trim the project to exactly 3–8 seconds and ensure the last frame blends into the first for a seamless loop
- H.265 produces smaller files at the same quality; use H.264 for broadest compatibility
- Render at 1080p for social; 4K for official YouTube releases

## Reference

- Guides: https://banger.show/guides
- Homepage: https://banger.show
