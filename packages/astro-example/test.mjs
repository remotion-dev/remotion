import assert from "assert";
import { interpolate } from "remotion";
import { Player } from "@remotion/player";
import { VERSION } from "remotion/version";

const val = interpolate(1, [0, 1], [0, 100]);

assert(val === 100);
assert(Boolean(Player));
assert(typeof VERSION === "string");

console.log("ESM works!");
