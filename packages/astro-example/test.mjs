import {Gif} from '@remotion/gif';
import {Trail} from '@remotion/motion-blur';
import {Player} from '@remotion/player';
import {enableSkia} from '@remotion/skia/enable';
import {ThreeCanvas} from '@remotion/three';
import {TransitionSeries} from '@remotion/transitions';
import assert from 'assert';
import {interpolate} from 'remotion';
import {VERSION} from 'remotion/version';

const val = interpolate(1, [0, 1], [0, 100]);

assert(val === 100);
assert(Boolean(Player));
assert(typeof VERSION === 'string');
assert(Boolean(enableSkia));
assert(Boolean(Gif));
assert(Boolean(ThreeCanvas));
assert(Boolean(Trail));
assert(Boolean(TransitionSeries));

console.log('ESM works!');
