import type {RandomSeed} from 'remotion';
import {random} from 'remotion';
import type {
	NoiseFunction2D,
	NoiseFunction3D,
	NoiseFunction4D,
} from 'simplex-noise';
import {createNoise2D, createNoise3D, createNoise4D} from 'simplex-noise';

const seedCache2d: Map<RandomSeed, NoiseFunction2D> = new Map();
const seedCache3d: Map<RandomSeed, NoiseFunction3D> = new Map();
const seedCache4d: Map<RandomSeed, NoiseFunction4D> = new Map();

const generate2DNoise = (seed: RandomSeed) => {
	const cached = seedCache2d.get(seed);
	if (cached) {
		return cached;
	}

	// If the cache is getting to big, remove entries based on FIFO principle
	if (seedCache2d.size > 10) {
		seedCache2d.delete(seedCache2d.keys().next().value);
	}

	const noise = createNoise2D(() => random(seed));
	seedCache2d.set(seed, noise);
	return noise;
};

const generate3DNoise = (seed: RandomSeed) => {
	const cached = seedCache3d.get(seed);
	if (cached) {
		return cached;
	}

	// If the cache is getting to big, remove entries based on FIFO principle
	if (seedCache3d.size > 10) {
		seedCache3d.delete(seedCache3d.keys().next().value);
	}

	const noise = createNoise3D(() => random(seed));
	seedCache3d.set(seed, noise);
	return noise;
};

const generate4DNoise = (seed: RandomSeed) => {
	const cached = seedCache4d.get(seed);
	if (cached) {
		return cached;
	}

	// If the cache is getting to big, remove entries based on FIFO principle
	if (seedCache4d.size > 10) {
		seedCache4d.delete(seedCache4d.keys().next().value);
	}

	const noise = createNoise4D(() => random(seed));
	seedCache4d.set(seed, noise);
	return noise;
};

/**
 * @description Creates 2D noise.
 * @link https://remotion.dev/docs/noise/create-noise-2d
 * @param {RandomSeed} seed Remotion random seed. The same parameter https://www.remotion.dev/docs/random function accepts.
 * @returns {number}
 */
export const noise2D = (seed: RandomSeed, x: number, y: number): number => {
	return generate2DNoise(seed)(x, y);
};

/**
 * @description Creates 3D noise.
 * @link https://remotion.dev/docs/noise/create-noise-3d
 * @param {RandomSeed} seed Remotion random seed. The same parameter https://www.remotion.dev/docs/random function accepts.
 * @returns {number}
 */
export const noise3D = (
	seed: RandomSeed,
	x: number,
	y: number,
	z: number
): number => generate3DNoise(random(seed))(x, y, z);

/**
 * @description Creates 4D noise.
 * @link https://remotion.dev/docs/noise/create-noise-4d
 * @param {RandomSeed} seed Remotion random seed. The same parameter https://www.remotion.dev/docs/random function accepts.
 * @returns {number}
 */
export const noise4D = (
	seed: RandomSeed,
	x: number,
	y: number,
	z: number,
	w: number
	// eslint-disable-next-line max-params
): number => generate4DNoise(random(seed))(x, y, z, w);
