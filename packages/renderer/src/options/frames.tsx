import type {FrameRangeTuple, FrameSelection} from '../frame-range';
import {validateFrameRange} from '../frame-range';
import {validateSelectedFrames} from '../validate-selected-frames';
import type {AnyRemotionOption} from './option';

const cliFlag = 'frames' as const;

let frameSelection: FrameSelection = null;

const parseFrameRangeFromCli = (
	newFrameRange: string | number,
): Exclude<FrameSelection, null> => {
	if (typeof newFrameRange === 'number') {
		if (newFrameRange < 0) {
			return [0, Math.abs(newFrameRange)];
		}

		return newFrameRange;
	}

	if (typeof newFrameRange === 'string') {
		if (newFrameRange.trim() === '') {
			throw new Error(
				'--frames flag must be a single number, or 2 numbers separated by `-`',
			);
		}

		if (newFrameRange.includes(',')) {
			const selectors = newFrameRange
				.split(',')
				.map((selector) => selector.trim());
			if (selectors.some((selector) => selector === '')) {
				throw new TypeError(
					'--frames must contain a frame or frame range between commas.',
				);
			}

			const onlyFrames = selectors.every((selector) => !selector.includes('-'));
			if (onlyFrames) {
				const frames = validateSelectedFrames({
					frames: selectors.map((frame) => Number(frame)),
					durationInFrames: null,
				});

				return {type: 'frames', frames};
			}

			const ranges = selectors.map((selector): FrameRangeTuple => {
				if (!selector.includes('-')) {
					const frame = Number(selector);
					return [frame, frame];
				}

				const rangeParts = selector.split('-');
				if (rangeParts.length !== 2 || rangeParts[0] === '') {
					throw new Error(
						`Invalid frame selector "${selector}". Use a frame number, a range such as 0-9, or an open-ended range such as 100-.`,
					);
				}

				const start = Number(rangeParts[0]);
				const end = rangeParts[1] === '' ? null : Number(rangeParts[1]);
				return [start, end];
			});

			validateFrameRange(ranges);
			return ranges;
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
					'--frames flag must be a frame number, range, or comma-separated selection',
				);
			}

			return value;
		}

		const [firstPart, secondPart] = parts as [string, string];

		if (secondPart === '' && firstPart !== '') {
			const start = Number(firstPart);
			if (isNaN(start)) {
				throw new Error(
					'--frames flag must be a frame number, range, or comma-separated selection',
				);
			}

			return [start, null];
		}

		const parsed = parts.map((f) => Number(f));
		const [first, second] = parsed as [number, number];

		for (const value of parsed) {
			if (isNaN(value)) {
				throw new Error(
					'--frames flag must be a frame number, range, or comma-separated selection',
				);
			}
		}

		if (second < first) {
			throw new Error(
				'The second number of the --frames flag number should be greater or equal than first number',
			);
		}

		return [first, second];
	}

	throw new Error(
		'--frames flag must be a single number, or 2 numbers separated by `-`',
	);
};

export const framesOption = {
	name: 'Frame Range',
	cliFlag,
	description: () => (
		<>
			Render a subset of a video. Pass a single number to render a still, or a
			range (e.g. <code>0-9</code>) to render a subset of frames. Pass{' '}
			<code>100-</code> to render from frame 100 to the end.
		</>
	),
	ssrName: 'frameRange' as const,
	docLink: 'https://www.remotion.dev/docs/config#setframerange',
	type: null as FrameSelection,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = parseFrameRangeFromCli(
				commandLine[cliFlag] as string | number,
			);
			if (typeof value === 'object' && !Array.isArray(value)) {
				validateSelectedFrames({
					frames: value.frames,
					durationInFrames: null,
				});
			} else {
				validateFrameRange(value);
			}

			return {
				source: 'cli',
				value,
			};
		}

		return {
			source: 'config',
			value: frameSelection,
		};
	},
	setConfig: (value: FrameSelection) => {
		if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
			validateSelectedFrames({frames: value.frames, durationInFrames: null});
		} else if (value !== null) {
			validateFrameRange(value);
		}

		frameSelection = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<FrameSelection>;
