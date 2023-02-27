import assert from "assert";
import { interpolate } from "remotion";
import { Player } from "@remotion/player";

const val = interpolate(1, [0, 1], [0, 100]);

assert(val === 100);
assert(Boolean(Player));

console.log("ESM works!");
