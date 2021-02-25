import deterministicRandomness from "./rules/deterministic-randomness";
import nomp4Import from "./rules/no-mp4-import";
import noStringAssets from "./rules/no-string-assets";
import warnNativeMediaTag from "./rules/warn-native-media-tag";

const rules = {
  "no-mp4-import": nomp4Import,
  "warn-native-media-tag": warnNativeMediaTag,
  "deterministic-randomness": deterministicRandomness,
  "no-string-assets": noStringAssets,
};

export = {
  rules,
};
