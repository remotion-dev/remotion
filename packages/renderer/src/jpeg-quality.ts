export const DEFAULT_JPEG_QUALITY = 80;

export const validateJpegQuality = (q: unknown) => {
	if (typeof q !== 'undefined' && typeof q !== 'number') {
		throw new Error(
			`JPEG Quality option must be a number or undefined. Got ${typeof q} (${JSON.stringify(
				q,
			)})`,
		);
	}

	if (typeof q === 'undefined') {
		return;
	}

	if (!Number.isFinite(q)) {
		throw new RangeError(`JPEG Quality must be a finite number, but is ${q}`);
	}

	if (Number.isNaN(q)) {
		throw new RangeError(`JPEG Quality is NaN, but must be a real number`);
	}

	if (q > 100 || q < 0) {
		throw new RangeError('JPEG Quality option must be between 0 and 100.');
	}
};
