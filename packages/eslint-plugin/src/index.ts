import nomp4Import from "./rules/no-mp4-import";
import warnNativeMediaTag from "./rules/warn-native-media-tag";

const rules = {
  "no-mp4-import": nomp4Import,
  "warn-native-image-tag": warnNativeMediaTag,
};

export = {
  rules,
};
