import type {FrameRange} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

let range: FrameRange | null = null;

export const setFrameRange = (newFrameRange: FrameRange | null) => {
	RenderInternals.validateFrameRange(newFrameRange);
	range = newFrameRange;
};

export const setFrameRangeFromCli = (newFrameRange: string | number) => {
	if (typeof newFrameRange === 'number') {
		setFrameRange(newFrameRange);
		range = newFrameRange;
		return;
	}

	if (typeof newFrameRange === 'string') {
		const parsed = newFrameRange.split('-').map((f) => Number(f)) as number[];
		if (parsed.length > 2 || parsed.length <= 0) {
			throw new Error(
				`--frames flag must be a number or 2 numbers separated by '-', instead got ${parsed.length} numbers`,
			);
		}

		if (parsed.length === 2 && (parsed[1] as number) < (parsed[0] as number)) {
			throw new Error(
				'The second number of the --frames flag number should be greater or equal than first number',
			);
		}

		for (const value of parsed) {
			if (isNaN(value)) {
				throw new Error(
					'--frames flag must be a single number, or 2 numbers separated by `-`',
				);
			}
		}

		setFrameRange(parsed as [number, number]);
	}
};

export const getRange = () => range;
