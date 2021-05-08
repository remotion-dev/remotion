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
    muxId: "V5Dpfui9NmUSons5P5VQRbyX5m5011LsRA01f0129CLbHo",
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
    type: "mux_video",
    muxId: "HL4G1x01aX8lizSXFGuQG8do6LLKcI1mup6WjIz6OEFE",
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
    type: "mux_video",
    muxId: "nJ2JnX2a02JiDvirVoNrz02lJ01q8DuvIZoKKq8q1uPdKA",
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
