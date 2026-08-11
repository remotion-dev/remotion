---
slug: makestories
title: How MakeStories uses Remotion to render Web Stories
image: /img/makestories.png
---

import {NewMuxVideo} from '../src/components/MuxVideo';

:::note
This is the first article in our new series: Success Stories. We interview companies and creators that we find inspiring and which have successfully implemented Remotion in their stack. Let us know what you think!
:::

MakeStories is in the business of [Web Stories](https://stories.google/) - a format by Google to bring stories to the web. Appearing directly in Google Search, they are an opportunity for publishers to increase their audience massively.

<NewMuxVideo muxId="eB9pPF17zyOrmEas4kwsa3OvTeQV3cDlLQ5U01CHrfcg" style={{
  width: '100%'
}} controls poster="/img/makestories.png"/>

<p align="center"><em style={{fontSize: "0.9em"}}>MakeStories founder Pratik Ghela explains how they built a Remotion rendering service to export Web Stories to MP4s.</em></p>

These stories are powered using web technology, meaning they are built using HTML and CSS. One of the most popular tools for publishers to quickly create Web Stories is [MakeStories.io](https://makestories.io/). We are talking to founder Pratik Ghela
about how they are using Remotion to allow publishers to export their videos as real MP4 videos.

**Hi Pratik! Pitch us MakeStories really quick.**

MakeStories is a web based tool where you can create stories for websites. For context: Google has a product called Web Stories. These stories are on the web and not the same stories as you know from social media where you just can take pictures and upload them to your storyline. These Web Stories need to be written in HTML and CSS which is the tough part. What we did is we built a tool called MakeStories which has a drag, drop & click approach. What you can do essentially is using our simplified approach to create animations. By using MakeStories to create your own web stories you get the necessary HTML and CSS code of your story. This is used to put your story for example on Google Discover or on your own website.

**How are you using Remotion for MakeStories?**

We started to build a Web Story builder for social media. For that reason we were looking for a rendering engine and that was when we came across Remotion. Now a Web Story created on MakeStories is compatible with any platform - Google as well as social media.

![Screenshot of MakeStories' export feature](/img/makestories-export.png)

<p align="center"><em>MakeStories customers get two options to export their stories - either in AMP format to publish on Google or as MP4 to post to social media.</em></p>

**Why did you decide to implement the feature in Remotion?**

A big challenge we had before was the rendering time. We used to work with another service but it was not a scalable solution. Even though a story has up to ten slides, the rendering process is smooth and done within one minute, which is a huge improvement for us.

Considering this is a better product than we used before, everything was perfect for us. With Remotion we were able to minimize the rendering time which was a big challenge for us prior to the implementation.

**Were there any difficulties when integrating Remotion?**

The integration of Remotion was straightforward. The documentation on the website was good and gave us guidance throughout the whole process.
Another good thing for us was that Remotion uses TypeScript since we already used it before we were already familiar with it. This made many things easier for us. And even some minor quality issues we had before are gone now.
_Editors note: MakeStories consulted with Remotion on how to optimize render time and quality for their stories._

---

_Were you successful using Remotion? Let us know your story at hi@remotion.dev!_
