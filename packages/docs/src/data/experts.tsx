import React from "react";

export type Expert = {
  name: string;
  image: string;
  website: string | null;
  description: React.ReactNode;
  twitter: React.ReactNode;
  github: React.ReactNode;
  linkedin: React.ReactNode;
  email: React.ReactNode;
  slug: string;
  since: number;
};

export const experts: Expert[] = [
  {
    slug: "marcus-stenbeck",
    name: "Marcus Stenbeck",
    image: "/img/freelancers/marcus.jpeg",
    twitter: "marcusstenbeck",
    github: "marcusstenbeck",
    linkedin: "in/mstenbeck/",
    email: "marcus.stenbeck+remotionexpert@gmail.com",
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
    website: null,
    twitter: "florentpergoud",
    github: "florentpergoud",
    linkedin: "in/florent-pergoud/",
    email: "florentpergoud@gmail.com",
    since: new Date("2022-08-15").getTime(),
    description: (
      <div>
        I made:{" "}
        <a
          target={"_blank"}
          href="https://florentpergoud.notion.site/Florent-Pergoud-s-Remotion-showcase-b0ef4299d389401aab21bbc62516cafe"
        >
          Hello Météo, HugoDécrypteSport, Crowdfunding VFB, Cinéma Le Vincennes
          and Piano MIDI visualizer
        </a>
        !
      </div>
    ),
  },
  {
    slug: "stephen-sullivan",
    name: "Stephen Sullivan",
    image: "/img/freelancers/stephen.png",
    website: null,
    twitter: null,
    github: null,
    linkedin: "in/sterv/",
    email: "stephen@middy.com",
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
    twitter: "Just_Moh_it",
    github: "Just-Moh-it",
    linkedin: "in/just-moh-it/",
    email: "yo@mohitya.dev",
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
    twitter: "isatelllte",
    github: "satelllte",
    linkedin: "in/satelllte/",
    email: "lunaerxs@gmail.com",
    since: new Date("2022-09-16").getTime(),

    description: (
      <div>
        I made:{" "}
        <a
          target={"_blank"}
          href="https://satelllte.notion.site/Remotion-Showcase-5783389861504a5ea2a39fc6fb16c0c8#4f76cb43a15342bda167e0e9a0553895"
        >
          Music visualization
        </a>
        !<br />
        Check out my{" "}
        <a
          target={"_blank"}
          href="https://satelllte.notion.site/Remotion-Showcase-5783389861504a5ea2a39fc6fb16c0c8"
        >
          Remotion portfolio
        </a>
        .
      </div>
    ),
  },
  {
    slug: "benjamin-jameson",
    name: "Benjamin Jameson",
    image: "/img/freelancers/benjamin.jpeg",
    twitter: null,
    github: "BenjaminJameson",
    linkedin: null,
    email: "ben@captok.ai",
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
    website: "https://asius.ee/",
    twitter: "KarelETH",
    github: "karelnagel",
    linkedin: "in/karelnagel/",
    since: new Date("2022-08-22").getTime(),
    email: "karel@asius.ee",
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
    twitter: null,
    github: "alexfernandez803",
    linkedin: "in/alex-f-17a5bb56/",
    email: "alex.frndz@gmail.com",
    since: new Date("2022-12-02").getTime(),
    description: (
      <div>
        I am an experienced integration developer using Mulesoft, a backend
        developer and on the side frontend and animation enthusiast.
      </div>
    ),
  },
];
