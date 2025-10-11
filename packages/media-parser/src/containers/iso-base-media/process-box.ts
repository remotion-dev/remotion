import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {MediaParserLogLevel} from '../../log';
import {Log} from '../../log';
import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import type {FetchMoreData} from '../../skip';
import {makeFetchMoreData} from '../../skip';
import type {TracksState} from '../../state/has-tracks-section';
import type {IsoBaseMediaState} from '../../state/iso-base-media/iso-state';
import type {MovieTimeScaleState} from '../../state/iso-base-media/timescale-state';
import type {CallbacksState} from '../../state/sample-callbacks';
import type {MediaSectionState} from '../../state/video-section';
import type {
	MediaParserOnAudioTrack,
	MediaParserOnVideoTrack,
} from '../../webcodec-sample-types';
import type {IsoBaseMediaBox} from './base-media-box';
import {parseElst} from './elst';
import {parseEsds} from './esds/esds';
import {parseFtyp} from './ftyp';
import {getIsoBaseMediaChildren} from './get-children';
import {makeBaseMediaTrack} from './make-track';
import {findTrackStartTimeInSeconds} from './mdat/get-editlist';
import {parseMdhd} from './mdhd';
import {parseHdlr} from './meta/hdlr';
import {parseIlstBox} from './meta/ilst';
import {parseTfraBox} from './mfra/tfra';
import {parseMoov} from './moov/moov';
import {parseMvhd} from './moov/mvhd';
import {parseTrex} from './moov/trex';
import {parseAv1C} from './stsd/av1c';
import {parseAvcc} from './stsd/avcc';
import {parseColorParameterBox} from './stsd/colr';
import {parseCtts} from './stsd/ctts';
import {parseHvcc} from './stsd/hvcc';
import {parseKeys} from './stsd/keys';
import {parseMebx} from './stsd/mebx';
import {parsePasp} from './stsd/pasp';
import {parseStco} from './stsd/stco';
import {parseStsc} from './stsd/stsc';
import {parseStsd} from './stsd/stsd';
import {parseStss} from './stsd/stss';
import {parseStsz} from './stsd/stsz';
import {parseStts} from './stsd/stts';
import {parseVpcc} from './stsd/vpcc';
import {parseTfdt} from './tfdt';
import {getTfhd} from './tfhd';
import {parseTkhd} from './tkhd';
import {parseTrak} from './trak/trak';
import {parseTrun} from './trun';

export type OnlyIfMoovAtomExpected = {
	tracks: TracksState;
	isoState: IsoBaseMediaState | null;
	movieTimeScaleState: MovieTimeScaleState;
	onVideoTrack: MediaParserOnVideoTrack | null;
	onAudioTrack: MediaParserOnAudioTrack | null;
	registerVideoSampleCallback: CallbacksState['registerVideoSampleCallback'];
	registerAudioSampleCallback: CallbacksState['registerAudioSampleCallback'];
};

export type OnlyIfMdatAtomExpected = {
	mediaSectionState: MediaSectionState;
};

type ProcessBoxResult =
	| {
			type: 'box';
			box: IsoBaseMediaBox;
	  }
	| {
			type: 'nothing';
	  }
	| {
			type: 'fetch-more-data';
			bytesNeeded: FetchMoreData;
	  };

