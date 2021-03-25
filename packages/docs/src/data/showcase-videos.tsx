import React from "react";

export type ShowcaseVideo = {
  title: string;
  videoUrl: string;
  imageUrl: string;
  description: React.ReactNode;
  height: number;
  width: number;
};

export const showcaseVideos: ShowcaseVideo[] = [
  {
    title: "Spotify Wrapped",
    videoUrl: "vid/showcase/1.mp4",
    imageUrl: "img/showcase/1.png",
    description: (
      <>
        A recreation of Spotify Wrapped where you can override all text and
        images via command line.
      </>
    ),
    height: 1280,
    width: 720,
  },
  {
    title: "AnySticker In App Assets",
    videoUrl: "vid/showcase/2.mp4",
    imageUrl: "img/showcase/2.png",
    description: (
      <>This video will welcome users in the newest version of AnySticker.</>
    ),
    height: 1920,
    width: 1080,
  },
  {
    title: "Remotion Trailer",
    videoUrl: "vid/showcase/3.mp4",
    imageUrl: "img/showcase/3.png",
    description: <>This video Welcome you to Remotion project.</>,
    width: 1920,
    height: 1080,
  },
];
