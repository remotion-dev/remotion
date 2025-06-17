/**
 * Configure the social media channels that you can display in the endcard here.
 * and the links that you can show.
 */

import { staticFile } from "remotion";
import { z } from "zod";

// TODO: 1. Replace with your own channels (e.g personal and company)
export const brand = z.enum(["jonny", "remotion"]);
export type Brand = z.infer<typeof brand>;

export const platform = z.enum([
  "youtube",
  "linkedin",
  "instagram",
  "discord",
  "x",
]);

export type Platform = z.infer<typeof platform>;

type ChannelConfig = { [key in Platform]: string | null };
export type ChannelConfigAndBusinessPage = ChannelConfig & {
  isLinkedInBusinessPage: boolean;
};

export const channels: {
  [key in Brand]: ChannelConfigAndBusinessPage;
} = {
  // TODO: 2. Fill out the socials
  jonny: {
    instagram: null,
    linkedin: "Jonny Burger",
    x: "@JNYBGR",
    youtube: "/JonnyBurger",
    discord: null,
    isLinkedInBusinessPage: false,
  },
  remotion: {
    instagram: "@remotion",
    linkedin: "Remotion",
    x: "@remotion",
    youtube: "@remotion_dev",
    discord: null,
    isLinkedInBusinessPage: true,
  },
};

// TODO: 3. Add your own avatars
export const avatars: { [key in Brand]: string } = {
  jonny: "https://jonny.io/avatar.png",
  remotion: staticFile("remotion.png"),
};

export const linkType = z.object({
  link: z.string(),
});

export type LinkType = z.infer<typeof linkType>;
