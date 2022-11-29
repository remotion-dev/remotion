---
id: encoding
title: Encoding Guide
crumb: "Codecs and more"
---

Backed by [FFMPEG](https://ffmpeg.org/), Remotion allows you to configure a variety of encoding settings. The goal of this page is to help you navigate through the settings and to help you choose the right one.

## Choosing a codec

Remotion supports 5 video codecs: `h264` (_default_), `h265`, `vp8`, `vp9` and `prores`. While H264 will work well in most cases, sometimes it's worth going for a different codec. Refer to the table below to see the advantages and drawbacks of each codec.

<table>
  <tr>
    <th>Codec</th>
    <th>File extension</th>
    <th>File size</th>
    <th>Rendering time</th>
    <th>Browser compatibility</th>
  </tr>
  <tr>
    <td>H.264 <sub>also known as MPEG-4</sub></td>
    <td>.mp4 or .mkv</td>
    <td style={{color: 'red'}}>Large</td>
    <td style={{color: 'green', fontWeight: 'bold'}}>Very fast</td>
    <td><a href="https://caniuse.com/mpeg4" style={{color: 'green', fontWeight: 'bold'}}>Very good</a></td>
  </tr>
  <tr>
    <td>H.265 <sub>also known as HEVC</sub></td>
    <td>.mp4 or .hevc</td>
    <td style={{color: 'darkorange'}}>Medium</td>
    <td style={{color: 'green'}}>Fast</td>
    <td><a href="https://caniuse.com/hevc" style={{color: 'red', fontWeight: 'bold'}}>Very poor</a></td>
  </tr>
  <tr>
    <td>VP8</td>
    <td>.webm</td>
    <td style={{color: 'green'}}>Small</td>
    <td style={{color: 'red'}}>Slow</td>
    <td><a href="https://caniuse.com/webm" style={{color: 'darkorange'}}>Okay</a></td>
  </tr>
  <tr>
    <td>VP9</td>
    <td>.webm</td>
    <td style={{color: 'green', fontWeight: 'bold'}}>Very small</td>
    <td style={{color: 'red', fontWeight: 'bold'}}>Very slow</td>
    <td><a href="https://caniuse.com/webm" style={{color: 'darkorange'}}>Okay</a></td>
  </tr>
  <tr>
    <td>ProRes</td>
    <td>.mov</td>
    <td style={{color: 'red'}}>Large</td>
    <td style={{color: 'green'}}>Fast</td>
    <td style={{color: 'red', fontWeight: 'bold'}}>None</td>
  </tr>
</table>

:::info
Click on a browser compatibility link to see exactly which browsers are supported on caniuse.com.
:::

You can set a config using [`Config.Output.setCodec()` in the config file](/docs/config#setcodec) or the [`--codec`](/docs/cli) CLI flag.

## Controlling quality using the CRF setting

_Applies only to `h264`, `h265`, `vp8` and `vp9`._

No matter which codec you end up using, there's always a tradeoff between file size and video quality. You can control it by setting the so called CRF (Constant Rate Factor). The **lower the number, the better the quality**, the higher the number, the smaller the file is – of course at the cost of quality.

Be cautious: Every codec has it's own range of acceptable values and a different default. So while `23` will look very good on a H264 video, it will look terrible on a WebM video. Use this chart to determine which CRF value to use:

<details style={{fontSize: '0.9em'}}>
<summary>
Changelog
</summary>
<ul>
<li>
Since version 2.1.3, Remotion doesn't allow the CRF to be set to <code>0</code> anymore because of the issues it causes on macOS/iOS and possible other scenarios. Set the CRF to 1 or higher.
</li>
</ul>
</details>
<div style={{height: 10}}/>
<table>
<tr>
<th>
Codec
</th>
<th>
Minimum - Best quality
</th>
<th>
Maximum - Best compression
</th>
<th>
Default
</th>
</tr>
<tr>
<td>
H264
</td>
<td>
1
</td>
<td>
51</td>
<td>
18
</td>
</tr>
<tr>
<td>
H265
</td>
<td>
0
</td>
<td>
51</td>
<td>
23
</td>
</tr>
<tr>
<td>
VP8
</td>
<td>
4
</td>
<td>
63</td>
<td>
9
</td>
</tr>
<tr>
<td>
VP9
</td>
<td>
0
</td>
<td>
63</td>
<td>
28
</td>
</tr>
</table>

You can [set a CRF in the config file using the `Config.Output.setCrf()`](/docs/config#setcrf) function or use the [`--crf`](/docs/cli#flags) command line flag.

## Controlling quality using ProRes profile

_Applies only to `prores` codec_.

For ProRes, there is no CRF option, but there are profiles which you can set using the [`--prores-profile` flag](/docs/cli/render#--prores-profile) or the [`setProResProfile`](/docs/config#setproresprofile) config file option.

<table>
  <tr>
    <th>
      Value
    </th>
    <th>
      FFMPEG setting
    </th>
    <th>
      Bitrate
    </th>
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

## Use .mkv container format

You can set the codec to `h264-mkv` to use the mkv container format together with the H264 codec. If you select this option, the audio will be encoded losslessly using the WAV codec.

:::info
This preset was created for Remotion Lambda, and is optimal for when concatenating multiple video clips into one.
:::

## GIFs

You can also [render you video as a GIF](/docs/render-as-gif).

## What other settings do you need?

Which of the dozens of options that FFMPEG supports would you like to see exposed in Remotion? Let us know by opening an [issue on our issue tracker!](https://github.com/remotion-dev/remotion/issues)

## See also

- [CLI Options](/docs/cli)
- [Configuration file](/docs/config)
