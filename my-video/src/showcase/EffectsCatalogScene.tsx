import {barrelDistortion} from "@remotion/effects/barrel-distortion";
import {blur} from "@remotion/effects/blur";
import {brightness} from "@remotion/effects/brightness";
import {burlap} from "@remotion/effects/burlap";
import {checkerboard} from "@remotion/effects/checkerboard";
import {chromaticAberration} from "@remotion/effects/chromatic-aberration";
import {colorCorrection} from "@remotion/effects/color-correction";
import {colorKey} from "@remotion/effects/color-key";
import {contourLines} from "@remotion/effects/contour-lines";
import {contrast} from "@remotion/effects/contrast";
import {cornerPin} from "@remotion/effects/corner-pin";
import {dotGrid} from "@remotion/effects/dot-grid";
import {dropShadow} from "@remotion/effects/drop-shadow";
import {duotone} from "@remotion/effects/duotone";
import {emboss} from "@remotion/effects/emboss";
import {evolve} from "@remotion/effects/evolve";
import {exposure} from "@remotion/effects/exposure";
import {fisheye} from "@remotion/effects/fisheye";
import {flannel} from "@remotion/effects/flannel";
import {glow} from "@remotion/effects/glow";
import {grayscale} from "@remotion/effects/grayscale";
import {gridlines} from "@remotion/effects/gridlines";
import {halftone} from "@remotion/effects/halftone";
import {halftoneLinearGradient} from "@remotion/effects/halftone-linear-gradient";
import {hue} from "@remotion/effects/hue";
import {invert} from "@remotion/effects/invert";
import {levels} from "@remotion/effects/levels";
import {lightLeak} from "@remotion/effects/light-leak";
import {lightTrail} from "@remotion/effects/light-trail";
import {linearGradient} from "@remotion/effects/linear-gradient";
import {linearGradientTint} from "@remotion/effects/linear-gradient-tint";
import {linearProgressiveBlur} from "@remotion/effects/linear-progressive-blur";
import {linearProgressivePixelate} from "@remotion/effects/linear-progressive-pixelate";
import {lines} from "@remotion/effects/lines";
import {liquidContours} from "@remotion/effects/liquid-contours";
import {lut} from "@remotion/effects/lut";
import {mirror} from "@remotion/effects/mirror";
import {noise} from "@remotion/effects/noise";
import {noiseDisplacement} from "@remotion/effects/noise-displacement";
import {outline} from "@remotion/effects/outline";
import {paper} from "@remotion/effects/paper";
import {pattern} from "@remotion/effects/pattern";
import {pixelDissolve} from "@remotion/effects/pixel-dissolve";
import {pixelate} from "@remotion/effects/pixelate";
import {radialProgressiveBlur} from "@remotion/effects/radial-progressive-blur";
import {radialProgressivePixelate} from "@remotion/effects/radial-progressive-pixelate";
import {regionBlur} from "@remotion/effects/region-blur";
import {rings} from "@remotion/effects/rings";
import {roughenEdges} from "@remotion/effects/roughen-edges";
import {saturation} from "@remotion/effects/saturation";
import {scale} from "@remotion/effects/scale";
import {scanlines} from "@remotion/effects/scanlines";
import {shadowsHighlights} from "@remotion/effects/shadows-highlights";
import {shine} from "@remotion/effects/shine";
import {shrinkwrap} from "@remotion/effects/shrinkwrap";
import {skew} from "@remotion/effects/skew";
import {speckle} from "@remotion/effects/speckle";
import {starburst} from "@remotion/effects/starburst";
import {tear} from "@remotion/effects/tear";
import {thermalVision} from "@remotion/effects/thermal-vision";
import {tile} from "@remotion/effects/tile";
import {tint} from "@remotion/effects/tint";
import {uvTranslate, xyTranslate} from "@remotion/effects/translate";
import {tvSignalOff} from "@remotion/effects/tv-signal-off";
import {venetianBlinds} from "@remotion/effects/venetian-blinds";
import {vibrance} from "@remotion/effects/vibrance";
import {vignette} from "@remotion/effects/vignette";
import {wave} from "@remotion/effects/wave";
import {waves} from "@remotion/effects/waves";
import {whiteBalance} from "@remotion/effects/white-balance";
import {whiteNoise} from "@remotion/effects/white-noise";
import {zigzag} from "@remotion/effects/zigzag";
import {zoomBlur} from "@remotion/effects/zoom-blur";
import {AbsoluteFill, CanvasImage, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import type {EffectDescriptor} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Every effect in @remotion/effects' catalog (the list on
// remotion.dev/docs/effects/api, generated from EFFECT_CATALOG in
// @remotion/studio-shared), in catalog order, six per page. EffectsScene
// shows a few of them chained; this scene shows each one on its own, with
// its main parameter animated across the page.
//
// Why pages instead of one grid of 74: every component with effects owns
// its own pair of WebGL2 canvases (core's CanvasPool), and Chrome keeps
// at most 16 WebGL contexts alive per page before it starts losing the
// oldest, which cancels the render ("WebGL context was lost during canvas
// effect rendering"; measured: 8 animated chains pass, 9 fail). So the six
// tiles stay mounted, keyed by slot, and swap their `effects` and `src` each
// page: a chain keeps its canvases while its size is unchanged, so this
// costs 12 contexts however many effects it cycles through.
//
// Sources: sample-frame.png for most effects; a star on a transparent
// background for the ones that work from alpha (dropShadow, outline,
// roughenEdges, and the maskToSourceAlpha option of checkerboard/rings), for
// glow and lightTrail, which threshold brightness and read best on a subject,
// and for regionBlur/zoomBlur, whose smear is easier to see on a hard edge
// than on the photo's smooth gradient; the same star on a pure green screen
// for colorKey. The tiles' checkerboard background shows where an effect made
// pixels transparent. Several entries use a non-default option (evolve's
// direction, halftone's shape, vignette's alpha mode...) to show one more
// setting per effect.
const COLUMNS = 3;
const ROWS = 2;
const PER_PAGE = COLUMNS * ROWS;
const TILE_WIDTH = 384;
const TILE_HEIGHT = 216;
const FRAMES_PER_PAGE = 30;

const SOURCES = {
  photo: "sample-frame.png",
  subject: "effects-subject.svg",
  greenscreen: "effects-greenscreen.svg",
} as const;

// The warm 2×2×2 .cube LUT from the lut() docs.
const WARM_LUT = `TITLE "Warm"
LUT_3D_SIZE 2
0 0 0
1 0.1 0
0 0.9 0.1
1 0.9 0.1
0 0.1 0.8
1 0.2 0.7
0 0.9 0.8
1 0.9 0.8`;

const CHECKER = "repeating-conic-gradient(#1e293b 0% 25%, #334155 0% 50%) 50% / 24px 24px";

type CatalogEntry = {
  readonly name: string;
  readonly category: string;
  readonly source: keyof typeof SOURCES;
  // t runs 0 → 1 across the page.
  readonly effects: (t: number) => EffectDescriptor<unknown>[];
};

const at = (t: number, from: number, to: number) => interpolate(t, [0, 1], [from, to]);

export const EFFECTS_CATALOG: readonly CatalogEntry[] = [
  // Color
  {name: "brightness()", category: "Color", source: "photo", effects: (t) => [brightness({amount: at(t, -0.5, 0.5)})]},
  {name: "contrast()", category: "Color", source: "photo", effects: (t) => [contrast({amount: at(t, 0.5, 1.8)})]},
  {
    name: "colorCorrection()",
    category: "Color",
    source: "photo",
    effects: (t) => [colorCorrection({exposure: 0.25, contrast: 1.1, shadows: 0.2, highlights: -0.15, temperature: at(t, -0.6, 0.6), vibrance: 0.2, pivot: 0.4, whites: 0.15, blacks: -0.1})],
  },
  {name: "colorKey()", category: "Color", source: "greenscreen", effects: (t) => [colorKey({keyColor: "#00ff00", similarity: at(t, 0, 0.3), spillSuppression: 0.6})]},
  {name: "duotone()", category: "Color", source: "photo", effects: (t) => [duotone({darkColor: "#1e3a8a", lightColor: "#f472b6", threshold: at(t, 0.3, 0.7)})]},
  {name: "exposure()", category: "Color", source: "photo", effects: (t) => [exposure({stops: at(t, -2, 1.5)})]},
  {name: "grayscale()", category: "Color", source: "photo", effects: (t) => [grayscale({amount: t})]},
  {name: "hue()", category: "Color", source: "photo", effects: (t) => [hue({degrees: at(t, 0, 360)})]},
  {name: "invert()", category: "Color", source: "photo", effects: (t) => [invert({amount: t})]},
  {name: "levels()", category: "Color", source: "photo", effects: (t) => [levels({blackPoint: at(t, 0, 0.35), whitePoint: at(t, 1, 0.75), gamma: 1.2})]},
  {name: "lut()", category: "Color", source: "photo", effects: () => [lut({content: WARM_LUT})]},
  {name: "saturation()", category: "Color", source: "photo", effects: (t) => [saturation({amount: at(t, 0, 2)})]},
  {name: "shadowsHighlights()", category: "Color", source: "photo", effects: (t) => [shadowsHighlights({shadows: at(t, -0.5, 0.5), highlights: at(t, 0.5, -0.5)})]},
  {name: "tint()", category: "Color", source: "photo", effects: (t) => [tint({color: "#f59e0b", amount: at(t, 0, 0.8)})]},
  {name: "whiteBalance()", category: "Color", source: "photo", effects: (t) => [whiteBalance({temperature: at(t, -0.5, 0.5), tint: -0.1})]},
  {name: "vibrance()", category: "Color", source: "photo", effects: (t) => [vibrance({amount: t})]},
  {
    name: "linearGradient()",
    category: "Color",
    source: "photo",
    effects: (t) => [linearGradient({start: [0, at(t, 0, 1)], end: [1, at(t, 1, 0)], startColor: "#0b84f3", endColor: "#ff5c8a"})],
  },
  {
    name: "linearGradientTint()",
    category: "Color",
    source: "photo",
    effects: (t) => [linearGradientTint({start: [0, 0.5], end: [1, 0.5], startColor: "#0b84f3", endColor: "#ff5c8a", amount: at(t, 0, 0.9)})],
  },
  {name: "thermalVision()", category: "Color", source: "photo", effects: (t) => [thermalVision({amount: at(t, 0.3, 1), palette: ["#020617", "#7c3aed", "#f472b6", "#fde68a"]})]},

  // Blur & Shadow
  {name: "blur()", category: "Blur & Shadow", source: "photo", effects: (t) => [blur({radius: at(t, 0, 10)})]},
  {
    name: "linearProgressiveBlur()",
    category: "Blur & Shadow",
    source: "photo",
    effects: (t) => [linearProgressiveBlur({start: [0, 0.5], end: [1, 0.5], startBlur: 0, endBlur: at(t, 0, 20)})],
  },
  {
    name: "radialProgressiveBlur()",
    category: "Blur & Shadow",
    source: "photo",
    effects: (t) => [radialProgressiveBlur({center: [0.5, 0.5], width: 1, height: 1, start: 0.4, startBlur: 0, endBlur: at(t, 0, 40)})],
  },
  {
    name: "regionBlur()",
    category: "Blur & Shadow",
    source: "subject",
    effects: (t) => [regionBlur({topLeft: [at(t, 0.05, 0.55), 0.1], bottomRight: [at(t, 0.45, 0.95), 0.9], blurRadius: 12, feather: 4, roundness: 1})],
  },
  {name: "zoomBlur()", category: "Blur & Shadow", source: "subject", effects: (t) => [zoomBlur({amount: at(t, 0, 60), center: [0.5, 0.5], samples: 48})]},
  {
    name: "dropShadow()",
    category: "Blur & Shadow",
    source: "subject",
    effects: (t) => [dropShadow({radius: 8, offsetX: at(t, -12, 12), offsetY: 8, opacity: 0.8, color: "#000000"})],
  },
  {
    name: "glow()",
    category: "Blur & Shadow",
    source: "subject",
    effects: (t) => [glow({radius: 10, intensity: at(t, 0.5, 2), threshold: 0.2, color: "#00d8ff"})],
  },
  {name: "outline()", category: "Blur & Shadow", source: "subject", effects: (t) => [outline({width: at(t, 1, 6), edgeSimplification: 4, color: "#facc15", opacity: at(t, 0.4, 1), outlineOnly: t > 0.5})]},
  {
    name: "lightTrail()",
    category: "Blur & Shadow",
    source: "subject",
    effects: (t) => [lightTrail({direction: 180, distance: at(t, 0, 60), intensity: 1.6, decay: 0.9, threshold: 0.2, color: "#ffb000", samples: 48})],
  },

  // Reveal
  {name: "evolve()", category: "Reveal", source: "photo", effects: (t) => [evolve({progress: t, direction: "bottom", feather: 0.18})]},
  {name: "tear()", category: "Reveal", source: "photo", effects: (t) => [tear({progress: t, angle: 60, rotation: 20, jaggedness: 8})]},
  {name: "venetianBlinds()", category: "Reveal", source: "photo", effects: (t) => [venetianBlinds({progress: t, direction: "horizontal", slats: 10})]},

  // Transform
  {name: "mirror()", category: "Transform", source: "photo", effects: (t) => [mirror({direction: "horizontal", position: at(t, 0.3, 0.7)})]},
  {name: "scale()", category: "Transform", source: "photo", effects: (t) => [scale({scale: at(t, 1, 0.5)})]},
  // tile() repeats whatever is left after scale() shrank the image.
  {name: "tile()", category: "Transform", source: "photo", effects: (t) => [scale({scale: at(t, 0.5, 0.25)}), tile()]},
  {name: "uvTranslate()", category: "Transform", source: "photo", effects: (t) => [uvTranslate({u: at(t, -0.2, 0.2), v: 0.05})]},
  {name: "xyTranslate()", category: "Transform", source: "photo", effects: (t) => [xyTranslate({x: at(t, -60, 60), y: 20})]},

  // Distort
  {name: "barrelDistortion()", category: "Distort", source: "photo", effects: (t) => [barrelDistortion({amount: at(t, 0, 0.5)})]},
  {name: "chromaticAberration()", category: "Distort", source: "photo", effects: (t) => [chromaticAberration({amount: at(t, 0, 8), angle: at(t, 0, 90)})]},
  {name: "fisheye()", category: "Distort", source: "photo", effects: (t) => [fisheye({fieldOfView: at(t, 1.2, 2.8)})]},
  {
    name: "cornerPin()",
    category: "Distort",
    source: "photo",
    effects: (t) => [cornerPin({topLeft: [0.08, at(t, 0, 0.12)], topRight: [0.92, 0.04], bottomRight: [0.86, 0.9], bottomLeft: [0.14, 0.96]})],
  },
  {name: "wave()", category: "Distort", source: "photo", effects: (t) => [wave({phase: t * 6, direction: "vertical", amplitude: 8, wavelength: 70})]},
  {name: "skew()", category: "Distort", source: "photo", effects: (t) => [skew({x: at(t, -20, 20), y: 0, origin: [0.5, 0.5]})]},

  // Stylize
  {
    name: "burlap()",
    category: "Stylize",
    source: "photo",
    effects: (t) => [burlap({amount: at(t, 0.2, 1), size: 3, roughness: 0.85, seed: 1, color: "#3b2818"})],
  },
  {
    name: "emboss()",
    category: "Stylize",
    source: "photo",
    effects: (t) => [emboss({amount: 0.85, size: 12, lineWidth: 3, depth: 0.85, angle: 0, lightAngle: 135, offset: t * 20})],
  },
  {name: "dotGrid()", category: "Stylize", source: "photo", effects: (t) => [dotGrid({dotSize: at(t, 4, 12), gridSize: 12})]},
  {
    name: "halftone()",
    category: "Stylize",
    source: "photo",
    effects: (t) => [halftone({shape: "square", dotSize: 10, dotSpacing: 10, rotation: at(t, 0, 45), sampling: "nearest", ...(t < 0.5 ? {colorMode: "source"} : {colorMode: "solid", dotColor: "#facc15"})})],
  },
  {name: "noise()", category: "Stylize", source: "photo", effects: (t) => [noise({amount: at(t, 0.1, 0.5), seed: 7, premultiply: true, disabled: t < 0.25})]},
  {
    name: "noiseDisplacement()",
    category: "Stylize",
    source: "photo",
    effects: (t) => [noiseDisplacement({center: [0.5, 0.5], radius: 0.3, strength: at(t, 0, 24), seed: 12, grainSize: 4, passes: 6, feather: 0.25, biasDirection: 90, biasAmount: 0.6})],
  },
  {
    name: "paper()",
    category: "Stylize",
    source: "photo",
    effects: (t) => [
      paper({amount: at(t, 0.3, 1), roughness: 0.4, fiber: 0.3, fiberSize: 0.2, crumples: 0.3, crumpleSize: 0.35, folds: 0.65, foldCount: 5, drops: 0.2, scale: 0.6, seed: 6, colorFront: "#f5e6c8", colorBack: "#ffffff", fade: 0.4}),
    ],
  },
  {name: "roughenEdges()", category: "Stylize", source: "subject", effects: (t) => [roughenEdges({amount: at(t, 0.2, 1), border: 12, scale: 0.07, seed: 231.2})]},
  {
    name: "pattern()",
    category: "Stylize",
    source: "photo",
    effects: (t) => [pattern({scale: 0.3, gapX: 8, gapY: 8, offsetU: t * 0.5, rowOffset: 30, rowOffsetEvery: 2, columnOffset: 12, columnOffsetEvery: 3, offsetV: t * 0.25, cropLeft: 40, cropRight: 40, cropTop: 20, cropBottom: 20, origin: [0.5, 0]})],
  },
  {name: "pixelDissolve()", category: "Stylize", source: "photo", effects: (t) => [pixelDissolve({progress: t, columns: 12, rows: 8, seed: 0, feather: 0.15})]},
  {name: "pixelate()", category: "Stylize", source: "photo", effects: (t) => [pixelate({blockSize: at(t, 1, 24)})]},
  {
    name: "linearProgressivePixelate()",
    category: "Stylize",
    source: "photo",
    effects: (t) => [linearProgressivePixelate({start: [0, 0.5], end: [1, 0.5], startBlockSize: 1, endBlockSize: at(t, 1, 24)})],
  },
  {
    name: "radialProgressivePixelate()",
    category: "Stylize",
    source: "photo",
    effects: (t) => [radialProgressivePixelate({center: [0.5, 0.5], width: 1, height: 1, start: 0.3, startBlockSize: 1, endBlockSize: at(t, 1, 24)})],
  },
  {name: "scanlines()", category: "Stylize", source: "photo", effects: (t) => [scanlines({amount: 0.4, spacing: 4, thickness: 1, offset: t * 20, premultiply: true})]},
  {name: "speckle()", category: "Stylize", source: "photo", effects: (t) => [speckle({density: at(t, 0.05, 0.3), size: 3, randomness: 1})]},
  {
    name: "shine()",
    category: "Stylize",
    source: "photo",
    effects: (t) => [shine({progress: t, angle: 30, haloSigma: 60, coreSigma: 20, haloIntensity: 0.3, coreIntensity: 0.5})],
  },
  {
    name: "shrinkwrap()",
    category: "Stylize",
    source: "photo",
    effects: (t) => [shrinkwrap({amount: 1, displacement: 5, highlightIntensity: 0.85, wrinkleDensity: 0.48, edgeTension: 0.58, phase: t * 3, seed: 8})],
  },
  {name: "vignette()", category: "Stylize", source: "photo", effects: (t) => [vignette({amount: at(t, 0, 0.9), radius: 0.55, feather: 0.35, mode: "alpha"})]},

  // Generate
  {
    name: "contourLines()",
    category: "Generate",
    source: "photo",
    effects: (t) => [
      contourLines({lineColor: "rgba(255, 255, 255, 0.75)", lineWidth: 1.2, spacing: 18, scale: 110, complexity: 0.7, smoothness: 0.75, seed: 2, offsetX: t * 20, offsetY: t * 10}),
    ],
  },
  {name: "liquidContours()", category: "Generate", source: "photo", effects: (t) => [liquidContours({spacing: 30, scale: 150, seed: 4, offsetX: 13.4, phase: 3.23 + t, firstColor: "#dff4ff", secondColor: "#2563eb"})]},
  // maskToSourceAlpha: the pattern only fills where the star is.
  {
    name: "checkerboard()",
    category: "Generate",
    source: "subject",
    effects: (t) => [checkerboard({colors: ["#dff4ff", "#7cc6ff"], cellSize: 24, angle: 15, offsetX: t * 48, maskToSourceAlpha: true})],
  },
  {
    name: "flannel()",
    category: "Generate",
    source: "photo",
    effects: (t) => [flannel({amount: at(t, 0.3, 1), size: 40, softness: 0.18, baseColor: "#c92f3d", stripeColor: "#241015"})],
  },
  {
    name: "halftoneLinearGradient()",
    category: "Generate",
    source: "photo",
    effects: (t) => [
      halftoneLinearGradient({firstStopDotSize: 0, secondStopDotSize: at(t, 4, 22), firstStopPosition: [0, 0.5], secondStopPosition: [1, 0.5], gridSize: 12, ...(t < 0.5 ? {colorMode: "source"} : {colorMode: "solid", dotColor: "#0f172a"})}),
    ],
  },
  {
    name: "gridlines()",
    category: "Generate",
    source: "photo",
    effects: (t) => [gridlines({gridSize: 32, lineWidth: 2, lineColor: "#7cc6ff", rotation: 15, rotationX: at(t, 0, 50), rotationY: at(t, 0, 30), perspective: 800, backgroundColor: "rgba(15, 23, 42, 0.35)"})],
  },
  {name: "whiteNoise()", category: "Generate", source: "photo", effects: (t) => [whiteNoise({amount: at(t, 0.2, 1), seed: Math.floor(t * 30)})]},
  {name: "tvSignalOff()", category: "Generate", source: "photo", effects: (t) => [tvSignalOff({amount: t})]},
  {name: "lines()", category: "Generate", source: "photo", effects: (t) => [lines({colors: ["#dff4ff", "#7cc6ff"], thickness: 16, gap: 10, angle: 20, offset: t * 60})]},
  {
    name: "rings()",
    category: "Generate",
    source: "subject",
    effects: (t) => [rings({colors: ["#9fd6ff", "transparent"], thickness: 14, offset: t * 40, maskToSourceAlpha: true})],
  },
  {
    name: "waves()",
    category: "Generate",
    source: "photo",
    effects: (t) => [waves({colors: ["#dff4ff", "#7cc6ff"], thickness: 16, amplitude: 10, wavelength: 80, phase: at(t, -180, 180), offset: t * 30})],
  },
  {
    name: "zigzag()",
    category: "Generate",
    source: "photo",
    effects: (t) => [zigzag({colors: ["#d7b8ff", "transparent"], thickness: 16, amplitude: 14, wavelength: 60, offset: t * 40})],
  },
  {name: "lightLeak()", category: "Generate", source: "photo", effects: (t) => [lightLeak({seed: 3, hueShift: 30, progress: at(t, 0, 0.6)})]},
  {
    name: "starburst()",
    category: "Generate",
    source: "photo",
    effects: (t) => [starburst({rays: 16, colors: ["#ff6600", "#ffff00"], rotation: at(t, 0, 90), origin: [0.5, 0.5]})],
  },
];

const PAGES = Math.ceil(EFFECTS_CATALOG.length / PER_PAGE);
export const EFFECTS_CATALOG_DURATION = PAGES * FRAMES_PER_PAGE;

export const EffectsCatalogScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const page = Math.min(Math.floor(frame / FRAMES_PER_PAGE), PAGES - 1);
  const t = interpolate(frame - page * FRAMES_PER_PAGE, [0, FRAMES_PER_PAGE - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const entries = EFFECTS_CATALOG.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const categories = [...new Set(entries.map((entry) => entry.category))].join(" · ");

  return (
    <AbsoluteFill style={{background: palette.bg, fontFamily: poppins, alignItems: "center"}}>
      <div style={{width, textAlign: "center", color: palette.textDim, fontSize: 24, marginTop: 36}}>
        @remotion/effects · all {EFFECTS_CATALOG.length} catalog effects · page {page + 1}/{PAGES}
      </div>
      <div style={{color: palette.text, fontSize: 30, fontWeight: 600, marginTop: 6, marginBottom: 22}}>{categories}</div>
      <div style={{display: "grid", gridTemplateColumns: `repeat(${COLUMNS}, ${TILE_WIDTH}px)`, gridTemplateRows: `repeat(${ROWS}, auto)`, gap: 22}}>
        {entries.map((entry, slot) => (
          // Keyed by slot, not by effect: the tile's CanvasImage (and the
          // WebGL2 canvases its effect chain owns) must survive page changes.
          <div key={slot} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8}}>
            <div style={{width: TILE_WIDTH, height: TILE_HEIGHT, borderRadius: 8, overflow: "hidden", background: CHECKER}}>
              <CanvasImage src={staticFile(SOURCES[entry.source])} width={TILE_WIDTH} height={TILE_HEIGHT} fit="cover" effects={entry.effects(t)} />
            </div>
            <div style={{color: palette.text, fontSize: 18, fontFamily: "monospace"}}>{entry.name}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
