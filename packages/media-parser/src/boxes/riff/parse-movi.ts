import type {BufferIterator} from '../../buffer-iterator';
import type {RiffStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import type {RiffResult} from './expect-riff-box';
import type {StrhBox} from './riff-box';
import {MEDIA_PARSER_RIFF_TIMESCALE} from './timescale';
import {getStrhBox, getStrlBoxes} from './traversal';

const getStrhForIndex = (
	structure: RiffStructure,
	trackId: number,
): StrhBox => {
	const boxes = getStrlBoxes(structure);
	const box = boxes[trackId];
	if (!box) {
		throw new Error('Expected box');
	}

	const strh = getStrhBox(box.children);
	if (!strh) {
		throw new Error('strh');
	}

	return strh;
};

export const handleChunk = async ({
	iterator,
	options,
	structure,
}: {
	iterator: BufferIterator;
	options: ParserContext;
	structure: RiffStructure;
}) => {
	const ckId = iterator.getByteString(4);
	const ckSize = iterator.getUint32Le();

	const videoChunk = ckId.match(/^([0-9]{2})dc$/);
	if (videoChunk) {
		const trackId = parseInt(videoChunk[1], 10);
		const strh = getStrhForIndex(structure, trackId);

		const samplesPerSecond = strh.rate / strh.scale;
		const nthSample = options.parserState.getSamplesForTrack(trackId);
		const timeInSec = nthSample / samplesPerSecond;
		const timestamp = timeInSec * MEDIA_PARSER_RIFF_TIMESCALE;
		const duration = (1 / samplesPerSecond) * MEDIA_PARSER_RIFF_TIMESCALE;

		await options.parserState.onVideoSample(trackId, {
			cts: timestamp,
			dts: timestamp,
			data: iterator.getSlice(ckSize),
			duration,
			timestamp,
			trackId,
			// TODO
			type: 'delta',
		});
	} else {
		const audioChunk = ckId.match(/^([0-9]{2})wb$/);
		if (audioChunk) {
			const trackId = parseInt(audioChunk[1], 10);
			const strh = getStrhForIndex(structure, trackId);

			const samplesPerSecond = strh.rate / strh.scale;
			const nthSample = options.parserState.getSamplesForTrack(trackId);
			const timeInSec = nthSample / samplesPerSecond;
			const timestamp = timeInSec * MEDIA_PARSER_RIFF_TIMESCALE;
			const duration = (1 / samplesPerSecond) * MEDIA_PARSER_RIFF_TIMESCALE;

			await options.parserState.onAudioSample(trackId, {
				cts: timestamp,
				dts: timestamp,
				data: iterator.getSlice(ckSize),
				duration,
				timestamp,
				trackId,
				type: 'key',
			});
		}
	}
};

export const parseMovi = async ({
	iterator,
	maxOffset,
	options,
	structure,
}: {
	iterator: BufferIterator;
	maxOffset: number;
	options: ParserContext;
	structure: RiffStructure;
}): Promise<RiffResult> => {
	while (iterator.counter.getOffset() < maxOffset) {
		if (iterator.bytesRemaining() < 8) {
			return {
				type: 'incomplete',
				continueParsing: () => {
					return Promise.resolve(
						parseMovi({iterator, maxOffset, options, structure}),
					);
				},
			};
		}

		await handleChunk({iterator, options, structure});

		// Discard added zeroes
		while (
			iterator.counter.getOffset() < maxOffset &&
			iterator.bytesRemaining() > 0
		) {
			if (iterator.getUint8() !== 0) {
				iterator.counter.decrement(1);
				break;
			}
		}
	}

	if (iterator.counter.getOffset() === maxOffset) {
		return {
			type: 'complete',
			box: {
				type: 'movi-box',
			},
		};
	}

	if (iterator.counter.getOffset() > maxOffset) {
		throw new Error('Oops, this should not happen!');
	}

	return {
		type: 'incomplete',
		continueParsing: () => {
			return Promise.resolve(
				parseMovi({iterator, maxOffset, options, structure}),
			);
		},
	};
};
