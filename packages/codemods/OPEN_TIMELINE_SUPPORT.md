# OpenTimelineIO import support

`@remotion/codemods` converts OpenTimelineIO (OTIO) JSON into editable Remotion TSX. The importer is deterministic: it does not probe media, read files, fetch URLs, or execute OTIO plugins. Given the same input, options, and media resolver results, it produces the same source and diagnostics.

This is an import implementation for the supported subset below. It is not an OTIO round-trip serializer or a replacement for OTIO's native format adapters.

## Generate a component

```ts
import {generateOpenTimelineComposition} from '@remotion/codemods';

const result = generateOpenTimelineComposition({
  timeline: otioJson, // A parsed object or a JSON string.
  componentName: 'ImportedTimeline',
  fps: 30,
  width: 1920,
  height: 1080,
});

if (result.source === null) {
  console.error(result.diagnostics);
} else {
  // Save result.source as a .tsx component and register it using result.metadata.
}
```

`fps`, `width`, and `height` are required: the core OTIO schema does not define a composition's output dimensions or frame rate. The importer calculates `metadata.durationInFrames` from the timeline.

The result includes:

| Field | Meaning |
| --- | --- |
| `source` | Generated TSX, or `null` when any error diagnostic prevents an accurate import. |
| `metadata` | Remotion composition dimensions, frame rate, and duration; nullable when generation fails. |
| `diagnostics` | Ordered `{code, severity, path, message}` records. Severity is `error`, `warning`, or `info`; paths identify the affected OTIO input. |
| `assets` | Resolved `{src, source, kind, path}` records. `source` is `url` or `public`; `kind` is `video`, `audio`, `image`, or `image-sequence`. `path` identifies the source clip. |
| `annotations` | Retained metadata and markers with their source paths. They do not become visible video overlays. |
| `globalStartTime` | Original timeline start timecode, when present. It does not insert a leading gap. |

There is no best-effort mode. An unsupported active feature that changes the result is reported as an error and blocks source output. Non-rendering annotations are retained separately. Unknown duration, invalid timing, unsupported schema versions, and unresolved media must be resolved before importing.

## Add a composition to a project

`addOpenTimelineComposition()` generates a new component file and registers a composition through the existing codemod project API:

```ts
import {addOpenTimelineComposition} from '@remotion/codemods';

const result = addOpenTimelineComposition({
  project,
  compositionFile: 'src/Root.tsx',
  compositionId: 'ImportedTimeline',
  component: {
    filePath: 'src/ImportedTimeline.tsx',
    importName: 'ImportedTimeline',
    importPath: './ImportedTimeline',
  },
  timeline: otioJson,
  fps: 30,
  width: 1920,
  height: 1080,
});
```

It returns immutable file changes, following the other codemod APIs; it does not write files. It accepts the optional `folder` and `resolveMedia` options. Import failures throw `OpenTimelineImportError`, whose diagnostics explain the affected features. Existing component files are not overwritten.

## Feature coverage

“Supported” means the stated mapping is implemented within the limits in this table. “Retained” means data is available in the import result but has no rendered behavior. “Unsupported” means the importer reports the limitation rather than guessing an audiovisual result.

