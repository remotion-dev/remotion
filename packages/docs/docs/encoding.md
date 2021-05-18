---
id: encoding
title: Encoding Guide
---

Backed by [FFMPEG](https://ffmpeg.org/), Remotion allows you to configure a variety of encoding settings. The goal of this page is to help you navigate through the settings and to help you choose the right one.

## Choosing a codec

Remotion supports 4 codecs: `h264` (_default_), `h265`, `vp8` and `vp9`. The first two produce an output that will be an MP4, the last two are for generating WebM videos. While H264 will work well in most cases, sometimes it's worth going for a different codec. Refer to the table below to see the advantages and drawbacks of each codec.

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
    <td>.mp4</td>
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
</table>

:::info
Click on a browser compatibility link to see exactly which browsers are supported on caniuse.com.
:::

You can set a config using [`Config.Output.setCodec()` in the config file](/docs/config#setcodec) or the [`--codec`](/docs/cli) CLI flag.

## Controlling quality using the CRF setting

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

You can [set a CRF in the config file using the `Config.Output.setCrf()`](config#setcrf) function or use the [`--crf`](/docs/cli#flags) command line flag.

## Audio-only export

You can pass `mp3`, `wav` or `aac` as a codec. If you do it, an audio file will be output in the corresponding format. Quality settings will be ignored.

## What other settings do you need?

Which of the dozens of options that FFMPEG supports would you like to see exposed in Remotion? Let us know by opening an [issue on our issue tracker!](https://github.com/JonnyBurger/remotion/issues)

## See also

- [CLI Options](/docs/cli)
- [Configuration file](/docs/config)