export const processBox = async ({
	iterator,
	logLevel,
	onlyIfMoovAtomExpected,
	onlyIfMdatAtomExpected,
	contentLength,
}: {
	iterator: BufferIterator;
	logLevel: MediaParserLogLevel;
	onlyIfMoovAtomExpected: OnlyIfMoovAtomExpected | null;
	onlyIfMdatAtomExpected: OnlyIfMdatAtomExpected | null;
	contentLength: number;
}): Promise<ProcessBoxResult> => {
	const fileOffset = iterator.counter.getOffset();
	const {returnToCheckpoint} = iterator.startCheckpoint();
	const bytesRemaining = iterator.bytesRemaining();

	const startOff = iterator.counter.getOffset();
	const boxSizeRaw = iterator.getFourByteNumber();

	if (boxSizeRaw === 0) {
		return {
			type: 'box',
			box: {
				type: 'void-box',
				boxSize: 0,
			},
		};
	}

	// If `boxSize === 1`, the 8 bytes after the box type are the size of the box.
	if (
		(boxSizeRaw === 1 && iterator.bytesRemaining() < 12) ||
		iterator.bytesRemaining() < 4
	) {
		iterator.counter.decrement(iterator.counter.getOffset() - fileOffset);
		throw new Error(
			`Expected box size of ${bytesRemaining}, got ${boxSizeRaw}. Incomplete boxes are not allowed.`,
		);
	}

	const maxSize = contentLength - startOff;
	const boxType = iterator.getByteString(4, false);
	const boxSizeUnlimited =
		boxSizeRaw === 1 ? iterator.getEightByteNumber() : boxSizeRaw;
	const boxSize = Math.min(boxSizeUnlimited, maxSize);
	const headerLength = iterator.counter.getOffset() - startOff;

	if (boxType === 'mdat') {
		if (!onlyIfMdatAtomExpected) {
			return {type: 'nothing'};
		}

		const {mediaSectionState} = onlyIfMdatAtomExpected;
		mediaSectionState.addMediaSection({
			size: boxSize - headerLength,
			start: iterator.counter.getOffset(),
		});

		return {type: 'nothing'};
	}

	if (bytesRemaining < boxSize) {
		returnToCheckpoint();
		return {
			type: 'fetch-more-data',
			bytesNeeded: makeFetchMoreData(boxSize - bytesRemaining),
		};
	}

	if (boxType === 'ftyp') {
		return {
			type: 'box',
			box: parseFtyp({iterator, size: boxSize, offset: fileOffset}),
		};
	}

	if (boxType === 'elst') {
		return {
			type: 'box',
			box: parseElst({
				iterator,
				size: boxSize,
				offset: fileOffset,
			}),
		};
	}

	if (boxType === 'colr') {
		return {
			type: 'box',
			box: parseColorParameterBox({
				iterator,
				size: boxSize,
			}),
		};
	}

	if (boxType === 'mvhd') {
		const mvhdBox = parseMvhd({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		if (!onlyIfMoovAtomExpected) {
			throw new Error('State is required');
		}

		onlyIfMoovAtomExpected.movieTimeScaleState.setTrackTimescale(
			mvhdBox.timeScale,
		);
		return {
			type: 'box',
			box: mvhdBox,
		};
	}

	if (boxType === 'tkhd') {
		return {
			type: 'box',
			box: parseTkhd({iterator, offset: fileOffset, size: boxSize}),
		};
	}

	if (boxType === 'trun') {
		return {
			type: 'box',
			box: parseTrun({iterator, offset: fileOffset, size: boxSize}),
		};
	}

	if (boxType === 'tfdt') {
		return {
			type: 'box',
			box: parseTfdt({iterator, size: boxSize, offset: fileOffset}),
		};
	}

	if (boxType === 'stsd') {
		return {
			type: 'box',
			box: await parseStsd({
				offset: fileOffset,
				size: boxSize,
				iterator,
				logLevel,
				contentLength,
			}),
		};
	}

	if (boxType === 'stsz') {
		return {
			type: 'box',
			box: parseStsz({
				iterator,
				offset: fileOffset,
				size: boxSize,
			}),
		};
	}

	if (boxType === 'stco' || boxType === 'co64') {
		return {
			type: 'box',
			box: parseStco({
				iterator,
				offset: fileOffset,
				size: boxSize,
				mode64Bit: boxType === 'co64',
			}),
		};
	}

	if (boxType === 'pasp') {
		return {
			type: 'box',
			box: parsePasp({
				iterator,
				offset: fileOffset,
				size: boxSize,
			}),
		};
	}

	if (boxType === 'stss') {
		return {
			type: 'box',
			box: parseStss({
				iterator,
				offset: fileOffset,
				boxSize,
			}),
		};
	}

	if (boxType === 'ctts') {
		return {
			type: 'box',
			box: parseCtts({
				iterator,
				offset: fileOffset,
				size: boxSize,
			}),
		};
	}

	if (boxType === 'stsc') {
		return {
			type: 'box',
			box: parseStsc({
				iterator,
				offset: fileOffset,
				size: boxSize,
			}),
		};
	}

	if (boxType === 'mebx') {
		return {
			type: 'box',
			box: await parseMebx({
				offset: fileOffset,
				size: boxSize,
				iterator,
				logLevel,
				contentLength,
			}),
		};
	}

	if (boxType === 'hdlr') {
		return {
			type: 'box',
			box: await parseHdlr({iterator, size: boxSize, offset: fileOffset}),
		};
	}

	if (boxType === 'keys') {
		return {
			type: 'box',
			box: await parseKeys({iterator, size: boxSize, offset: fileOffset}),
		};
	}

	if (boxType === 'ilst') {
		return {
			type: 'box',
			box: await parseIlstBox({
				iterator,
				offset: fileOffset,
				size: boxSize,
			}),
		};
	}

	if (boxType === 'tfra') {
		return {
			type: 'box',
			box: await parseTfraBox({
				iterator,
				offset: fileOffset,
				size: boxSize,
			}),
		};
	}

	if (boxType === 'moov') {
		if (!onlyIfMoovAtomExpected) {
			throw new Error('State is required');
		}

		const {tracks, isoState} = onlyIfMoovAtomExpected;
		if (tracks.hasAllTracks()) {
			iterator.discard(boxSize - 8);
			return {type: 'nothing'};
		}

		if (
			isoState &&
			isoState.moov.getMoovBoxAndPrecomputed() &&
			!isoState.moov.getMoovBoxAndPrecomputed()?.precomputed
		) {
			Log.verbose(logLevel, 'Moov box already parsed, skipping');
			iterator.discard(boxSize - 8);
			return {type: 'nothing'};
		}

		const box = await parseMoov({
			offset: fileOffset,
			size: boxSize,
			onlyIfMoovAtomExpected,
			iterator,
			logLevel,
			contentLength,
		});

		tracks.setIsDone(logLevel);

		return {type: 'box', box};
	}

	if (boxType === 'trak') {
		if (!onlyIfMoovAtomExpected) {
			throw new Error('State is required');
		}

		const {tracks, onAudioTrack, onVideoTrack} = onlyIfMoovAtomExpected;

		const trakBox = await parseTrak({
			size: boxSize,
			offsetAtStart: fileOffset,
			iterator,
			logLevel,
			contentLength,
		});

		const movieTimeScale =
			onlyIfMoovAtomExpected.movieTimeScaleState.getTrackTimescale();
		if (movieTimeScale === null) {
			throw new Error('Movie timescale is not set');
		}

		const editList = findTrackStartTimeInSeconds({movieTimeScale, trakBox});
		const transformedTrack = makeBaseMediaTrack(trakBox, editList);

		if (transformedTrack && transformedTrack.type === 'video') {
			await registerVideoTrack({
				track: transformedTrack,
				container: 'mp4',
				logLevel,
				onVideoTrack,
				registerVideoSampleCallback:
					onlyIfMoovAtomExpected.registerVideoSampleCallback,
				tracks,
			});
		}

		if (transformedTrack && transformedTrack.type === 'audio') {
			await registerAudioTrack({
				track: transformedTrack,
				container: 'mp4',
				registerAudioSampleCallback:
					onlyIfMoovAtomExpected.registerAudioSampleCallback,
				tracks,
				logLevel,
				onAudioTrack,
			});
		}

		return {type: 'box', box: trakBox};
	}

	if (boxType === 'stts') {
		return {
			type: 'box',
			box: parseStts({
				data: iterator,
				size: boxSize,
				fileOffset,
			}),
		};
	}

	if (boxType === 'avcC') {
		return {
			type: 'box',
			box: parseAvcc({
				data: iterator,
				size: boxSize,
			}),
		};
	}

	if (boxType === 'vpcC') {
		return {
			type: 'box',
			box: parseVpcc({data: iterator, size: boxSize}),
		};
	}

	if (boxType === 'av1C') {
		return {
			type: 'box',
			box: parseAv1C({
				data: iterator,
				size: boxSize,
			}),
		};
	}

	if (boxType === 'hvcC') {
		return {
			type: 'box',
			box: parseHvcc({
				data: iterator,
				size: boxSize,
				offset: fileOffset,
			}),
		};
	}

	if (boxType === 'tfhd') {
		return {
			type: 'box',
			box: getTfhd({
				iterator,
				offset: fileOffset,
				size: boxSize,
			}),
		};
	}

	if (boxType === 'mdhd') {
		return {
			type: 'box',
			box: parseMdhd({
				data: iterator,
				size: boxSize,
				fileOffset,
			}),
		};
	}

	if (boxType === 'esds') {
		return {
			type: 'box',
			box: parseEsds({
				data: iterator,
				size: boxSize,
				fileOffset,
			}),
		};
	}

	if (boxType === 'trex') {
		return {
			type: 'box',
			box: parseTrex({iterator, offset: fileOffset, size: boxSize}),
		};
	}

	if (boxType === 'moof') {
		await onlyIfMoovAtomExpected?.isoState?.mfra.triggerLoad();
	}

	if (
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'udta' ||
		boxType === 'moof' ||
		boxType === 'dims' ||
		boxType === 'meta' ||
		boxType === 'wave' ||
		boxType === 'traf' ||
		boxType === 'mfra' ||
		boxType === 'edts' ||
		boxType === 'mvex' ||
		boxType === 'stsb'
	) {
		const children = await getIsoBaseMediaChildren({
			iterator,
			size: boxSize - 8,
			logLevel,
			onlyIfMoovAtomExpected,
			contentLength,
		});

		return {
			type: 'box',
			box: {
				type: 'regular-box',
				boxType,
				boxSize,
				children,
				offset: fileOffset,
			},
		};
	}

	iterator.discard(boxSize - 8);

	Log.verbose(logLevel, 'Unknown ISO Base Media Box:', boxType);

	return {
		type: 'box',
		box: {
			type: 'regular-box',
			boxType,
			boxSize,
			children: [],
			offset: fileOffset,
		},
	};
};