| OTIO feature | Status | Mapping or limit |
| --- | --- | --- |
| `Timeline.1` | Supported | Its `tracks` stack becomes the component timeline. |
| `Stack.1` | Supported | Children start together; later children composite above earlier children. Duration follows the longest child unless trimmed. |
| `Track.1`, legacy `Sequence.1` | Supported | Children are placed consecutively. `Video` tracks emit visuals with embedded audio muted; `Audio` tracks emit audio, including audio sourced from video files. |
| Nested tracks and stacks | Supported | Nested composition timing, source ranges, and layer order are preserved. |
| `Clip.1` | Supported | Uses `media_reference`. |
| `Clip.2` | Supported | Uses the selected entry in `media_references` through `active_media_reference_key`; inactive alternate references are not rendered. |
| `Gap.1`, legacy `Filler.1` | Supported | Transparent, silent time that preserves later clip positions. Gaps reveal lower layers. |
| `RationalTime.1`, `TimeRange.1` | Supported | Convert `value / rate` to seconds, including mixed source rates, preserving fractional clip timing at the selected output rate. Ranges have exclusive ends. |
| Clip `source_range` | Supported | Trims selected media. Without it, the active media reference's `available_range` supplies the range. At least one must establish a duration. |
| Media `available_range.start_time` | Supported | Source timecode is subtracted when calculating offsets into the actual media file. |
| Track/stack `source_range` | Supported | Trims and offsets the nested child timeline. Negative starts delay the child timeline within the selected range. |
| Item `enabled` | Supported | Disabled content remains part of the timing but is hidden or muted. |
| Positive `LinearTimeWarp.1` on clips | Supported | Media playback speed changes while the OTIO item's timeline duration stays fixed. |
| `FreezeFrame.1` on clips | Supported | Holds the first selected source frame for the item's duration. A supplied `time_scalar` must be zero. |
| Composition time effects | Unsupported | Retiming a nested track or stack is not implemented. |
| Negative time scalar, reverse playback, nonlinear time effects | Unsupported | No forward-playback approximation is generated. |
| Generic/custom effects | Unsupported | OTIO does not standardize their rendered behavior. Disabled effects have no rendered effect. |
| Internal `Transition.1` with `SMPTE_Dissolve` | Supported | Dissolves between clips and gaps extend the neighboring source handles and generate frame-driven visual/audio fades. They do not shorten the track. |
| Transition to/from an explicit gap | Supported | Fades against transparency/silence, revealing lower tracks. |
| Zero-duration transition | Supported | Represented as a hard cut, with an informational diagnostic. |
| Leading/trailing transition without an explicit neighboring item | Unsupported | Boundary transition timing is not implemented. Use an explicit gap where appropriate. |
| Transition adjacent to a nested track or stack | Unsupported | Only neighboring clips/gaps are supported. |
| Custom transitions, overlapping transition handles, adjacent transitions | Unsupported | No guessed transition or timing is generated. |
| `ExternalReference.1` | Supported | Remote browser URLs and public-relative asset paths map to media components. See asset handling below. |
| `ImageSequenceReference.1` | Supported with limits | Numbered browser-decodable images use `CanvasImage`, with source rate, frame step, signed frame numbers, zero padding, and empty or nonempty base paths. The available range must contain a positive whole number of frame-step intervals. |
| Image sequence `missing_frame_policy: "error"` | Supported | A missing image fails rather than substituting another frame. |
| Image sequence missing-frame policies `hold` or `black` | Unsupported | Missing files are not discovered or substituted during import. |
| `MissingReference.1` or absent media | Resolver required | Supply a concrete asset through `resolveMedia`; otherwise import reports missing media. |
| `GeneratorReference.1` | Resolver required | Generator kinds and parameters have application-specific meanings; provide a concrete asset through `resolveMedia`. |
| Names | Supported | Preserved as names on editable timeline items. |
| Metadata and markers | Retained | Available in `annotations`; no application-specific metadata is interpreted as effects, transforms, captions, or generator instructions. |
| `global_start_time` | Retained | Original timecode is available separately; composition playback starts at frame zero. |
| UI colors and available image bounds | Not rendered | Reported with informational diagnostics; they are not instructions to tint, crop, or resize pixels. |
| Unknown/custom schemas and future schema versions | Unsupported | Explicit diagnostics prevent treating unknown structures as current schemas. |
| `SerializableCollection` root | Unsupported | Import one `Timeline.1` at a time; a collection has no implied timing relationship. |
| Other top-level objects | Unsupported | Standalone clips, tracks, and time objects are not composition roots for this API. |
| `.otioz`, `.otiod`, AAF, EDL, FCPXML, and other adapter formats | Unsupported | Decode or convert them to OTIO JSON before calling this API. |

## Asset handling

Relative public asset paths generate `staticFile()` calls. Supported remote URLs are passed directly to Remotion media components. Local absolute paths and `file:` URLs cannot be used directly by a browser and require `resolveMedia`. The importer does not copy assets into `public/` or download them.

Use `resolveMedia` to map OTIO references to assets already available to the Remotion project. It also provides the explicit conversion boundary for missing references, application-specific generators, and source formats the browser cannot decode. Keep the resolver deterministic if source output must be reproducible.

The resolver is synchronous and has this signature:

```ts
type OpenTimelineMediaResolver = (options: {
  reference: Readonly<Record<string, unknown>>;
  targetUrl: string | null;
  path: string;
  trackKind: 'Video' | 'Audio';
}) => {
  src: string;
  source: 'url' | 'public';
  kind: 'video' | 'audio' | 'image';
} | null;
```

Return `null` to use default resolution. A thrown exception becomes an error diagnostic. For example, a known local source can be mapped to a preexisting public asset:

