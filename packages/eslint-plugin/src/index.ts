import deterministicRandomness from "./rules/deterministic-randomness";
import evenDimensions from "./rules/even-dimensions";
import durationInFrames from "./rules/no-duration-frames-infinity";
import noFrom0 from "./rules/no-from-0";
import nomp4Import from "./rules/no-mp4-import";
import noStringAssets from "./rules/no-string-assets";
import staticFileNoRelative from "./rules/staticfile-no-relative";
import staticFileNoRemote from "./rules/staticfile-no-remote";
import useGifComponent from "./rules/use-gif-component";
import volumeCallback from "./rules/volume-callback";
import warnNativeMediaTag from "./rules/warn-native-media-tag";

const rules = {
  "no-mp4-import": nomp4Import,
  "warn-native-media-tag": warnNativeMediaTag,
  "deterministic-randomness": deterministicRandomness,
  "no-string-assets": noStringAssets,
  "even-dimensions": evenDimensions,
  "duration-in-frames": durationInFrames,
  "from-0": noFrom0,
  "volume-callback": volumeCallback,
  "use-gif-component": useGifComponent,
  "staticfile-no-relative": staticFileNoRelative,
  "staticfile-no-remote": staticFileNoRemote,
};

export = {
  rules,
  configs: {
    recommended: {
      rules: {
        "@remotion/no-mp4-import": "off",
        "@remotion/warn-native-media-tag": "error",
        "@remotion/deterministic-randomness": "error",
        "@remotion/no-string-assets": "error",
        "@remotion/even-dimensions": "error",
        "@remotion/duration-in-frames": "error",
        "@remotion/from-0": "error",
        "@remotion/volume-callback": "error",
        "@remotion/use-gif-component": "error",
        "@remotion/staticfile-no-relative": "error",
        "@remotion/staticfile-no-remote": "error",
      },
    },
  },
};
