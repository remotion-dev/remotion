export type ParsedCubeLut = {
	readonly size: number;
	readonly domainMin: readonly [number, number, number];
	readonly domainMax: readonly [number, number, number];
	readonly data: Float32Array;
};

const stripComment = (line: string): string => {
	let insideQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const character = line[i];
		if (character === '"') {
			insideQuotes = !insideQuotes;
		} else if (character === '#' && !insideQuotes) {
			return line.slice(0, i);
		}
	}

	return line;
};

const parseTriplet = ({
	values,
	lineNumber,
	label,
}: {
	readonly values: readonly string[];
	readonly lineNumber: number;
	readonly label: string;
}): readonly [number, number, number] => {
	if (values.length !== 3) {
		throw new TypeError(
			`Invalid LUT content on line ${lineNumber}: ${label} must contain exactly 3 numbers`,
		);
	}

	const parsed = values.map((value) => Number(value));
	if (parsed.some((value) => !Number.isFinite(value))) {
		throw new TypeError(
			`Invalid LUT content on line ${lineNumber}: ${label} must contain only finite numbers`,
		);
	}

	return [parsed[0], parsed[1], parsed[2]];
};

const HEADER_DIRECTIVES = new Set([
	'TITLE',
	'LUT_3D_SIZE',
	'DOMAIN_MIN',
	'DOMAIN_MAX',
]);

export const parseCubeLut = (content: string): ParsedCubeLut => {
	const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
	let size: number | null = null;
	let domainMin: readonly [number, number, number] = [0, 0, 0];
	let domainMax: readonly [number, number, number] = [1, 1, 1];
	let hasDomainMin = false;
	let hasDomainMax = false;
	let hasTitle = false;
	let dataRows = 0;
	let dataStarted = false;

	for (let index = 0; index < lines.length; index++) {
		const lineNumber = index + 1;
		const line = stripComment(lines[index]).trim();
		if (line.length === 0) {
			continue;
		}

		const [keyword, ...values] = line.split(/\s+/);

		if (keyword === 'LUT_1D_SIZE') {
			throw new TypeError(
				`Invalid LUT content on line ${lineNumber}: 1D LUTs are not supported`,
			);
		}

		if (HEADER_DIRECTIVES.has(keyword)) {
			if (dataStarted) {
				throw new TypeError(
					`Invalid LUT content on line ${lineNumber}: ${keyword} must appear before the color data`,
				);
			}

			if (keyword === 'TITLE') {
				if (hasTitle) {
					throw new TypeError(
						`Invalid LUT content on line ${lineNumber}: TITLE may only be declared once`,
					);
				}

				hasTitle = true;
				continue;
			}

			if (keyword === 'LUT_3D_SIZE') {
				if (size !== null) {
					throw new TypeError(
						`Invalid LUT content on line ${lineNumber}: LUT_3D_SIZE may only be declared once`,
					);
				}

				if (values.length !== 1) {
					throw new TypeError(
						`Invalid LUT content on line ${lineNumber}: LUT_3D_SIZE must contain exactly one integer`,
					);
				}

				const parsedSize = Number(values[0]);
				if (
					!Number.isInteger(parsedSize) ||
					parsedSize < 2 ||
					parsedSize > 256
				) {
					throw new TypeError(
						`Invalid LUT content on line ${lineNumber}: LUT_3D_SIZE must be an integer from 2 to 256`,
					);
				}

				size = parsedSize;
				continue;
			}

			if (keyword === 'DOMAIN_MIN') {
				if (hasDomainMin) {
					throw new TypeError(
						`Invalid LUT content on line ${lineNumber}: DOMAIN_MIN may only be declared once`,
					);
				}

				domainMin = parseTriplet({
					values,
					lineNumber,
					label: 'DOMAIN_MIN',
				});
				hasDomainMin = true;
				continue;
			}

			if (hasDomainMax) {
				throw new TypeError(
					`Invalid LUT content on line ${lineNumber}: DOMAIN_MAX may only be declared once`,
				);
			}

			domainMax = parseTriplet({
				values,
				lineNumber,
				label: 'DOMAIN_MAX',
			});
			hasDomainMax = true;
			continue;
		}

		if (/^[A-Z_]/i.test(keyword)) {
			throw new TypeError(
				`Invalid LUT content on line ${lineNumber}: unsupported directive "${keyword}"`,
			);
		}

		if (size === null) {
			throw new TypeError(
				`Invalid LUT content on line ${lineNumber}: LUT_3D_SIZE must be declared before the color data`,
			);
		}

		parseTriplet({
			values: [keyword, ...values],
			lineNumber,
			label: 'color row',
		});
		dataStarted = true;
		dataRows++;

		const maxDataRows = size ** 3;
		if (dataRows > maxDataRows) {
			throw new TypeError(
				`Invalid LUT content: expected ${maxDataRows} color rows for LUT_3D_SIZE ${size}, but got more`,
			);
		}
	}

	if (size === null) {
		throw new TypeError('Invalid LUT content: LUT_3D_SIZE is missing');
	}

	for (let channel = 0; channel < 3; channel++) {
		if (domainMin[channel] >= domainMax[channel]) {
			throw new TypeError(
				`Invalid LUT content: DOMAIN_MIN must be smaller than DOMAIN_MAX for every channel`,
			);
		}
	}

	const expectedRows = size ** 3;
	if (dataRows !== expectedRows) {
		throw new TypeError(
			`Invalid LUT content: expected ${expectedRows} color rows for LUT_3D_SIZE ${size}, but got ${dataRows}`,
		);
	}

	const data = new Float32Array(expectedRows * 4);
	let dataIndex = 0;

	for (let index = 0; index < lines.length; index++) {
		const line = stripComment(lines[index]).trim();
		if (line.length === 0) {
			continue;
		}

		const [keyword, ...values] = line.split(/\s+/);
		if (HEADER_DIRECTIVES.has(keyword)) {
			continue;
		}

		const [red, green, blue] = parseTriplet({
			values: [keyword, ...values],
			lineNumber: index + 1,
			label: 'color row',
		});
		const offset = dataIndex * 4;
		data[offset] = red;
		data[offset + 1] = green;
		data[offset + 2] = blue;
		data[offset + 3] = 1;
		dataIndex++;
	}

	return {
		size,
		domainMin,
		domainMax,
		data,
	};
};
