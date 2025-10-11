---
image: /generated/articles-docs-encoding.png
id: encoding
title: Encoding Guide
crumb: 'Codecs and more'
---

Backed by [FFmpeg](https://ffmpeg.org/), Remotion allows you to configure a variety of encoding settings. The goal of this page is to help you navigate through the settings and to help you choose the right one.

## Choosing a codec

Remotion supports 5 video codecs: `h264` (_default_), `h265`, `vp8`, `vp9` and `prores`. While H264 will work well in most cases, sometimes it's worth going for a different codec. Refer to the table below to see the advantages and drawbacks of each codec.

<table>
  <tr>
    <th>Codec</th>
    <th>File extension</th>
    <th>File size</th>
    <th>Encoding time</th>
    <th>Browser compatibility</th>
    <th>Hardware acceleration possible</th>
  </tr>
  <tr>
    <td>
      H.264 <sub>also known as MPEG-4</sub>
    </td>
    <td>.mp4, .mov or .mkv</td>
    <td style={{color: 'darkorange'}}>Medium</td>
    <td style={{color: 'green', fontWeight: 'bold'}}>Very fast</td>
    <td>
      <a
        href="https://caniuse.com/mpeg4"
        style={{color: 'green', fontWeight: 'bold'}}
      >
        Very good
      </a>
    </td>
    <td>No</td>
  </tr>
  <tr>
    <td>
      H.265 <sub>also known as HEVC</sub>
    </td>
    <td>.mp4 or .hevc</td>
    <td style={{color: 'darkorange'}}>Medium</td>
    <td style={{color: 'green'}}>Fast</td>
    <td>
      <a
        href="https://caniuse.com/hevc"
        style={{color: 'red', fontWeight: 'bold'}}
      >
        Very poor
      </a>
    </td>
    <td>No</td>
  </tr>
  <tr>
    <td>VP8</td>
    <td>.webm</td>
    <td style={{color: 'green'}}>Small</td>
    <td style={{color: 'red'}}>Slow</td>
    <td>
      <a href="https://caniuse.com/webm" style={{color: 'darkorange'}}>
        Okay
      </a>
    </td>
    <td>No</td>
  </tr>
  <tr>
    <td>VP9</td>
    <td>.webm</td>
    <td style={{color: 'green', fontWeight: 'bold'}}>Very small</td>
    <td style={{color: 'red', fontWeight: 'bold'}}>Very slow</td>
    <td>
      <a href="https://caniuse.com/webm" style={{color: 'darkorange'}}>
        Okay
      </a>
    </td>
    <td>No</td>
  </tr>
  <tr>
    <td>ProRes</td>
    <td>.mov</td>
    <td style={{color: 'red'}}>Large</td>
    <td style={{color: 'green'}}>Fast</td>
    <td style={{color: 'red', fontWeight: 'bold'}}>None</td>
    <td style={{color: 'green', fontWeight: 'bold'}}>On macOS</td>
  </tr>
</table>

:::info
Click on a browser compatibility link to see exactly which browsers are supported on caniuse.com.
:::

You can set a config using [`Config.setCodec()` in the config file](/docs/config#setcodec) or the [`--codec`](/docs/cli) CLI flag.

[Hardware acceleration](/docs/hardware-acceleration) is available from Remotion 4.0.228.

## Controlling quality using the CRF setting

_Applies only to `h264`, `h265`, `vp8` and `vp9`._

No matter which codec you end up using, there's always a tradeoff between file size and video quality. You can control it by setting the so called CRF (Constant Rate Factor). The **lower the number, the better the quality**, the higher the number, the smaller the file is – of course at the cost of quality.

Be cautious: Every codec has it's own range of acceptable values and a different default. So while `23` will look very good on a H264 video, it will look terrible on a WebM video. Use this chart to determine which CRF value to use:

<table>
  <tr>
    <th>Codec</th>
    <th>Minimum - Best quality</th>
    <th>Maximum - Best compression</th>
    <th>Default</th>
  </tr>
  <tr>
    <td>H264</td>
    <td>1</td>
    <td>51</td>
    <td>18</td>
  </tr>
  <tr>
    <td>H265</td>
    <td>0</td>
    <td>51</td>
    <td>23</td>
  </tr>
  <tr>
    <td>VP8</td>
    <td>4</td>
    <td>63</td>
    <td>9</td>
  </tr>
  <tr>
    <td>VP9</td>
    <td>0</td>
    <td>63</td>
    <td>28</td>
  </tr>
</table>

You can [set a CRF in the config file using the `Config.setCrf()`](/docs/config#setcrf) function or use the [`--crf`](/docs/cli/render#--jpeg-quality) command line flag.

:::note
If you enable [hardware acceleration](/docs/hardware-acceleration), you cannot set a `crf`.
:::

## Controlling quality using `--video-bitrate` and `--audio-bitrate`

Use the following options to set the video and audio bitrate:

- In the Studio: Set video and audio bitrate in the Render Dialog
- In the CLI: Use the [`--video-bitrate`](/docs/cli/render#--video-bitrate) and [`--audio-bitrate`](/docs/cli/render#--audio-bitrate) flags
- In SSR, Lambda and Cloud Run APIs: Use the [`videoBitrate`](/docs/renderer/render-media#videobitrate) and [`audioBitrate`](http://localhost:3000/docs/renderer/render-media#audiobitrate) options.

This option is incompatible with other quality options.

## Controlling quality using ProRes profile

_Applies only to `prores` codec_.

For ProRes, there is no CRF option, but there are profiles which you can set using the [`--prores-profile` flag](/docs/cli/render#--prores-profile) or the [`setProResProfile`](/docs/config#setproresprofile) config file option.

<table>
  <tr>
    <th>Value</th>
    <th>FFmpeg setting</th>
    <th>Bitrate</th>
    <th>
      <a href="/docs/transparent-videos">Supports alpha channel</a>
    </th>
  </tr>
  <tr>
    <td>
      <code>"proxy"</code>
    </td>
    <td>0</td>
    <td>~45Mbps</td>
    <td>No</td>
  </tr>
  <tr>
    <td>
      <code>"light"</code>
    </td>
    <td>1</td>
    <td>~102Mbps</td>
    <td>No</td>
  </tr>
  <tr>
    <td>
      <code>"standard"</code> (default)
    </td>
    <td>2</td>
    <td>~147Mbps</td>
    <td>No</td>
  </tr>
  <tr>
    <td>
      <code>"hq"</code>
    </td>
    <td>3</td>
    <td>~220Mbps</td>
    <td>No</td>
  </tr>
  <tr>
    <td>
      <code>"4444"</code>
    </td>
    <td>4</td>
    <td>~330Mbps</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>
      <code>"4444-xq"</code>
    </td>
    <td>4</td>
    <td>~500Mbps</td>
    <td>Yes</td>
  </tr>
</table>

Higher bitrate means higher quality and higher file size.

## Audio-only export

You can pass `mp3`, `wav` or `aac` as a codec. If you do it, an audio file will be output in the corresponding format. Quality settings will be ignored.

## GIFs

You can also [render your video as a GIF](/docs/render-as-gif).

## Audio codec

_available from v3.3.42_

Using the [`--audio-codec`](/docs/config#setaudiocodec) flag, you can set the format of the audio that is embedded in the video. Not all codec and audio codec combinations are supported and certain combinations require a certain file extension and container format.

The container format will be automatically derived based on the file extension.

import {
  SupportedAudioCodecTable,
  FileExtensionTable,
} from '../components/SupportedAudioCodec';

<SupportedAudioCodecTable />

GIFs don't support audio.

\* Note: In versions before `v4.0.0` the default audio codec for `ProRes` was `aac`. Now it's `pcm-16`.

## File extensions

Specifying a file extension when rendering media will determine the default codec. You may override the codec using `--codec` as long as the combination is supported in the table above.

<FileExtensionTable />

## What other settings do you need?

Which of the dozens of options that FFmpeg supports would you like to see exposed in Remotion? Let us know by opening an [issue on our issue tracker!](https://github.com/remotion-dev/remotion/issues)

## See also

- [CLI Options](/docs/cli)
- [Configuration file](/docs/config)