```ts
resolveMedia: ({targetUrl}) =>
  targetUrl === 'file:///edit/media/interview.mov'
    ? {src: 'interview.mp4', source: 'public', kind: 'video'}
    : null,
```

For image sequences, both `targetUrl` and the returned `src` refer to a directory base. File naming, numbering, rate, and frame step remain those declared by the OTIO reference. A conversion service can serve browser-decodable image content from the remapped directory under those same filenames.

Default image detection recognizes PNG, JPG, JPEG, SVG, and BMP. Animated or ambiguous GIF, WebP, and AVIF references require an explicit resolver choice, as do non-browser formats such as EXR, DPX, and TIFF. Resolve them to browser-decodable still images or to converted video as appropriate. Images use `objectFit="contain"`; the importer does not infer editorial crop or scale operations.

Image sequences use this relationship, with times expressed in seconds:

```text
elapsed = source time - available_range start
image index = floor(elapsed * rate / frame_step)
filename frame = start_frame + image index * frame_step
```

An image is held for `frame_step / rate` seconds. A frame number of `-1` with zero padding of four becomes `-0001`. A separator is added after a nonempty base URL when needed. EXR, DPX, and other image formats unsupported by the browser require a resolver that supplies converted images; choosing `CanvasImage` does not make those formats decodable.

An empty sequence base uses the public asset root. Partial frame-step intervals in the available range are unsupported and produce an error diagnostic. Frame numbers used in filenames must be safe integers; timing expressed in frames must remain within JavaScript's safe numeric range.

No media probing occurs, so the importer cannot verify URL availability, codec support, actual file duration, audio channels, or that all referenced sequence frames exist. Declared OTIO ranges and supplied resolver results drive generation. A video reference on a `Video` track does not implicitly add sound; place its audio on an `Audio` track to include it.

## Generated Remotion source

Each editable clip has its own authored JSX node with inline timing and names. The output does not create the timeline by mapping a runtime data array. Video and audio use `@remotion/media`; image sequences use `CanvasImage`. Timing components receive one second of premounting through `useVideoConfig().fps`.

Nested timing is expressed through Remotion timeline components. Dissolve animations use frame-driven interpolation, not CSS animation or transition rules. The generator preserves the fixed OTIO item duration when converting clip playback speed. Local public assets use `staticFile()`, and generated strings are serialized as data rather than executable source.

Visual dissolves weight both outgoing and incoming opacity and combine them with `mixBlendMode: 'plus-lighter'` inside a transparent track group with `isolation: 'isolate'`. This preserves the linear blend of alpha-bearing sources without blending into other tracks. Audio dissolves apply the corresponding volume fades. Negative nested source starts use a delayed inner `Sequence` while retaining the enclosing item's duration.

Individual clip boundaries retain fractional frame values, avoiding cumulative drift from rounding each edit separately. The registered duration is the ceiling of the final timeline duration in output frames. Numeric serialization normalizes floating-point arithmetic noise to 15 significant digits.

Install the generated source's imported packages at the same version as `remotion`. The source targets the Remotion timing APIs shipped with this version of `@remotion/codemods`.

## Specification references

The implementation was checked against upstream OpenTimelineIO commit [`eee67fdcdce388696e39f4176d89a61ee9fdc790`](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/tree/eee67fdcdce388696e39f4176d89a61ee9fdc790), observed on October 23, 2026:

- [Serialized schema](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/eee67fdcdce388696e39f4176d89a61ee9fdc790/docs/tutorials/otio-serialized-schema.md)
- [Timeline structure and rendering](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/eee67fdcdce388696e39f4176d89a61ee9fdc790/docs/tutorials/otio-timeline-structure.md)
- [Time ranges](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/eee67fdcdce388696e39f4176d89a61ee9fdc790/docs/tutorials/time-ranges.md)
- [Track timing implementation](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/eee67fdcdce388696e39f4176d89a61ee9fdc790/src/opentimelineio/track.cpp)
- [Image sequence implementation](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/eee67fdcdce388696e39f4176d89a61ee9fdc790/src/opentimelineio/imageSequenceReference.cpp)

The separate [OTIO core data model specification](https://github.com/OpenTimelineIO/OpenTimelineIO-Specification/blob/main/src/main/md/otio-core.md) is a draft and predates current schemas such as `Clip.2` and `Marker.3`. Current upstream schemas, timing documentation, and implementation clarify those differences. OTIO itself leaves generic effects and generators to applications, so accepting their JSON is not equivalent to implementing their rendered behavior.
