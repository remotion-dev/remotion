const assert = require("assert");
const { interpolate } = require("remotion");
const { Player } = require("@remotion/player");
const { VERSION } = require("remotion/version");
const { enableSkia } = require("@remotion/skia/enable");
const { Gif } = require("@remotion/gif");
const { CameraMotionBlur } = require("@remotion/motion-blur");
const { ThreeCanvas } = require("@remotion/three");

const val = interpolate(1, [0, 1], [0, 100]);

assert(val === 100);
assert(Boolean(Player));
assert(typeof VERSION === "string");
assert(Boolean(enableSkia));
assert(Boolean(Gif));
assert(Boolean(CameraMotionBlur));
assert(Boolean(ThreeCanvas));

console.log("CommonJS works!");
