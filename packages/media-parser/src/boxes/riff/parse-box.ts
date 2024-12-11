/* eslint-disable @typescript-eslint/no-use-before-define */
import type {BufferIterator} from '../../buffer-iterator';
import {getTracks} from '../../get-tracks';
import {hasAllInfo} from '../../has-all-info';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult, RiffStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {
	registerTrack,
	registerVideoTrackWhenProfileIsAvailable,
} from '../../register-track';
import type {RiffResult} from './expect-riff-box';
import {expectRiffBox} from './expect-riff-box';
import {
	makeAviAudioTrack,
	makeAviVideoTrack,
	TO_BE_OVERRIDDEN_LATER,
} from './get-tracks-from-avi';
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

	if (result.type === 'complete' && result.box) {
		structure.boxes.push(result.box);
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
		if (result.type === 'complete' && result.skipTo !== null) {
			return {
				status: 'incomplete',
				skipTo: result.skipTo,
				segments: structure,
				continueParsing() {
					return Promise.resolve(
						continueAfterRiffBoxResult({
							iterator,
							maxOffset,
							options,
							result,
							structure,
						}),
					);
				},
			};
		}

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
		// When parsing an AVI
		if (result.box.type === 'list-box' && result.box.listType === 'hdrl') {
			const tracks = getTracks(structure, options.parserState);
			if (!tracks.videoTracks.some((t) => t.codec === TO_BE_OVERRIDDEN_LATER)) {
				options.parserState.tracks.setIsDone();
			}
		}

		// When parsing a WAV
		if (result.box.type === 'wave-format-box') {
			options.parserState.tracks.setIsDone();
		}

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
					track: audioTrack,
					container: 'avi',
				});
			}

			if (options.onVideoTrack && strf.type === 'strf-box-video') {
				const videoTrack = makeAviVideoTrack({
					strh,
					index: options.nextTrackIndex,
					strf,
				});
				registerVideoTrackWhenProfileIsAvailable({
					options,
					track: videoTrack,
					container: 'avi',
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
	fields,
}: {
	iterator: BufferIterator;
	options: ParserContext;
	fields: Options<ParseMediaFields>;
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

	if (hasAllInfo({fields, structure, state: options.parserState})) {
		return Promise.resolve({
			status: 'done',
			segments: structure,
		});
	}

	return parseRiffBody({iterator, structure, maxOffset: Infinity, options});
};
