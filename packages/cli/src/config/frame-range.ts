import type {FrameRange} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

let range: FrameRange | null = null;

export const setFrameRange = (newFrameRange: FrameRange | null) => {
	RenderInternals.validateFrameRange(newFrameRange);
	range = newFrameRange;
};

export const setFrameRangeFromCli = (newFrameRange: string | number) => {
	if (typeof newFrameRange === 'number') {
		if (newFrameRange < 0) {
			setFrameRange([0, Math.abs(newFrameRange)]);
			return;
		}

		setFrameRange(newFrameRange);
		range = newFrameRange;
		return;
	}

	if (typeof newFrameRange === 'string') {
		if (newFrameRange.trim() === '') {
			throw new Error(
				'--frames flag must be a single number, or 2 numbers separated by `-`',
			);
		}

		const parts = newFrameRange.split('-');
		if (parts.length > 2 || parts.length <= 0) {
			throw new Error(
				`--frames flag must be a number or 2 numbers separated by '-', instead got ${parts.length} numbers`,
			);
		}

		if (parts.length === 1) {
			const value = Number(parts[0]);
			if (isNaN(value)) {
				throw new Error(
					'--frames flag must be a single number, or 2 numbers separated by `-`',
				);
			}

			setFrameRange(value);
			return;
		}

		const [firstPart, secondPart] = parts as [string, string];

		if (secondPart === '' && firstPart !== '') {
			const start = Number(firstPart);
			if (isNaN(start)) {
				throw new Error(
					'--frames flag must be a single number, or 2 numbers separated by `-`',
				);
			}

			setFrameRange([start, null]);
			return;
		}

		const parsed = parts.map((f) => Number(f));
		const [first, second] = parsed as [number, number];

		for (const value of parsed) {
			if (isNaN(value)) {
				throw new Error(
					'--frames flag must be a single number, or 2 numbers separated by `-`',
				);
			}
		}

		if (second < first) {
			throw new Error(
				'The second number of the --frames flag number should be greater or equal than first number',
			);
		}

		setFrameRange([first, second]);
	}
};

export const getRange = () => range;
