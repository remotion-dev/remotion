---
image: /generated/articles-docs-media-parser-fields.png
id: fields
title: Available Fields
slug: /media-parser/fields
crumb: '@remotion/media-parser'
---

:::warning
[We are phasing out Media Parser and are moving to Mediabunny](/blog/mediabunny)!
:::

The following fields are available in [`parseMedia()`](/docs/media-parser/parse-media):

### `dimensions`

_[`MediaParserDimensions`](/docs/media-parser/types#mediaparserdimensions) | null_

The dimensions of the video.  
Any rotation is already applied - the dimensions are like a media player would show them.  
Use `unrotatedDimensions` to get the dimensions before rotation.

If the media passed is an audio file, this will return `null`.

### `durationInSeconds`

_number | null_

The duration of the video in seconds.  
Only returns a non-null value if the duration is stored in the metadata.

### `slowDurationInSeconds`

_number_

The duration of the media in seconds, but it is guaranteed to return a value.

If needed, the entire video file is read to determine the duration.  
However, if the duration is stored in the metadata, it will be used, so it will not read the entire file.

### `name`

_string_

The name of the file.

### `container`

_[`MediaParserContainer`](/docs/media-parser/types#mediaparsercontainer)_

The container of the file.

### `size`

_number | null_

The size of the input in bytes.

### `mimeType`

_string | null_

The MIME type of the file that was returned when the file was fetched.  
Only available if using the [`webReader`](/docs/media-parser/web-reader) (default).

### `slowStructure`

The internal structure of the video. Unstable, internal data structure, refer to the TypeScript types to see what's inside.

### `fps`

_number | null_

The frame rate of the video.  
Only returns a non-null value if the frame rate is stored in the metadata.

### `slowFps`

_number_

The frame rate of the video, but it is guaranteed to return a value.

If needed, the entire video file is read to determine the frame rate.
However, if the frame rate is stored in the metadata, it will be used, so it will not read the entire file.

### `videoCodec`

_[`MediaParserVideoCodec`](/docs/media-parser/types#mediaparservideocodec) | null_

The video codec of the file.  
If multiple video tracks are present, this will be the first video track.  
One of `"h264"`, `"h265"`, `"vp8"`, `"vp9"`, `"av1"`, `"prores"` or `null` (in case of an unknown codec).

### `audioCodec`

_[`MediaParserAudioCodec`](/docs/media-parser/types#mediaparseraudiocodec) | null_

The audio codec of the file.  
If multiple audio tracks are present, this will be the first audio track.  
One of `'aac'`, `'mp3'`, `'aiff'`, `'opus'`, `'pcm'`, `'flac'`, `'unknown'` (audio is there but not recognized) or `null` (in case of no audio detected).

### `metadata`

_[`MediaParserMetadataEntry[]`](/docs/media-parser/types#mediaparsermetadataentry)_

Metadata fields such as ID3 tags or EXIF data.  
See [metadata](/docs/media-parser/tags) for more information.

### `location`

_[`MediaParserLocation`](/docs/media-parser/types#mediaparserlocation) | null_

The location of the video was shot. Either `null` if not available or:

- `latitude`: The latitude of the location
- `longitude`: The longitude of the location
- `altitude`: The altitude of the location (can be `null`)
- `horizontalAccuracy`: The horizontal accuracy of the location (can be `null`)

### `tracks`

_[`MediaParserTrack[]`](/docs/media-parser/types#mediaparsertrack)_

An array of [`MediaParserTrack`](/docs/media-parser/types#mediaparsertrack).

### `keyframes`

_[`MediaParserKeyframe[]`](/docs/media-parser/types#mediaparserkeyframe) | null_

An array of keyframes. Each keyframe has the following structure:

Only being returned if the keyframe information are stored in the metadata, otherwise `null`.

### `slowKeyframes`

_[`MediaParserKeyframe[]`](/docs/media-parser/types#mediaparserkeyframe)_

An array of keyframes, same as [`keyframes`](#keyframes), but it is guaranteed to return a value.

Will read the entire video file to determine the keyframes.

### `slowNumberOfFrames`

_number_

The number of video frames in the media.  
Will read the entire video file to determine the number of frames.

### `unrotatedDimensions`

_[`MediaParserDimensions`](/docs/media-parser/types#mediaparserdimensions) | null_

The dimensions of the video before rotation.

### `isHdr`

_`boolean`_

Whether the video is in HDR (High dynamic range).

### `rotation`

_number_

The rotation of the video in degrees (e.g. `90` for a 90° counter-clockwise rotation).  
Always one of the following values: `0`, `90`, `180`, `270`.

:::note
Breaking change from v4.0.328: The rotation is now in _counter-clockwise_ degrees, where as before it was in _clockwise_ degrees.  
This is because the WebCodecs spec now supports rotation and since `MediaParserVideoTrack` can be passed to `VideoDecoder.configure()`, this change was necessary to make sure the rotation is always in the correct direction.
:::

### `images`

_[`MediaParserEmbeddedImage[]`](/docs/media-parser/types#mediaparserembeddedimage)_

Embedded images in the file, for example an album cover inside an MP3.

### `sampleRate`

_number | null_

The audio sample rate, if there is an audio track.

### `numberOfAudioChannels`

_number | null_

The number of audio channels, if there is an audio track.

### `slowAudioBitrate`

_number_

The audio bitrate in bits per second. `null` if there is no audio track.

:::note
1 byte is 8 bits.
:::

### `slowVideoBitrate`

_number | null_

The video bitrate in bits per second. `null` if there is no video track.

:::note
1 byte is 8 bits.
:::

### `m3uStreams`

_[`M3uStream[]`](/docs/media-parser/types#m3ustream) | null_

Only for .m3u8, this will return a non-`null` value if the file is a playlist.
