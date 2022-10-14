import { random } from "remotion";
import {
  createNoise2D as _createNoise2D,
  createNoise3D as _createNoise3D,
  createNoise4D as _createNoise4D,
} from 'simplex-noise';
import type {
  NoiseFunction2D,
  NoiseFunction3D,
  NoiseFunction4D,
} from 'simplex-noise';

export const createNoise2D = (seed: number | string | null): NoiseFunction2D => _createNoise2D(() => random(seed));

export const createNoise3D = (seed: number | string | null): NoiseFunction3D => _createNoise3D(() => random(seed));

export const createNoise4D = (seed: number | string | null): NoiseFunction4D => _createNoise4D(() => random(seed));

export type {
  NoiseFunction2D,
  NoiseFunction3D,
  NoiseFunction4D,
}
