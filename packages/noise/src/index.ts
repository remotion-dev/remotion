import type {RandomSeed} from 'remotion';
import {random} from 'remotion';
import type {
	NoiseFunction2D,
	NoiseFunction3D,
	NoiseFunction4D,
} from 'simplex-noise';
import {
	createNoise2D as _createNoise2D,
	createNoise3D as _createNoise3D,
	createNoise4D as _createNoise4D,
} from 'simplex-noise';

/**
 * @description Creates 2D noise.
 * @link https://remotion.dev/docs/noise/create-noise-2d
 * @param {RandomSeed} seed Remotion random seed. The same parameter https://www.remotion.dev/docs/random function accepts.
 * @returns {NoiseFunction2D}
 */
export const createNoise2D = (seed: RandomSeed): NoiseFunction2D =>
	_createNoise2D(() => random(seed));

/**
 * @description Creates 3D noise.
 * @link https://remotion.dev/docs/noise/create-noise-3d
 * @param {RandomSeed} seed Remotion random seed. The same parameter https://www.remotion.dev/docs/random function accepts.
 * @returns {NoiseFunction3D}
 */
export const createNoise3D = (seed: RandomSeed): NoiseFunction3D =>
	_createNoise3D(() => random(seed));

/**
 * @description Creates 4D noise.
 * @link https://remotion.dev/docs/noise/create-noise-4d
 * @param {RandomSeed} seed Remotion random seed. The same parameter https://www.remotion.dev/docs/random function accepts.
 * @returns {NoiseFunction4D}
 */
export const createNoise4D = (seed: RandomSeed): NoiseFunction4D =>
	_createNoise4D(() => random(seed));

export type {NoiseFunction2D, NoiseFunction3D, NoiseFunction4D};
