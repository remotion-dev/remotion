import {getSeekingByteForAac} from './containers/aac/get-seeking-byte';
import {getSeekingByteForFlac} from './containers/flac/get-seeking-byte';
import {getSeekingByteFromIsoBaseMedia} from './containers/iso-base-media/get-seeking-byte';
import {getSeekingByteForM3u8} from './containers/m3u/get-seeking-byte';
import {getSeekingByteForMp3} from './containers/mp3/get-seeking-byte';
import {getSeekingByteForRiff} from './containers/riff/get-seeking-byte';
import {MPEG_TIMESCALE} from './containers/transport-stream/handle-avc-packet';
import {getSeekingByteFromWav} from './containers/wav/get-seeking-byte';
import {getSeekingByteFromMatroska} from './containers/webm/seek/get-seeking-byte';
import type {MediaParserLogLevel} from './log';
import type {M3uPlaylistContext} from './options';
import type {SeekingHints} from './seeking-hints';
import type {AvcState} from './state/avc/avc-state';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {M3uState} from './state/m3u-state';
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
	m3uPlaylistContext,
	structure,
	riffState,
	m3uState,
	avcState,
}: {
	info: SeekingHints;
	time: number;
	logLevel: MediaParserLogLevel;
	currentPosition: number;
	isoState: IsoBaseMediaState;
	transportStream: TransportStreamState;
	webmState: WebmState;
	mediaSection: MediaSectionState;
	structure: StructureState;
	m3uPlaylistContext: M3uPlaylistContext | null;
	riffState: RiffState;
	m3uState: M3uState;
	avcState: AvcState;
}): Promise<SeekResolution> => {
	if (info.type === 'iso-base-media-seeking-hints') {
		return getSeekingByteFromIsoBaseMedia({
			info,
			time,
			logLevel,
			currentPosition,
			isoState,
			structure,
			m3uPlaylistContext,
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
				byte: byte.offset,
				timeInSeconds: byte.timeInSeconds,
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

		if (!lastKeyframeBeforeTimeInSeconds) {
			transportStream.resetBeforeSeek();

			return Promise.resolve({
				type: 'do-seek',
				byte: 0,
				timeInSeconds: 0,
			});
		}

		const byte = lastKeyframeBeforeTimeInSeconds.offset;

		transportStream.resetBeforeSeek();
		return Promise.resolve({
			type: 'do-seek',
			byte,
			timeInSeconds:
				Math.min(
					lastKeyframeBeforeTimeInSeconds.pts,
					lastKeyframeBeforeTimeInSeconds.dts ?? Infinity,
				) / MPEG_TIMESCALE,
		});
	}

	if (info.type === 'riff-seeking-hints') {
		return getSeekingByteForRiff({
			info,
			time,
			riffState,
			avcState,
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
				currentPosition,
				m3uState,
				logLevel,
			}),
		);
	}

	throw new Error(`Unknown seeking info type: ${info satisfies never}`);
};
