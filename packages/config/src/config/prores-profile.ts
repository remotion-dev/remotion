import type { Codec } from "./codec";

let proResProfile: ProResProfile | undefined;

export const getProResProfile = (): ProResProfile | undefined => {
  return proResProfile;
};

export const setProResProfile = (profile: ProResProfile | undefined) => {
  proResProfile = profile;
};
