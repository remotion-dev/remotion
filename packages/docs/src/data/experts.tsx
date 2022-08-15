import React from "react";

type Expert = {
  name: string;
  image: string;
  website: string | null;
  description: React.ReactNode;
  twitter: React.ReactNode;
};

export const experts: Expert[] = [
  {
    name: "Marcus Stenbeck",
    image: "/img/freelancers/marcus.jpeg",
    twitter: "marcusstenbeck",
    description: (
      <div>
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
    name: "UmungoBongo",
    image: "/img/freelancers/umungo.png",
    website: null,
    twitter: "UmunugoBongo1",
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
    name: "Middy",
    image: "/img/freelancers/default.png",
    website: null,
    twitter: null,
    description: (
      <div>
        I made: <a href="https://middy.com">https://middy.com</a>!
      </div>
    ),
  },
  {
    name: "Mohit",
    image: "/img/freelancers/mohit.jpeg",
    website: null,
    twitter: "Just_Moh_it",
    description: (
      <div>
        I made: <a href="https://mockoops.mohitya.dev">Mockoops</a>!
      </div>
    ),
  },
  {
    name: "karel",
    image: "/img/freelancers/karel.png",
    website: "https://karel.wtf",
    twitter: "KarelETH",
    description: (
      <div>
        I made: <a href="https://www.tiktok.com/@elommusd">TikTok automation</a>
        , <a href="https://ensvideo.xyz/">ENS video</a>!
      </div>
    ),
  },
];
