type Rgb = [number, number, number];

export type CubeLut = {
	readonly type: '1d' | '3d';
	readonly size: number;
	readonly title: string | null;
	readonly domainMin: Rgb;
	readonly domainMax: Rgb;
	readonly data: Float32Array;
};

export const parseCubeLut = (text: string): CubeLut => {
	let type: CubeLut['type'] | null = null;
	let size = 0;
	let title: string | null = null;
	let domainMin: Rgb = [0, 0, 0];
	let domainMax: Rgb = [1, 1, 1];
	let data: Float32Array | null = null;
	let offset = 0;
	const headers = new Set<string>();

	for (const [index, rawLine] of text.split(/\r\n?|\n/).entries()) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) {
			continue;
		}

		const titleMatch = line.match(/^TITLE\s+"([^"]*)"\s*(?:#.*)?$/);
		const [keyword, ...values] = line.replace(/#.*$/, '').trim().split(/\s+/);
		const numbers = values.map(Number);
		const isHeader = /^[A-Z][A-Z0-9_]*$/.test(keyword);

		if (isHeader) {
			if (offset > 0) {
				throw new Error(`LUT header after color data on line ${index + 1}.`);
			}

			if (headers.has(keyword)) {
				throw new Error(`Duplicate ${keyword} on line ${index + 1}.`);
			}

			headers.add(keyword);
		}

		if (keyword === 'TITLE' && titleMatch) {
			title = titleMatch[1];
			continue;
		}

		if (keyword === 'LUT_1D_SIZE' || keyword === 'LUT_3D_SIZE') {
			if (type !== null) {
				throw new Error('Combined 1D and 3D LUTs are not supported.');
			}

			type = keyword === 'LUT_1D_SIZE' ? '1d' : '3d';
			size = numbers[0];
			const maxSize = type === '1d' ? 65536 : 256;
			if (
				numbers.length !== 1 ||
				!Number.isInteger(size) ||
				size < 2 ||
				size > maxSize
			) {
				throw new Error(`${keyword} must be an integer from 2 to ${maxSize}.`);
			}

			data = new Float32Array((type === '1d' ? size : size ** 3) * 3);
			continue;
		}

		if (keyword === 'DOMAIN_MIN' || keyword === 'DOMAIN_MAX') {
			if (numbers.length !== 3 || !numbers.every(Number.isFinite)) {
				throw new Error(`${keyword} must contain three finite numbers.`);
			}

			if (keyword === 'DOMAIN_MIN') {
				domainMin = [numbers[0], numbers[1], numbers[2]];
			} else {
				domainMax = [numbers[0], numbers[1], numbers[2]];
			}

			continue;
		}

		if (keyword === 'LUT_1D_INPUT_RANGE' || keyword === 'LUT_3D_INPUT_RANGE') {
			if (
				numbers.length !== 2 ||
				!numbers.every(Number.isFinite) ||
				numbers[0] >= numbers[1]
			) {
				throw new Error(`${keyword} must contain an increasing input range.`);
			}

			domainMin = [numbers[0], numbers[0], numbers[0]];
			domainMax = [numbers[1], numbers[1], numbers[1]];
			continue;
		}

		if (isHeader) {
			throw new Error(
				`Unsupported LUT header "${keyword}" on line ${index + 1}.`,
			);
		}

		if (data === null) {
			throw new Error('Expected LUT_1D_SIZE or LUT_3D_SIZE before color data.');
		}

		const color = [Number(keyword), ...numbers];
		if (
			color.length !== 3 ||
			!color.every((value) => Number.isFinite(Math.fround(value)))
		) {
			throw new Error(`Invalid LUT color on line ${index + 1}.`);
		}

		if (offset + 3 > data.length) {
			throw new Error(`Expected ${data.length / 3} LUT colors, got more.`);
		}

		data.set(color, offset);
		offset += 3;
	}

	if (type === null || data === null) {
		throw new Error('Expected LUT_1D_SIZE or LUT_3D_SIZE.');
	}

	if (offset !== data.length) {
		throw new Error(
			`Expected ${data.length / 3} LUT colors, got ${offset / 3}.`,
		);
	}

	if (domainMin.some((min, channel) => min >= domainMax[channel])) {
		throw new Error(
			'DOMAIN_MAX must be greater than DOMAIN_MIN in every channel.',
		);
	}

	if (
		domainMin.some((min, channel) => !Number.isFinite(domainMax[channel] - min))
	) {
		throw new Error('LUT input ranges must be finite.');
	}

	if (
		(headers.has('LUT_1D_INPUT_RANGE') || headers.has('LUT_3D_INPUT_RANGE')) &&
		(headers.has('DOMAIN_MIN') ||
			headers.has('DOMAIN_MAX') ||
			headers.has(type === '1d' ? 'LUT_3D_INPUT_RANGE' : 'LUT_1D_INPUT_RANGE'))
	) {
		throw new Error('Conflicting LUT input range headers.');
	}

	return {type, size, title, domainMin, domainMax, data};
};

