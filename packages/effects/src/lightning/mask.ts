// Core coverage and the three-box Gaussian approximation follow EffectCraft's
// generate2.rs and util.rs (MIT). See ../../THIRD_PARTY_LICENSES.md.
import {lightningSegments} from './geometry.js';
import type {LightningParams} from './params.js';

const blurRows = (
	input: Float32Array,
	output: Float32Array,
	width: number,
	radius: number,
) => {
	const height = input.length / width;
	const weight = 1 / (2 * radius + 1);
	for (let y = 0; y < height; y++) {
		const row = y * width;
		let sum = input[row] * (radius + 1);
		for (let x = 1; x <= radius; x++)
			sum += input[row + Math.min(width - 1, x)];
		for (let x = 0; x < width; x++) {
			output[row + x] = sum * weight;
			sum +=
				input[row + Math.min(width - 1, x + radius + 1)] -
				input[row + Math.max(0, x - radius)];
		}
	}
};

const transpose = (
	input: Float32Array,
	output: Float32Array,
	width: number,
	height: number,
) => {
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++)
			output[x * height + y] = input[y * width + x];
	}
};

export const makeLightningMask = (
	p: Required<LightningParams>,
	width: number,
	height: number,
	alpha: ImageData | null,
) => {
	const segments = lightningSegments(p, width, height, alpha);
	const data = new Uint8Array(width * height * 4);
	const coreRadius = Math.max(0.3, p.coreRadius);
	const sigma = p.glowRadius / 3;
	const idealWidth = Math.sqrt(4 * sigma * sigma + 1);
	const lowerWidth = 2 * Math.floor((idealWidth - 1) / 2) + 1;
	const lowerPasses = Math.round(
		(12 * sigma * sigma - 3 * lowerWidth ** 2 - 12 * lowerWidth - 9) /
			(-4 * lowerWidth - 4),
	);
	const radii =
		p.glowRadius > 0.5
			? [0, 1, 2].map(
					(pass) => (lowerWidth - 1) / 2 + Number(pass >= lowerPasses),
				)
			: [];
	const margin = coreRadius + 1 + radii.reduce((total, r) => total + r, 0);
	let left = width;
	let top = height;
	let right = 0;
	let bottom = 0;
	for (const {start, end} of segments) {
		left = Math.min(left, Math.floor(Math.min(start[0], end[0]) - margin));
		right = Math.max(right, Math.ceil(Math.max(start[0], end[0]) + margin));
		top = Math.min(top, Math.floor(Math.min(start[1], end[1]) - margin));
		bottom = Math.max(bottom, Math.ceil(Math.max(start[1], end[1]) + margin));
	}

	left = Math.max(0, left);
	top = Math.max(0, top);
	right = Math.min(width, right);
	bottom = Math.min(height, bottom);
	const w = right - left;
	const h = bottom - top;
	if (w <= 0 || h <= 0) return data;
	let core = new Float32Array(w * h);
	for (const {start, end, intensity} of segments) {
		const dx = end[0] - start[0];
		const dy = end[1] - start[1];
		const lengthSq = Math.max(1e-12, dx * dx + dy * dy);
		const x0 = Math.max(
			left,
			Math.floor(Math.min(start[0], end[0]) - coreRadius - 1),
		);
		const y0 = Math.max(
			top,
			Math.floor(Math.min(start[1], end[1]) - coreRadius - 1),
		);
		const x1 = Math.min(
			right,
			Math.ceil(Math.max(start[0], end[0]) + coreRadius + 1),
		);
		const y1 = Math.min(
			bottom,
			Math.ceil(Math.max(start[1], end[1]) + coreRadius + 1),
		);
		for (let y = y0; y < y1; y++) {
			const py = y + 0.5 - start[1];
			for (let x = x0; x < x1; x++) {
				const px = x + 0.5 - start[0];
				const t = Math.max(0, Math.min(1, (px * dx + py * dy) / lengthSq));
				const distance = Math.sqrt((px - dx * t) ** 2 + (py - dy * t) ** 2);
				const coverage = Math.min(1, coreRadius + 0.5 - distance) * intensity;
				const index = (y - top) * w + x - left;
				if (coverage > core[index]) core[index] = coverage;
			}
		}
	}

	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++)
			data[((y + top) * width + x + left) * 4] = Math.round(
				core[y * w + x] * 255,
			);
	}

	if (radii.length === 0) return data;

	let scratch = new Float32Array(w * h);
	for (const radius of radii) {
		if (radius === 0) continue;
		blurRows(core, scratch, w, radius);
		[core, scratch] = [scratch, core];
	}

	transpose(core, scratch, w, h);
	[core, scratch] = [scratch, core];
	for (const radius of radii) {
		if (radius === 0) continue;
		blurRows(core, scratch, h, radius);
		[core, scratch] = [scratch, core];
	}

	for (let x = 0; x < w; x++) {
		for (let y = 0; y < h; y++)
			data[((y + top) * width + x + left) * 4 + 1] = Math.round(
				Math.min(1, core[x * h + y] * 3) * 255,
			);
	}

	return data;
};
