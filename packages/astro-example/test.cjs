const assert = require("assert");
const { interpolate } = require("remotion");
const { Player } = require("@remotion/player");
const { VERSION } = require("remotion/version");

const val = interpolate(1, [0, 1], [0, 100]);

assert(val === 100);
assert(Boolean(Player));
assert(typeof VERSION === "string");

console.log("CommonJS works!");
