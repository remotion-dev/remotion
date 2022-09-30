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
        url: "https://github.com/c0/remotion-playground/blob/main/src/GooBallCSS.jsx",
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
        url: "https://www.youtube.com/channel/UCRBZkDc7udWuxrvedrFUbCQ/featured",
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
    title: "Data Science Course Ad",
    type: "mux_video",
    muxId: "MqUUJjKZk01x9KGUJtSD1SLoUHmrab3eaVx9sDPCw9L00",
    description:
      "This is a promo video of a data science course offered by Quantargo.",
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
        url: "https://www.quantargo.com/blog/2021-02-26-new-course-advanced-data-transformation/",
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
    title: "Product Announcement Video",
    type: "mux_video",
    muxId: "lSa6eYA01jP5ooFSgTE02P6nfRbjIbF1kcr5LdwS01Zp8o",
    description:
      "Animation showing new features on the newly built website of Verdaccio, a lightweight private Node.js proxy regisry.",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-04-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/verdaccio_npm/status/1420187249145118722",
      },
      {
        type: "website",
        url: "https://verdaccio.org/",
      },
    ],
    author: {
      url: "https://twitter.com/_semoal",
      name: "Sergio Moreno",
    },
  },
  {
    title: "1000 Stars for Code Hike",
    type: "mux_video",
    muxId: "x7Dzaunb9JbdwyaR00CwBnIC2MkUPzJwmSiUrtNiYYP4",
    description:
      "A celebration video by Code Hike for reaching 1000 stars on GitHub.",
    height: 540,
    width: 960,
    submittedOn: new Date("08-04-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/codehike_/status/1410976982867775489",
      },
      {
        type: "website",
        url: "https://codehike.org/",
      },
      {
        type: "source_code",
        url: "https://github.com/pomber/stargazer",
      },
    ],
    author: {
      url: "https://codehike.org/",
      name: "Code Hike",
    },
  },
  {
    title: "Instagram Profile as a Story",
    type: "mux_video",
    muxId: "6hyS0000BS02M4MPbZJxBuUG9SnJJCxCglHrTuWRdbpvOY",
    description:
      "A profile video generator which allows you to share your Instagram profile as a story.",
    height: 1280,
    width: 720,
    submittedOn: new Date("08-04-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/FlorentPergoud/status/1375134968733704217",
      },
    ],
    author: {
      url: "https://twitter.com/FlorentPergoud",
      name: "Florent Pergoud",
    },
  },
  {
    title: "Code Stack - A Fully Automated News Podcast",
    type: "mux_video",
    muxId: "w02JWs4nf5GXSQjhHzIF00Ws6e1L1pz5PaZ02AgnE02K6dI",
    description:
      "Get a daily briefing with CodeStack's fully automated news podcast that reads news using text-to-speech.",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/FelippeChemello/podcast-maker",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=3VSh3uCVtOE",
      },
      {
        type: "website",
        url: "https://anchor.fm/codestack",
      },
    ],
    author: {
      url: "https://twitter.com/CodeStackMe",
      name: "Felippe Chemello",
    },
  },
  {
    title: "Weather Report",
    type: "mux_video",
    muxId: "dE02NVflg500LNpSECSUmcwLFpKU100Z9TY362Lifdo0228",
    description:
      "A fully automated weather forecast that appears in your TikTok or Instagram feed.",
    height: 1280,
    width: 720,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/florentpergoud/remotion-weather",
      },
      {
        type: "video",
        url: "https://twitter.com/JNYBGR/status/1398234353721917440",
      },
      {
        type: "website",
        url: "https://www.instagram.com/hellometeo/",
      },
    ],
    author: {
      url: "https://twitter.com/FlorentPergoud",
      name: "Florent Pergoud",
    },
  },
  {
    title: "Name The Movie - Quiz",
    type: "mux_video",
    muxId: "FFft61dbntN4DEnt00HiXCmfiJhNLnOaI02dT2D802oPIY",
    description:
      "A quiz game that gives you quotes from classic films to guess their title.",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=kSqbAdwk5Bc",
      },
      {
        type: "website",
        url: "https://www.youtube.com/channel/UCfwUNx_fEW98olmpByg-V7w",
      },
    ],
    author: {
      url: "https://www.youtube.com/channel/UCfwUNx_fEW98olmpByg-V7w",
      name: "Collou",
    },
  },
  {
    title: "Podopi - Convert a Blog to Podcast",
    type: "mux_video",
    muxId: "wvTZmoaRnhpGuc93nd39vz4MpSeOkXjnS5XFzOK01Lco",
    description:
      "This promo video is done by using Remotion. It shows you how easily you can extend your blog to a podcast.",
    height: 720,
    width: 1280,
    submittedOn: new Date("09-10-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=yYbBVCo0BVw",
      },
      {
        type: "website",
        url: "https://www.podopi.com/",
      },
    ],
    author: {
      url: "https://twitter.com/Miickel",
      name: "Mickel Andersson",
    },
  },
  {
    title: "Cricket Match Feature",
    type: "mux_video",
    muxId: "zDEoYi6tII8cA017JrZpqyx1hf2ErMaPUklUSSkdkhKk",
    description:
      "An animation showing the two teams competing in todays cricket match.",
    height: 1280,
    width: 720,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "video",
        url: "https://discord.com/channels/809501355504959528/817306292590215181/820365999697952790",
      },
    ],
    author: {
      url: "https://discord.com/channels/809501355504959528/817306292590215181/820365999697952790",
      name: "Suthar",
    },
  },
  {
    title: "Flashy Title Card",
    type: "mux_video",
    muxId: "J8H3dOuyC01ZurH9NnSvd17oS00FUPKns8HnTO02KyCF02k",
    description: "A nice title design in William Candillons video.",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/wcandillon/status/1415263264737476608",
      },
      {
        type: "website",
        url: "https://www.youtube.com/wcandillon",
      },
    ],
    author: {
      url: "https://twitter.com/wcandillon",
      name: "William Candillon",
    },
  },
  {
    title: "Remotion Web Summit Talk",
    type: "mux_video",
    muxId: "fWKVFtHn4bIEcPlqhsHcf69t0100SkUE6WXB600NcENQww",
    description:
      "A talk about Remotion given at React Summit 2021, fully written in React",
    height: 720,
    width: 1280,
    submittedOn: new Date("08-05-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/react-summit-talk",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=316oZDqOyEg",
      },
    ],
    author: {
      url: "https://twitter.com/jnybgr",
      name: "Jonny Burger",
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
        url: "https://www.udemy.com/course/the-cloud-architects-guide-to-cloudfront/",
      },
      {
        type: "website",
        url: "https://www.udemy.com/course/the-cloud-architects-guide-to-cloudfront/",
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
      "William Candillon explains the fundamentals of how trigonometry is used for user interfaces. Full video available on YouTube.",
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
    muxId: "01h4QMewhXr0249p1k8buxKgcN86hmS3VgRDPenY6Yyr4",
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
      "An infographic showing the progression of the transfer fee record in British Football",
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
    title: "Coronavirus Cases Visualization",
    type: "mux_video",
    muxId: "Anx7p2jNQLUsSWBOjnEzdo9xvfC9spsVyL01sk7esrtY",
    description: "Timelapse of the spread of the coronavirus in the world.",
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
  {
    title: "EcoEats",
    type: "mux_video",
    muxId: "XJpfsCytTHSoAyVwfObPVXbNN64Thj2Z8pLvoqO1Ocs",
    description:
      "A promo video for a zero emission takeaway and grocery delivery service.",
    height: 1080,
    width: 1080,
    submittedOn: new Date("08-28-2021"),
    links: [
      {
        type: "video",
        url: "https://cdn.ecoeats.uk/videos/merchant-features/06c07944-6d13-4188-8356-d42d744ba54e/raw-pressed-market-street.mp4",
      },
    ],
    author: {
      url: "https://ecoeats.uk/",
      name: "EcoEats",
    },
  },
  {
    title: "Lotus App",
    type: "mux_video",
    muxId: "LAtfpU01MnxJc200ccLrLVPanKx7wSv1NNT42027Ptq4VI",
    description:
      "An animated Lotus icon in the Dock on Mac. With Lotus you can manage your GitHub notifications without stress.",
    height: 230,
    width: 378,
    submittedOn: new Date("08-12-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/vadimdemedes/status/1425178353737293829",
      },
      {
        type: "website",
        url: "https://getlotus.app/",
      },
    ],
    author: {
      url: "Vadim Demedes",
      name: "https://vadimdemedes.com/",
    },
  },
  {
    title: "Olympics Ranking",
    type: "mux_video",
    muxId: "uggP01wfSNgmwm9KjanfeKvbQdbeVdDK0001qdBfDszCB4",
    description:
      "A medal ranking which shows which country has won the most medals at the Tokyo Olympics so far.",
    height: 1280,
    width: 720,
    submittedOn: new Date("08-12-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/FlorentPergoud/status/1423360349877809154",
      },
    ],
    author: {
      url: "https://twitter.com/FlorentPergoud",
      name: "Florent Pergoud",
    },
  },
  {
    title: "The Song of the Fae - Animated Banner",
    type: "mux_video",
    muxId: "cEmxepEENf6004NhdttN7igT3O8o82ODq02dn01PMgS101I",
    description:
      "An animated banner as an intro sequences for a game called The Song of the Fae.",
    height: 720,
    width: 720,
    submittedOn: new Date("08-12-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/vivavolt/status/1408670642451345410",
      },
    ],
    author: {
      url: "https://bf.wtf/",
      name: "Ben Follington",
    },
  },
  {
    title: "Feature overview",
    type: "mux_video",
    muxId: "d2SvbrhHvyJZb2EmSv441M601UBy1dfEYfToKGqDpV01Y",
    description: "A showcase of features in the new Bottom Sheet library.",
    height: 640,
    width: 1280,
    submittedOn: new Date("10-04-2021"),
    links: [
      {
        type: "video",
        url: "https://twitter.com/Gorhom/status/1432363415272558593",
      },
      {
        type: "website",
        url: "https://gorhom.github.io/react-native-bottom-sheet/blog/bottom-sheet-v4/",
      },
    ],
    author: {
      url: "https://gorhom.dev/",
      name: "Mo Gorhom",
    },
  },
  {
    title: "AnySticker Announcement",
    type: "mux_video",
    muxId: "GhK5YXKrtWTa2kEf7HajaE6DG2FtTNsZfW7mfIzQBJ00",
    description:
      "A hyped up announcement trailer for the new AnySticker app, made using React Three Fiber.",
    height: 1080,
    width: 1080,
    submittedOn: new Date("11-15-2021"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/JonnyBurger/anysticker-tutorials/blob/main/src/Announcement/index.tsx",
      },
      {
        type: "video",
        url: "https://twitter.com/JNYBGR/status/1458375456965763075",
      },
      {
        type: "website",
        url: "https://anysticker.com",
      },
    ],
    author: {
      url: "https://twitter.com/JNYBGR",
      name: "JNYBGR",
    },
  },
  {
    title: "Outro Cards",
    type: "mux_video",
    muxId: "Rzmd76Rry7hQAAvTREyaLLT4wSAuc9zouk3ZxOmybq4",
    description:
      "Animated playing cards. Used as a background for an outro thanking subscribers for their support.",
    height: 1080,
    width: 1920,
    submittedOn: new Date("11-24-2021"),
    links: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=xPbRsca_l7c",
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
    title: 'Mux stats tutorial',
    type: 'mux_video',
    muxId: 'DDgXb2KfPk7xdvxEoyPkrl7GcybohNon',
    description:
      'An article on how to showcase your video stats by creating a dynamic animated video using Remotion and the Mux Data API.',
    height: 270,
    width: 480,
    submittedOn: new Date('19-01-2022'),
    links: [
      {
        type: 'source_code',
        url: 'https://github.com/davekiss/mux-remotion-demo/',
      },
      {
        type: 'video',
        url: 'https://twitter.com/MuxHQ/status/1483514610380644357',
      },
      {
        type: 'tutorial',
        url: 'https://mux.com/blog/visualize-mux-data-with-remotion/',
      },
    ],
    author: {
      url: 'https://davekiss.com/',
      name: 'Dave Kiss',
    },
  },
  {
    title: "Audio Player",
    type: "mux_video",
    muxId: "eKnHTDXWCBsQgm00vOl59ZVF300otry3STKzFe025O7M5E",
    description: "A Reusable audio player template created using Remotion.",
    height: 1920,
    width: 1080,
    submittedOn: new Date("03-29-2022"),
    links: [
      {
        type: 'source_code',
        url: 'https://github.com/varunpbardwaj/remotion-audio-player-template/',
      },
      {
        type: "video",
	url: "https://portfolio-varunpbardwaj.vercel.app/remotion/neenaadena/",
      },
    ],
    author: {
      "url": "https://portfolio-varunpbardwaj.vercel.app",
      "name": "Varun Bardwaj"
    }
},
{
    title: "Product Hunt Today",
    type: "mux_video",
    muxId: "9vegqVB2n02YrTL3c38HoOyd7Smytz01Hl3qaXI5KCOZM",
    description: "Fully automated Twitter bot that tweets trending Product Hunt products every day.",
    height: 720,
    width: 720,
    submittedOn: new Date("03-27-2022"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/Kamigami55/product-hunt-today",
      },
      {
        type: "video",
        url: "https://twitter.com/ProductHunToday/status/1507997707008417792",
      },
      {
        type: "website",
        url: "https://twitter.com/ProductHunToday",
      },
    ],
    author: {
      "url": "https://easonchang.com/",
      "name": "Eason Chang"
    }
  },
  {
	title: "Old french TV trailer (tribute)",
	type: "mux_video",
	muxId: "7tmF019NZLRuazoq5I7WFdacYz8bjJb4BTDEQ5cEkFe4",
	description: "Video tribute to an old TV jingle called \"La trilogie du samedi\" broadcasted in the early 2000s in France on the channel M6.",
	height: 1080,
	width: 1920,
	submittedOn: new Date("04-01-2022"),
	links: [],
	author: {
		"url": "https://twitter.com/Slashgear_",
		"name": "Antoine Caron & Mickaël Alves"
	}
  },
  {
    title: 'snappify ProductHunt GIF',
    type: 'mux_video',
    muxId: 'vOGnXmkV01R2WW6SuZRIykksh3uzEfRV900ieznAmc7Is',
    description:
      'An animated Logo used for the ProductHunt launch of snappify.',
    height: 960,
    width: 960,
    submittedOn: new Date("05-04-2022"),
    links: [
      {
        type: 'source_code',
        url: 'https://github.com/snappify-io/producthunt-gif',
      },
      {
        type: 'website',
        url: 'https://snappify.io/',
      },
      {
        type: 'tutorial',
        url: 'https://snappify.io/blog/create-producthunt-gif-with-remotion',
      },
    ],
    author: {
      url: 'https://twitter.com/dominiksumer',
      name: 'Dominik Sumer',
    },
  },
  {
    title: "Master Duel Week",
    type: "mux_video",
    muxId: "nFm3f8VfvL6ag20093gMUtWfbAJe5F6s4z5LapxrpLcM",
    description: "Automated Twitter bot that tweets a trading card game's meta deck weekly",
    height: 720,
    width: 720,
    submittedOn: new Date("05-08-2022"),
    links: [
      {
        type: "source_code",
        url: "https://github.com/KalleChen/master-duel-week",
      },
      {
        type: "video",
        url: "https://twitter.com/masterduelweek/status/1522850783020339200",
      },
      {
        type: "website",
        url: "https://twitter.com/masterduelweek",
      },
    ],
    author: {
      "url": "https://kallechen.github.io/",
      "name": "Kalle Chen"
    }
  },
  {
    title: "Video Ad",
    type: "mux_video",
    muxId: "kfl1VFbNcRFntVKhdkvTB6mBmcivDv82UX64Na4TMGw",
    description: "A simple video ad",
    height: 1920,
    width: 1080,
    submittedOn: new Date("07-18-2022"),
    links: [],
    author: {
      "url": "https://www.linkedin.com/in/sepehrsafari/",
      "name": "Sepehr Safari"
    }
  },
	{
	title: "Top 15 smallest animals in this planet",
	type: "mux_video",
	muxId: "bQ5bHzbVsYngW5GF4iQxH601HyPnxHZCcXZas1zzQRAU",
	description: "A simple Top List Video",
	height: 1080,
	width: 1920,
	submittedOn: new Date("08-12-2022"),
	links: [
		{
			type: "video",
			url: "https://youtu.be/jDAwyWWWfkM",
		},
		{
			type: "website",
			url: "https://adavii.com/",
		},
	],
	author: {
		"url": "https://twitter.com/yuwan_kumar",
		"name": "Yuwan Kumar"
	}
},
    {
	title: "Blast Workout video trailer",
	type: "mux_video",
	muxId: "txrjnbtkqe1P701kHusZ4EeIY883aHVvVGF8xsAKKX24",
	description: "Blast Workout video trailer as it is displayed on the play store",
	height: 1080,
	width: 1920,
	submittedOn: new Date("09-30-2022"),
	links: [
		{
			type: "website",
			url: "https://blastworkout.app",
		},
	],
	author: {
		"url": "https://blastworkout.app",
		"name": "Mad Mustache Company>"
	}
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
