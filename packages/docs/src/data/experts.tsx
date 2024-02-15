import React from "react";

export type Expert = {
  name: string;
  image: string;
  website: string | null;
  description: React.ReactNode;
  x: React.ReactNode;
  github: React.ReactNode;
  linkedin: React.ReactNode;
  email: React.ReactNode;
  videocall: React.ReactNode;
  slug: string;
  since: number;
};

export const experts: Expert[] = [
  {
    slug: "marcus-stenbeck",
    name: "Marcus Stenbeck",
    image: "/img/freelancers/marcus.jpeg",
    x: "marcusstenbeck",
    github: "marcusstenbeck",
    linkedin: "in/mstenbeck/",
    email: "marcus.stenbeck+remotionexpert@gmail.com",
    videocall: null,
    since: new Date("2022-08-15").getTime(),
    description: (
      <div>
        <p>
          Creator of{" "}
          <a
            target={"_blank"}
            href="https://github.com/marcusstenbeck/remotion-template-audiogram"
          >
            Remotion{"'"}s Audiogram template
          </a>
          <br />I make templates, libraries and educational content at{" "}
          <a target={"_blank"} href="https://remotionkit.com">
            remotionkit.com
          </a>
          {"."}
        </p>
      </div>
    ),
    website: null,
  },
  {
    slug: "florent-pergoud",
    name: "Florent Pergoud",
    image: "/img/freelancers/florent.jpeg",
    website: "https://pergoud.com/",
    x: "florentpergoud",
    github: "florentpergoud",
    linkedin: "in/florent-pergoud/",
    email: "florentpergoud@gmail.com",
    videocall: null,
    since: new Date("2022-08-15").getTime(),
    description: (
      <div>
        I made: Hello Météo, HugoDécrypteSport, Crowdfunding VFB, Cinéma Le
        Vincennes and Piano MIDI visualizer. You can check them{" "}
        <a
          target={"_blank"}
          href="https://florentpergoud.notion.site/Florent-Pergoud-s-Remotion-showcase-b0ef4299d389401aab21bbc62516cafe"
        >
          here
        </a>
        .
      </div>
    ),
  },
  {
    slug: "stephen-sullivan",
    name: "Stephen Sullivan",
    image: "/img/freelancers/stephen.png",
    website: null,
    x: null,
    github: null,
    linkedin: "in/sterv/",
    email: "stephen@middy.com",
    videocall: null,
    since: new Date("2022-08-15").getTime(),
    description: (
      <div>
        I made:{" "}
        <a target={"_blank"} href="https://middy.com">
          middy.com
        </a>
        !
      </div>
    ),
  },
  {
    slug: "mohit-yadav",
    name: "Mohit Yadav",
    image: "/img/freelancers/mohit.jpeg",
    website: null,
    x: "Just_Moh_it",
    github: "Just-Moh-it",
    linkedin: "in/just-moh-it/",
    email: "yo@mohitya.dev",
    videocall: null,
    since: new Date("2022-08-15").getTime(),
    description: (
      <div>
        I made:{" "}
        <a target={"_blank"} href="https://mockoops.mohitya.dev">
          Mockoops
        </a>
        ! <br />
        My services: SaaS platform from scratch including SSR, creating
        individual videos and templates, and creating integrations for Remotion
        with existing infrastructure <br />
        Availability: 4 to 5 hours/day on weekdays, 5 to 6 hours/day on weekends{" "}
      </div>
    ),
  },
  {
    slug: "yehor-misiats",
    name: "Yehor Misiats",
    image: "/img/freelancers/yehor.jpeg",
    website: null,
    x: "isatelllte",
    github: "satelllte",
    linkedin: "in/satelllte/",
    email: "lunaerxs@gmail.com",
    videocall: null,
    since: new Date("2022-09-16").getTime(),

    description: (
      <div>
        I made:{" "}
        <a
          target={"_blank"}
          href="https://github.com/satelllte/remotion-audio-visualizer"
        >
          Minimalistic audio visualizations
        </a>
        {" and "}
        <a
          target={"_blank"}
          href="https://github.com/satelllte/remotion-template"
        >
          Template for crafting programmatic videos
        </a>
        .
      </div>
    ),
  },
  {
    slug: "benjamin-jameson",
    name: "Benjamin Jameson",
    image: "/img/freelancers/benjamin.jpeg",
    x: null,
    github: "BenjaminJameson",
    linkedin: null,
    email: "ben@captok.ai",
    videocall: null,
    since: new Date("2022-11-03").getTime(),
    description: (
      <div>
        Creator of{" "}
        <a target={"_blank"} href="https://www.captok.ai">
          CapTok
        </a>
        <br />I specialize in creating serverless AI web applications using AWS,
        Javascript and Python.
      </div>
    ),
    website: null,
  },
  {
    slug: "karel-nagel",
    name: "Karel Nagel",
    image: "/img/freelancers/karel.jpeg",
    website: null,
    x: null,
    github: "karelnagel",
    linkedin: "in/karelnagel/",
    since: new Date("2022-08-22").getTime(),
    email: "karel@asius.ee",
    videocall: null,
    description: (
      <div>
        I made:{" "}
        <a target={"_blank"} href="https://asius.ee/">
          TikTok automation, ENS video
        </a>{" "}
        and many more!
      </div>
    ),
  },
  {
    slug: "alex-fernandez",
    name: "Alex Fernandez",
    image: "/img/freelancers/alex.jpeg",
    website: null,
    x: null,
    github: "alexfernandez803",
    linkedin: "in/alex-f-17a5bb56/",
    email: "alex.frndz@gmail.com",
    videocall: "remotion-expert-alex-fernandez",
    since: new Date("2022-12-02").getTime(),
    description: (
      <div>
        I am an experienced integration developer using Mulesoft, a backend
        developer and on the side frontend and animation enthusiast.
      </div>
    ),
  },
  {
    slug: "matthew-mcgillivray",
    name: "Matt McGillivray",
    image: "/img/freelancers/umungo.png",
    website: "https://mattm9y.com",
    x: null,
    github: "UmungoBungo",
    linkedin: "in/matthew-mcgillivray-68295a55",
    email: "mm@mattm9y.com",
    videocall: "remotion-expert-matt-mcgillivray",
    since: new Date("2023-01-30").getTime(),
    description: (
      <div>
        <p>
          I&apos;m a full stack web dev, strongest in cloud architecture and
          front-end web development, which has been perfect for building editors
          with the Remotion player as well as rendering videos on the cloud. I
          have helped out some forward-thinking businesses in the Remotion
          community, like{" "}
          <a target={"_blank"} href="https://studio.momento.fm/">
            Momento.fm
          </a>
          {", "}
          <a target={"_blank"} href="https://viddyoze.com/">
            Viddyoze
          </a>
          {" and "}
          <a target={"_blank"} href="https://djema.ai/">
            Djema
          </a>
          {". "}
          <br />
          <br />I am also the creator of the official{" "}
          <a
            target={"_blank"}
            href="https://www.npmjs.com/package/@remotion/cloudrun"
          >
            @remotion/cloudrun package
          </a>
          , which I built in collaboration with Jonny and the team. This package
          allows users to easily render videos on Google Cloud Platform, as an
          alternative to using Lambda with AWS. I have also built my own
          products, like{" "}
          <a target={"_blank"} href="https://thatwas.pro/">
            ThatWas.Pro
          </a>
          {", "}
          <a target={"_blank"} href="https://splitscreen.video/">
            SplitScreen.Video
          </a>{" "}
          and a neat audio player for{" "}
          <a target={"_blank"} href="https://sub50k.com/">
            Sub50k
          </a>
          {". "}
          Feel free to send me an email, book some time, or shoot me a DM on
          Discord!
        </p>
      </div>
    ),
  },
  {
    slug: "ray-lotmar",
    name: "Ray Lotmar",
    image: "/img/freelancers/ray.jpeg",
    website: null,
    x: "romrif",
    github: "rayBlock",
    linkedin: "in/raymond-lotmar/",
    email: "ray@blocklab.ch",
    videocall: "remotion-expert-ray-lotmar",
    since: new Date("2023-01-30").getTime(),
    description: (
      <div>
        I made{" "}
        <a target={"_blank"} href="https://www.romrif.com/">
          Romrif
        </a>
        !<br />I build Websites & Videos with Remotion. I&apos;m alway
        interested in the latest Tech and love building stuff. Feel free to
        contact me - I&apos;m available for hire.
      </div>
    ),
  },
  {
    slug: "lorenzo-bertolini",
    name: "Lorenzo Bertolini",
    image: "/img/freelancers/lorenzo.jpeg",
    website: "https://www.lorenzobertolini.com/",
    x: "MagoDiSegrate",
    github: "encho",
    linkedin: "in/lorenzobertolini/",
    email: "ciao@lorenzobertolini.com",
    videocall: null,
    since: new Date("2023-03-14").getTime(),
    description: (
      <div>
        I made:{" "}
        <a target={"_blank"} href="https://www.dataflics.com/">
          DataFlics
        </a>{" "}
        and{" "}
        <a target={"_blank"} href="https://nerdy.finance/">
          Nerdy Finance
        </a>
        ! This is my personal website:{" "}
        <a target={"_blank"} href="https://www.lorenzobertolini.com/">
          Lorenzo Bertolini
        </a>
        <br />
        Reach out to me for data-driven video generation, data visualization,
        and web app prototyping with React.js and d3.js.
      </div>
    ),
  },
  {
    slug: "antoine-caron",
    name: "Antoine Caron",
    image: "/img/freelancers/antoine.jpeg",
    website: "https://blog.slashgear.dev/",
    x: "Slashgear_",
    github: "Slashgear",
    linkedin: "in/antoine-caron-slash/",
    email: "antoine395.caron+remotion@gmail.com",
    videocall: null,
    since: new Date("2023-03-17").getTime(),
    description: (
      <div>
        <p>
          I made:{" "}
          <a
            target={"_blank"}
            href="https://social-video-generator.vercel.app/"
          >
            Social Video Generator
          </a>
          , with Mickaël Alves
        </p>
      </div>
    ),
  },
  {
    slug: "mickael-alves",
    name: "Mickaël Alves",
    image: "/img/freelancers/mickael.jpeg",
    website: "https://cruuzazul.dev/",
    x: "CruuzAzul",
    github: "CruuzAzul",
    linkedin: "in/mickaelalves/",
    email: "alves.mckl@gmail.com",
    videocall: null,
    since: new Date("2023-03-17").getTime(),
    description: (
      <div>
        <p>
          I made:{" "}
          <a
            target={"_blank"}
            href="https://social-video-generator.vercel.app/"
          >
            Social Video Generator
          </a>
          , with Antoine Caron
        </p>
      </div>
    ),
  },
  {
    slug: "pranav-kulkarni",
    name: "Pranav Kulkarni",
    image: "/img/freelancers/pranav.jpg",
    website: "https://pranava.dev/",
    x: "thecmdrunner",
    github: "thecmdrunner",
    linkedin: "in/pranavk7/",
    email: "hey@pranava.dev",
    videocall: null,
    since: new Date("2023-07-03").getTime(),
    description: (
      <div>
        I&apos;ve built{" "}
        <a target={"_blank"} href="https://swiftube.vercel.app/">
          Swiftube
        </a>{" "}
        - an AI-based Video Making tool.
        <br />
        Looking at leveraging the power of Remotion for your projects?
        Let&apos;s join forces!
      </div>
    ),
  },
  {
    slug: "rahul-bansal",
    name: "Rahul Bansal",
    image: "/img/freelancers/rahul.png",
    website: "https://bansalrahul.com/",
    x: "BansalRahul14",
    github: "rahulbansal16",
    linkedin: "in/rahulbansalrb/",
    email: "bansalrahul14@gmail.com",
    videocall: "remotion-expert-rahul-bansal",
    since: new Date("2023-08-04").getTime(),
    description: (
      <div>
        I can help you with building products using Remotion, Firebase, Antd,
        and Typescripts. I have made{" "}
        <a target={"_blank"} href="https://app.blinkcuts.com/">
          Blinkcuts
        </a>{" "}
        an AI video editor for short talking head videos. I have worked in
        companies like Microsoft and early-stage startups like Directi. I can
        build products super fast from scratch. Looking forward to helping you.
      </div>
    ),
  },
];
