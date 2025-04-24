import {getSeekingByteForAac} from './containers/aac/get-seeking-byte';
import {getSeekingByteForFlac} from './containers/flac/get-seeking-byte';
import {getSeekingByteFromIsoBaseMedia} from './containers/iso-base-media/get-seeking-byte';
import {getSeekingByteForM3u8} from './containers/m3u/get-seeking-byte';
import {getSeekingByteForMp3} from './containers/mp3/get-seeking-byte';
import {getSeekingByteForRiff} from './containers/riff/get-seeking-byte';
import {getSeekingByteFromWav} from './containers/wav/get-seeking-byte';
import {getSeekingByteFromMatroska} from './containers/webm/seek/get-seeking-byte';
import type {LogLevel} from './log';
import type {IsoBaseMediaStructure} from './parse-result';
import type {SeekingHints} from './seeking-hints';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {WebmState} from './state/matroska/webm';
import type {RiffState} from './state/riff';
import type {StructureState} from './state/structure';
import {getLastKeyFrameBeforeTimeInSeconds} from './state/transport-stream/observed-pes-header';
import type {TransportStreamState} from './state/transport-stream/transport-stream';
import type {MediaSectionState} from './state/video-section';
import type {SeekResolution} from './work-on-seek-request';

export const getSeekingByte = ({
	info,
	time,
	logLevel,
	currentPosition,
	isoState,
	transportStream,
	webmState,
	mediaSection,
	mp4HeaderSegment,
	structure,
	riffState,
}: {
	info: SeekingHints;
	time: number;
	logLevel: LogLevel;
	currentPosition: number;
	isoState: IsoBaseMediaState;
	transportStream: TransportStreamState;
	webmState: WebmState;
	mediaSection: MediaSectionState;
	structure: StructureState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	riffState: RiffState;
}): Promise<SeekResolution> => {
	if (info.type === 'iso-base-media-seeking-hints') {
		return getSeekingByteFromIsoBaseMedia({
			info,
			time,
			logLevel,
			currentPosition,
			isoState,
			mp4HeaderSegment,
			structure,
		});
	}

	if (info.type === 'wav-seeking-hints') {
		return getSeekingByteFromWav({
			info,
			time,
		});
	}

	if (info.type === 'webm-seeking-hints') {
		return getSeekingByteFromMatroska({
			info,
			time,
			webmState,
			logLevel,
			mediaSection,
		});
	}

	if (info.type === 'flac-seeking-hints') {
		const byte = getSeekingByteForFlac({
			seekingHints: info,
			time,
		});
		if (byte) {
			return Promise.resolve({
				type: 'do-seek',
				byte,
			});
		}

		return Promise.resolve({
			type: 'valid-but-must-wait',
		});
	}

	if (info.type === 'transport-stream-seeking-hints') {
		const lastKeyframeBeforeTimeInSeconds = getLastKeyFrameBeforeTimeInSeconds({
			observedPesHeaders: info.observedPesHeaders,
			timeInSeconds: time,
			ptsStartOffset: info.ptsStartOffset,
		});

		const byte = lastKeyframeBeforeTimeInSeconds?.offset ?? 0;

		transportStream.resetBeforeSeek();
		return Promise.resolve({
			type: 'do-seek',
			byte,
		});
	}

	if (info.type === 'riff-seeking-hints') {
		return getSeekingByteForRiff({
			info,
			time,
			riffState,
		});
	}

	if (info.type === 'mp3-seeking-hints') {
		return Promise.resolve(
			getSeekingByteForMp3({
				info,
				time,
			}),
		);
	}

	if (info.type === 'aac-seeking-hints') {
		return Promise.resolve(
			getSeekingByteForAac({
				time,
				seekingHints: info,
			}),
		);
	}

	if (info.type === 'm3u8-seeking-hints') {
		return Promise.resolve(
			getSeekingByteForM3u8({
				time,
				seekingHints: info,
			}),
		);
	}

	throw new Error(`Unknown seeking info type: ${info satisfies never}`);
};
