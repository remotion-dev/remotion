import React from "react";

export type ShowcaseLink = "tutorial" | "source_code" | "website" | "video";

type VideoType =
  | {
      type: "mux_video";
      muxId: string;
    }
  | {
      type: "video_url";
      videoUrl: string;
    };

export type ShowcaseVideo = {
  title: string;
  imageUrl: string;
  description: React.ReactNode;
  height: number;
  width: number;
  links: {
    url: string;
    type: ShowcaseLink;
  }[];
  submittedOn: Date;
} & VideoType;

export const showcaseVideos: ShowcaseVideo[] = [
  {
    title: "Spotify Wrapped",
    type: "mux_video",
    muxId: "U5LZfw102AUygXZIH02VOvhvCks9L00j014yIvE6qZ01vdDo",
    imageUrl: "img/showcase/1.png",
    description: (
      <>
        A recreation of Spotify Wrapped where you can override all text and
        images via command line.
      </>
    ),
    height: 1280,
    width: 720,
    submittedOn: new Date("25-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/jonnyburger/remotion-wrapped",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=I-y_5H9-3gk",
      },
    ],
  },
  {
    title: "AnySticker In App Assets",
    type: "video_url",
    videoUrl: "vid/showcase/2.mp4",
    imageUrl: "img/showcase/2.png",
    description: (
      <>This video will welcome users in the newest version of AnySticker.</>
    ),
    height: 1920,
    width: 1080,
    submittedOn: new Date("25-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/anysticker-tutorials",
      },
    ],
  },
  {
    title: "Remotion Trailer",
    type: "video_url",

    videoUrl: "vid/showcase/3.mp4",
    imageUrl: "img/showcase/3.png",
    description: <>This video Welcome you to Remotion project.</>,
    width: 1920,
    height: 1080,
    submittedOn: new Date("25-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/remotion-trailer",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=gwlDorikqgY",
      },
    ],
  },
];
