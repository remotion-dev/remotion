import React from "react";
import { BlueButton } from "../../components/layout/Button";
import { Spacer } from "../../components/layout/Spacer";
import {
  TwitterLogo,
  LinkedInLogo,
  GitHubLogo,
  EmailLogo,
} from "../components/icons";

type Expert = {
  name: string;
  image: string;
  website: string | null;
  description: React.ReactNode;
  twitter: React.ReactNode;
  github: React.ReactNode;
  linkedin: React.ReactNode;
  email: React.ReactNode;
};

export const experts: Expert[] = [
  {
    name: "Marcus Stenbeck",
    image: "/img/freelancers/marcus.jpeg",
    twitter: "marcusstenbeck",
    github: "marcusstenbeck",
    linkedin: "in/mstenbeck/",
    email: null,
    description: (
      <div>
        About me: Animation Technology Engineer specialized in customizable
        videos and templates.
        <p>
          I made:{" "}
          <a target={"_blank"} href="https://superclip.io">
            Superclip.io
          </a>
          ,{" "}
          <a target={"_blank"} href="https://lottievideo.com">
            lottietovideo.com
          </a>{" "}
          and Remotion{"'"}s{" "}
          <a
            href="https://github.com/marcusstenbeck/remotion-template-audiogram"
            target={"_blank"}
          >
            Audiogram template!
          </a>
        </p>
      </div>
    ),
    website: null,
  },
  {
    name: "Matt McGillivray",
    image: "/img/freelancers/umungo.png",
    website: null,
    twitter: "UmunugoBongo1",
    github: "UmungoBungo",
    linkedin: "in/matthew-mcgillivray-68295a55",
    email: null,
    description: (
      <div>
        <p>
          I made:{" "}
          <a target={"_blank"} href="https://thatwas.pro">
            ThatWas.pro
          </a>
          {" and "}
          <a target={"_blank"} href="https://splitscreen.video">
            splitscreen.video
          </a>
          !
        </p>
      </div>
    ),
  },
  {
    name: "Florent Pergoud",
    image: "/img/freelancers/florent.jpeg",
    website: null,
    twitter: "florentpergoud",
    github: "florentpergoud",
    linkedin: "in/florent-pergoud/",
    email: "florentpergoud@gmail.com",
    description: (
      <div>
        I made:{" "}
        <a href="https://florentpergoud.notion.site/Florent-Pergoud-s-Remotion-showcase-b0ef4299d389401aab21bbc62516cafe">
          Hello Météo, HugoDécrypteSport, Crowdfunding VFB, Cinéma Le Vincennes
          and Piano MIDI visualizer!
        </a>
      </div>
    ),
  },
  {
    name: "Stephen Sullivan",
    image: "/img/freelancers/stephen.png",
    website: null,
    twitter: null,
    github: null,
    linkedin: "in/sterv/",
    email: "stephen@middy.com",
    description: (
      <div>
        I made: <a href="https://middy.com">https://middy.com</a>!
      </div>
    ),
  },
  {
    name: "Mohit Yadav",
    image: "/img/freelancers/mohit.jpeg",
    website: null,
    twitter: "Just_Moh_it",
    github: "Just-Moh-it",
    linkedin: "in/just-moh-it/",
    email: "yo@mohitya.dev",
    description: (
      <div>
        I made: <a href="https://mockoops.mohitya.dev">Mockoops</a>! <br />
        Able to help you with: SaaS platform from scratch including SSR,
        creating individual videos and templates, and creating integrations for
        remotion with existing infrastructure. <br />
        Availability: 4 to 5 hours/day on weekdays, 5 to 6 hours/day on weekends
      </div>
    ),
  },
  {
    name: "Karel Nagel",
    image: "/img/freelancers/karel.png",
    website: "https://karel.wtf",
    twitter: "KarelETH",
    github: "karelnagel",
    linkedin: "in/karelnagel/",
    email: null,
    description: (
      <div>
        I made: <a href="https://www.tiktok.com/@elommusd">TikTok automation</a>
        , <a href="https://ensvideo.xyz/">ENS video</a>!
      </div>
    ),
  },
];
