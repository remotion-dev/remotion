---
sidebar_label: "Preloading"
title: "Preloading assets"
---

By default, assets such as videos, audio, or images will only be loaded as they enter the video. You can preload those assets beforehand to make them play immediately once they enter the video.

## Example: Preloading a video

Put this outside a component (or inside an `useEffect`):

```tsx
const preload = (video: string) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = video;
  link.as = "video";

  document.head.appendChild(link);
};

preload("https://example.com/video.mp4");
```

## Preloading URLs that redirect

If your URL redirects (such as the Vimeo URL in the example), you need to resolve it to the real URL first:

```tsx
const resolveRedirect = async (video: string) => {
  const res = await fetch(video);
  return res.url;
};

const realUrl = await resolveRedirect(
  "https://player.vimeo.com/external/291648067.hd.mp4?s=94998971682c6a3267e4cbd19d16a7b6c720f345&profile_id=175&oauth2_token_id=57447761"
);

preload(realUrl)

// Make sure you use the resolved URL
<Video src={realUrl}/>
```
