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
        url:
          "https://twitter.com/FlorentPergoud/status/1371874105281159178?s=20",
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
    title: "Crypto Prices",
    type: "mux_video",
    muxId: "fAhMmqHE5fQg9V7H2CwNj4buFC6JhLDfgaMI9OBpYhw",
    description:
      "Fully automated Twitter bot summarizing movements in the crypto market.",
    width: 720,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "website",
        url: "https://twitter.com/tokenviz",
      },
      {
        type: "video",
        url: "https://twitter.com/tokenviz/status/1391798812180508674",
      },
    ],
    author: {
      name: "Tokenviz",
      url: "https://twitter.com/tokenviz",
    },
  },
  {
    title: "Piano Teacher",
    type: "mux_video",
    muxId: "uuhPSi5C01DIIxBm3HcxJGs9d8hYmDnNjkmgwTMWJQPg",
    description:
      "A MIDI-to-Remotion converter visualizing how to play a song on the piano.",
    width: 1280,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/FlorentPergoud/status/1388430389715292161",
      },
    ],
    author: {
      name: "Florent Pergoud",
      url: "https://twitter.com/FlorentPergoud",
    },
  },
  {
    title: "Vlog editor",
    type: "mux_video",
    muxId: "pSEhcZX5HBJy9SFK4j7vGs00NhPFCedqwL9X01ykNsIlo",
    description:
      "This daily vlog is automatically cut together using Remotion. Clips are recorded and uploaded to an FTP server, YouTube clips downloaded automatically.",
    width: 1280,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=CcrCz8iRpHY",
      },
      {
        type: "website",
        url: "https://www.youtube.com/channel/UCRylGayptCYAnrZfWTwuV7A",
      },
    ],
    author: {
      name: "Pierre Miniggio",
      url: "https://www.youtube.com/c/PierreMiniggio",
    },
  },
  {
    title: "Flow Fields",
    type: "mux_video",
    muxId: "st5ifZHHqs8k9m19FNqYyRdh01CM8pX302ikEzAvnikTA",
    description: "A generative SVG animation using noise.",
    width: 720,
    height: 720,
    submittedOn: new Date("29-05-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/noWukkas_/status/1386174689660203011",
      },
      {
        type: "source_code",
        url: "https://codesandbox.io/s/flow-fields-evqg3",
      },
    ],
    author: {
      name: "No Wukkas",
      url: "https://twitter.com/noWukkas_",
    },
  },
  {
    title: "CSS+SVG effects",
    type: "mux_video",
    muxId: "ujzfb6501KAiNDwKDzLIzCvcWxECz01rfSXh500I3mmifo",
    description: "A generative CSS + SVG animation.",
    width: 500,
    height: 500,
    submittedOn: new Date("27-06-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/calebwright/status/1406412814512803841",
      },
      {
        type: "source_code",
        url:
          "https://github.com/c0/remotion-playground/blob/main/src/GooBallCSS.jsx",
      },
    ],
    author: {
      name: "calebwright",
      url: "https://twitter.com/calebwright",
    },
  },
  {
    title: "Personalized Welcome Videos",
    type: "mux_video",
    muxId: "BPP7jS72gdEtARObTEGOc5GHnDv6ODfp48hIFMU9U6E",
    description:
      "A SlackHQ integrated tool to generate personalized welcome videos for new employees.",
    width: 1920,
    height: 1080,
    submittedOn: new Date("27-06-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/BhimteBhaisaab/status/1401195261943115777",
      },
    ],
    author: {
      name: "Utkarsh Bhimte",
      url: "https://twitter.com/BhimteBhaisaab",
    },
  },
  {
    title: "All Champions League Winners in History",
    type: "mux_video",
    muxId: "R9SZTw2ZoWuV44i5QVx5yVu01VaGm89JlZ876TdVXAyQ",
    description:
      "This video shows all the UEFA Champions Cup (1956-1992) and Champions League (since 1993) Winners year by year and concludes with the ranking of the countries with the most trophies.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("07-03-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=6Xn47wG_c5Q",
      },
      {
        type: "website",
        url:
          "https://www.youtube.com/channel/UCRBZkDc7udWuxrvedrFUbCQ/featured",
      },
    ],
    author: {
      url: "https://twitter.com/mikepombal",
      name: "mikepombal",
    },
  },
  {
    title: "Code Highlighter",
    type: "mux_video",
    muxId: "1W02pMAx5ZdtRE2PajqW7Ni01qbxADjpe37o4Non9Sonc",
    description:
      "This video animates code and highlights interesting parts of it.",
    height: 720,
    width: 1280,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/matfrana/status/1372336451246034948",
      },
      {
        type: "website",
        url: "https://reactbricks.com/",
      },
    ],
    author: {
      url: "https://twitter.com/matfrana",
      name: "Matteo Frana",
    },
  },
  {
    title: "Redesigning the Scatterplot",
    type: "mux_video",
    muxId: "mnQCnHc56wrafN4DIPkIdYpFh7Yk202rbMOzxrZaUylE",
    description:
      "In this video you get a visual display of some quantitative information.",
    height: 720,
    width: 1280,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/BrooksLybrand/status/1371547875109445635",
      },
    ],
    author: {
      url: "https://twitter.com/BrooksLybrand",
      name: "Brooks Lybrand",
    },
  },
  {
    title: "Twitter year in review",
    type: "mux_video",
    muxId: "iRnXEBXAvxCQAtu01TVEJsizIfXaPpxlyqeJfm54K1Vs",
    description:
      "This videos shows the user various metrics of their Twitter account.",
    height: 720,
    width: 720,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/vjo/status/1367901005027942403",
      },
      {
        type: "website",
        url: "https://twitter.com",
      },
    ],
    author: {
      url: "https://twitter.com/TwitterEng",
      name: "Twitter Engineering",
    },
  },
  {
    title: "Data Science Product Ad",
    type: "mux_video",
    muxId: "MqUUJjKZk01x9KGUJtSD1SLoUHmrab3eaVx9sDPCw9L00",
    description:
      "This is a promo video of an data science course offered by Quantargo.",
    height: 720,
    width: 1280,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/quantargo/status/1365233907793338369",
      },
      {
        type: "website",
        url:
          "https://www.quantargo.com/blog/2021-02-26-new-course-advanced-data-transformation/",
      },
    ],
    author: {
      url: "https://www.quantargo.com/",
      name: "Quantargo",
    },
  },
  {
    title: "Animated Social Media Preview Card",
    type: "mux_video",
    muxId: "zSKsGBzfoPowlFVBm47N01aoMK2Er8qkM3CzZgnUDido",
    description:
      "Here you see a promo video of Sam Larsen-Disney's newsletter.",
    height: 628,
    width: 1200,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/SamLarsenDisney/status/1362029962241466372",
      },
      {
        type: "website",
        url: "https://sld.codes/newsletter",
      },
      {
        type: "tutorial",
        url: "https://sld.codes/articles/Remotion-&-Open-Graph-Video",
      },
    ],
    author: {
      url: "https://sld.codes/",
      name: "Sam Larsen-Disney",
    },
  },
  {
    title: "Snappy Format File Animation",
    type: "mux_video",
    muxId: "WopGJTJ4UfzD5zu9yXl4aEZ3ASufllximGBL9AjsjDQ",
    description:
      "In this visual you get to see an animation of various file formats.",
    height: 500,
    width: 500,
    submittedOn: new Date("07-07-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/zackdotcomputer/status/1360682974224744452",
      },
      {
        type: "website",
        url: "https://www.phototamer.app/",
      },
    ],
    author: {
      url: "https://zack.computer/",
      name: "Zack Sheppard",
    },
  },
  {
    title: "Conference talk",
    type: "mux_video",
    muxId: "01DRoSacYBQvVpDzoAXl01Wt2r8JWtgTq4t5lFwPjVcDE",
    description:
      "A conference talk production composed in Remotion, including code animations, facecam, subtitles and a browser as an iFrame.",
    height: 270,
    width: 480,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/pomber/record-talk-with-remotion/",
      },
      {
        type: "video",
        url: "https://twitter.com/pomber/status/1359556846688886789",
      },
      {
        type: "tutorial",
        url: "https://twitter.com/pomber/status/1358837764033241092",
      },
    ],
    author: {
      url: "https://pomb.us/",
      name: "Rodrigo Pombo",
    },
  },
  {
    title: "Cloudfront Explainer",
    type: "mux_video",
    muxId: "BrKshHsFgC8DNhQPJGeu4fVjjWlzxHFLvMTcPB6EB6E",
    description: "The intro for an online course about Cloudfront.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "video",
        url:
          "https://www.udemy.com/course/the-cloud-architects-guide-to-cloudfront/",
      },
      {
        type: "website",
        url:
          "https://www.udemy.com/course/the-cloud-architects-guide-to-cloudfront/",
      },
    ],
    author: {
      name: "Tamàs Sallai",
      url: "https://advancedweb.hu/",
    },
  },
  {
    title: "Apple Spring Loaded Logo",
    type: "mux_video",
    muxId: "wvFXhgp3WA8bvp025y74gkoX56TKTyX7Xx9Qvos1TStc",
    description:
      "A recreation of Apple's Spring Loaded Logo for their Spring 2021 Keynote. Uses Remotions interpolateColors() API.",
    height: 700,
    width: 700,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/jonnyburger/spring-loaded",
      },
      {
        type: "video",
        url: "https://twitter.com/JNYBGR/status/1384606085173108737",
      },
    ],
    author: {
      url: "https://jonny.io",
      name: "Jonny Burger",
    },
  },
  {
    title: "The math behind animations",
    type: "mux_video",
    muxId: "IDMyruXHia3rmOllIi13uy01hHgN4UxkAZT4BcgwiN00E",
    description:
      "In this masterpiece, William Candillon explains the fundamentals of how trigonometry is used for user interfaces. Full video available on YouTube.",
    height: 360,
    width: 640,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=-lF7sSTelOg&t=8s&pp=sAQA",
      },
      {
        type: "website",
        url: "https://start-react-native.dev/",
      },
    ],
    author: {
      url: "https://twitter.com/wcandillon",
      name: "William Candillon",
    },
  },
  {
    title: "Liquid Swipe Tutorial Intro",
    type: "mux_video",
    muxId: "kNJDX8EkZzclZa01SBTCtRbma2fqgPzIJKczHntB01m84",
    description:
      "This intro warms you up for an awesome React Native tutorial on how to recreate a Liquid Swipe animation.",
    height: 360,
    width: 640,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=6jxy5wfNpk0",
      },
      {
        type: "website",
        url: "https://start-react-native.dev/",
      },
    ],
    author: {
      url: "https://twitter.com/wcandillon",
      name: "William Candillon",
    },
  },
  {
    title: "Transfer Fee Record Specific to British Football",
    type: "mux_video",
    muxId: "sBbBlET802IE1C3bHCkNhDB00rpWPXRpIrkUP9YTqruXM",
    description:
      "An infographic showing the progression of the transfer fee record specific to British Football",
    height: 1152,
    width: 2048,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=hMsi04DkoMI&feature=youtu.be",
      },
      {
        type: "website",
        url: "https://twitter.com/mikepombal/status/1422219571206008835",
      },
    ],
    author: {
      url: "https://twitter.com/mikepombal",
      name: "Mickael Marques",
    },
  },
  {
    title: "Stargazer",
    type: "mux_video",
    muxId: "FaeI2kV02tWW8DyOLm301gNYATgbqvq8LHHo8mHdtfID4",
    description:
      "Your repo reached a stars milestone? Celebrate with a video of your stargazers!",
    height: 540,
    width: 960,
    submittedOn: new Date("08-03-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/pomber/stargazer",
      },
      {
        type: "video",
        url: "https://twitter.com/pomber/status/1412039274963275779",
      },
    ],
    author: {
      url: "https://twitter.com/pomber",
      name: "Rodrigo Pombo",
    },
  },
  {
    title: "Confirmed Coronavirus Cases In the WORLD time-lapse",
    type: "mux_video",
    muxId: "Anx7p2jNQLUsSWBOjnEzdo9xvfC9spsVyL01sk7esrtY",
    description: "Time-lapse of the spread of the corona virus in the WORLD.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("08-04-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=Mrl229Zf23g",
      },
    ],
    author: {
      url: "https://www.youtube.com/channel/UCEyTSyN3FmW39THCl0kfDUA",
      name: "Envision",
    },
  },
  {
    title: "Remotion 2.0 trailer",
    type: "mux_video",
    muxId: "g00CHkGQm1J0101dma3TBPvwufeAKZ8yOZk9p0048soVjW00",
    description: "Trailer for Remotion 2.0 launch",
    height: 1080,
    width: 1920,
    submittedOn: new Date("08-04-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/remotion-2-0-trailer",
      },
      {
        type: "video",
        url: "https://youtube.com/watch?v=0r6ho5sNPm4",
      },
      {
        type: "website",
        url: "https://www.remotion.dev/",
      },
    ],
    author: {
      url: "https://twitter.com/JNYBGR",
      name: "Jonny Burger",
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
