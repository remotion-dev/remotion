/* eslint-disable @typescript-eslint/no-use-before-define */
import {registerTrack} from '../../add-new-matroska-tracks';
import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult, RiffStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import type {RiffResult} from './expect-riff-box';
import {expectRiffBox} from './expect-riff-box';
import {makeAviAudioTrack, makeAviVideoTrack} from './get-tracks-from-avi';
import {getStrfBox, getStrhBox} from './traversal';

const continueAfterRiffBoxResult = ({
	result,
	structure,
	iterator,
	maxOffset,
	options,
}: {
	result: RiffResult;
	structure: RiffStructure;
	iterator: BufferIterator;
	maxOffset: number;
	options: ParserContext;
}): Promise<ParseResult<RiffStructure>> => {
	if (result.type === 'incomplete') {
		return Promise.resolve({
			status: 'incomplete',
			async continueParsing() {
				return Promise.resolve(
					continueAfterRiffBoxResult({
						result: await result.continueParsing(),
						structure,
						iterator,
						maxOffset,
						options,
					}),
				);
			},
			segments: structure,
			skipTo: null,
		});
	}

	if (result.type === 'complete') {
		if (result.box) {
			structure.boxes.push(result.box);
		}
	}

	return parseRiffBody({iterator, maxOffset, options, structure});
};

export const parseRiffBody = async ({
	iterator,
	structure,
	maxOffset,
	options,
}: {
	iterator: BufferIterator;
	structure: RiffStructure;
	maxOffset: number;
	options: ParserContext;
}): Promise<ParseResult<RiffStructure>> => {
	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() < maxOffset
	) {
		const result = await expectRiffBox({
			iterator,
			options,
			structure,
		});
		if (result.type === 'incomplete') {
			return {
				status: 'incomplete',
				async continueParsing() {
					return Promise.resolve(
						continueAfterRiffBoxResult({
							iterator,
							maxOffset,
							options,
							result: await result.continueParsing(),
							structure,
						}),
					);
				},
				segments: structure,
				skipTo: null,
			};
		}

		if (result.box === null) {
			continue;
		}

		structure.boxes.push(result.box);
		if (
			result.box.type === 'strf-box-video' ||
			result.box.type === 'strf-box-audio'
		) {
			const strh = getStrhBox(structure.boxes);
			const strf = getStrfBox(structure.boxes);
			if (!strh || !strf) {
				throw new Error('strh or strf box missing');
			}

			if (strf.type === 'strf-box-audio' && options.onAudioTrack) {
				const audioTrack = makeAviAudioTrack({
					index: options.nextTrackIndex,
					strf,
				});
				await registerTrack({
					options,
					state: options.parserState,
					track: audioTrack,
				});
			}

			if (options.onVideoTrack && strf.type === 'strf-box-video') {
				const videoTrack = makeAviVideoTrack({
					strh,
					index: options.nextTrackIndex,
					strf,
				});
				await registerTrack({
					options,
					state: options.parserState,
					track: videoTrack,
				});
			}

			options.nextTrackIndex++;
		}
	}

	return {
		status: 'done',
		segments: structure,
	};
};

export const parseRiff = ({
	iterator,
	options,
}: {
	iterator: BufferIterator;
	options: ParserContext;
}): Promise<ParseResult<RiffStructure>> => {
	const structure: RiffStructure = {type: 'riff', boxes: []};
	const riff = iterator.getByteString(4);
	if (riff !== 'RIFF') {
		throw new Error('Not a RIFF file');
	}

	const size = iterator.getUint32Le();
	const fileType = iterator.getByteString(4);
	if (fileType !== 'WAVE' && fileType !== 'AVI') {
		throw new Error(`File type ${fileType} not supported`);
	}

	structure.boxes.push({type: 'riff-header', fileSize: size, fileType});

	return parseRiffBody({iterator, structure, maxOffset: Infinity, options});
};
