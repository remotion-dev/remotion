import deterministicRandomness from "./rules/deterministic-randomness";
import evenDimensions from "./rules/even-dimensions";
import nomp4Import from "./rules/no-mp4-import";
import noStringAssets from "./rules/no-string-assets";
import warnNativeMediaTag from "./rules/warn-native-media-tag";
import durationInFrames from "./rules/no-duration-frames-infinity";

const rules = {
  "no-mp4-import": nomp4Import,
  "warn-native-media-tag": warnNativeMediaTag,
  "deterministic-randomness": deterministicRandomness,
  "no-string-assets": noStringAssets,
  "even-dimensions": evenDimensions,
  "duration-in-frames": durationInFrames
};

export = {
  rules,
};