export const applyCubeLut = (pixels: Uint8ClampedArray, lut: CubeLut): void => {
	const {data, size, domainMin, domainMax, type} = lut;
	const last = size - 1;
	const range = domainMin.map((min, channel) => domainMax[channel] - min);

	for (let pixel = 0; pixel < pixels.length; pixel += 4) {
		if (type === '1d') {
			for (let channel = 0; channel < 3; channel++) {
				const position = Math.max(
					0,
					Math.min(
						last,
						((pixels[pixel + channel] / 255 - domainMin[channel]) /
							range[channel]) *
							last,
					),
				);
				const low = Math.floor(position);
				const high = Math.min(low + 1, last);
				const fraction = position - low;
				pixels[pixel + channel] =
					255 *
					(data[low * 3 + channel] * (1 - fraction) +
						data[high * 3 + channel] * fraction);
			}

			continue;
		}

		const r = Math.max(
			0,
			Math.min(last, ((pixels[pixel] / 255 - domainMin[0]) / range[0]) * last),
		);
		const g = Math.max(
			0,
			Math.min(
				last,
				((pixels[pixel + 1] / 255 - domainMin[1]) / range[1]) * last,
			),
		);
		const b = Math.max(
			0,
			Math.min(
				last,
				((pixels[pixel + 2] / 255 - domainMin[2]) / range[2]) * last,
			),
		);
		const r0 = Math.floor(r);
		const g0 = Math.floor(g);
		const b0 = Math.floor(b);
		const r1 = Math.min(r0 + 1, last);
		const g1 = Math.min(g0 + 1, last);
		const b1 = Math.min(b0 + 1, last);
		const rf = r - r0;
		const gf = g - g0;
		const bf = b - b0;

		// .cube files store red fastest, then green, then blue.
		for (let channel = 0; channel < 3; channel++) {
			const c00 =
				data[(r0 + g0 * size + b0 * size * size) * 3 + channel] * (1 - rf) +
				data[(r1 + g0 * size + b0 * size * size) * 3 + channel] * rf;
			const c10 =
				data[(r0 + g1 * size + b0 * size * size) * 3 + channel] * (1 - rf) +
				data[(r1 + g1 * size + b0 * size * size) * 3 + channel] * rf;
			const c01 =
				data[(r0 + g0 * size + b1 * size * size) * 3 + channel] * (1 - rf) +
				data[(r1 + g0 * size + b1 * size * size) * 3 + channel] * rf;
			const c11 =
				data[(r0 + g1 * size + b1 * size * size) * 3 + channel] * (1 - rf) +
				data[(r1 + g1 * size + b1 * size * size) * 3 + channel] * rf;
			pixels[pixel + channel] =
				255 *
				((c00 * (1 - gf) + c10 * gf) * (1 - bf) +
					(c01 * (1 - gf) + c11 * gf) * bf);
		}
	}
};
