import { random } from "remotion";

export type ShowcaseLink = "tutorial" | "source_code" | "website" | "video";

export type ShowcaseVideo = {
  title: string;
  description: string;
  height: number;
  width: number;
  links: {
    url: string;
    type: ShowcaseLink;
  }[];
  submittedOn: Date;
  type: "mux_video";
  thumbnail?: string;
  muxId: string;
  author: {
    name: string;
    url: string;
  };
};

export const showcaseVideos: ShowcaseVideo[] = [
  {
    title: "Spotify Wrapped",
    type: "mux_video",
    muxId: "V5Dpfui9NmUSons5P5VQRbyX5m5011LsRA01f0129CLbHo",
    description:
      "A recreation of Spotify Wrapped where you can override all text and images programmatically.",
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
    author: {
      name: "Jonny Burger",
      url: "https://twitter.com/JNYBGR",
    },
  },
  {
    title: "AnySticker In App Assets",
    type: "mux_video",
    muxId: "HL4G1x01aX8lizSXFGuQG8do6LLKcI1mup6WjIz6OEFE",
    description:
      "This video will welcome users in the newest version of AnySticker.",
    height: 1920,
    width: 1080,
    submittedOn: new Date("25-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/anysticker-tutorials",
      },
    ],
    author: {
      name: "Jonny Burger",
      url: "https://twitter.com/JNYBGR",
    },
  },
  {
    title: "Remotion Trailer",
    type: "mux_video",
    muxId: "nJ2JnX2a02JiDvirVoNrz02lJ01q8DuvIZoKKq8q1uPdKA",
    description: "The original trailer which announced Remotion.",
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
    author: {
      name: "Jonny Burger",
      url: "https://twitter.com/JNYBGR",
    },
  },
  {
    title: "VFB Crowdfunding Campaign",
    type: "mux_video",
    muxId: "L7DYDk9o701zxfWUhcFb1Z1mGGzYoIuxddwNVI3tcemQ",
    description:
      "An animation celebrating a successful fundraising campaign. It fetches the amount raised programmatically and generates an animation suitable for posting on Instagram.",
    width: 1080,
    height: 1920,
    submittedOn: new Date("25-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/florentpergoud/vfb-crowdfunding-campain",
      },
      {
        type: "video",
        url: "https://twitter.com/FlorentPergoud/status/1371874105281159178?s=20",
      },
    ],
    author: {
      name: "Florent Pergoud",
      url: "https://twitter.com/FlorentPergoud",
    },
  },
  {
    title: "Love, Death & React",
    type: "mux_video",
    muxId: "pEo7cREHlak5FxdpNOKB8BYlUCa19Klkfn1XtXxjfxc",
    description: "A recreation of Netflix's 'Love, Death & React' intro.",
    width: 1280,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/wcandillon/love-death-react",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=YtcINOj2w5g",
      },
      {
        type: "tutorial",
        url: "https://www.youtube.com/watch?v=YtcINOj2w5g",
      },
    ],
    author: {
      name: "Willian Candillon",
      url: "https://twitter.com/wcandillon",
    },
  },
  {
    title: "Music Player",
    type: "mux_video",
    muxId: "7NZ41UEioG00jZygP02NXji01wr7HE02R8m3puh19V8IlZw",
    description:
      "A music player visualization for teasing tracks on Instagram.",
    width: 720,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "website",
        url: "https://www.instagram.com/tripmusic.online/",
      },
      {
        type: "video",
        url: "https://twitter.com/kanzitelli/status/1398296728059666432",
      },
    ],
    author: {
      name: "Batyr",
      url: "https://twitter.com/kanzitelli",
    },
  },
  {
    title: "The Quiz Universe - Film Quiz",
    type: "mux_video",
    muxId: "8ho7TdmkzCVz5cbwU9dg2bZ00sDIAFgDNt8XF01IoDGo00",
    description:
      "This film quiz presents the scenes of movies and highlights the cast and crew.",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-12-2023"),
    links: [
      {
        type: "video",
        url: "https://youtu.be/VIsThQDOEkU",
      },
      {
        type: "website",
        url: "www.TheQuizUniverse.com",
      },
    ],
    author: {
      url: "https://www.instagram.com/saint.reaux/",
      name: "Redando Ford",
    },
  },
  {
    title: "BarGPT TikToks",
    type: "mux_video",
    muxId: "5uqV22rmxwQSr02ESt9ovQSE02HhAzUdBHUm02W6Mqu3NY",
    description:
      "BarGPT, the AI cocktail generator, uses remotion to generate TikTok videos from its AI generated cocktail recipes.",
    height: 1920,
    width: 1080,
    submittedOn: new Date("09-29-2023"),
    links: [
      {
        type: "website",
        url: "https://www.bargpt.app",
      },
    ],
    author: {
      url: "https://twitter.com/BarGPT",
      name: "BarGPT.app",
    },
  },
];

const dateString = (date: Date) =>
  date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();

const todayHash = dateString(new Date());

export const shuffledShowcaseVideos =
  typeof window === "undefined"
    ? []
    : showcaseVideos.slice(0).sort((a, b) => {
        return random(a.muxId + todayHash) - random(b.muxId + todayHash);
      });
