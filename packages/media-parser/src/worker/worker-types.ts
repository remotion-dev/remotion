import type {
	M3uAssociatedPlaylist,
	M3uStream,
} from '../containers/m3u/get-streams';
import type {
	SelectM3uAssociatedPlaylistsFnOptions,
	SelectM3uStreamFnOptions,
} from '../containers/m3u/select-stream';
import type {ImageType} from '../errors';
import type {Options, ParseMediaFields} from '../fields';
import type {MediaParserDimensions} from '../get-dimensions';
import type {MediaParserLocation} from '../get-location';
import type {
	MediaParserAudioCodec,
	MediaParserTrack,
	MediaParserVideoCodec,
} from '../get-tracks';
import type {MediaParserMetadataEntry} from '../metadata/get-metadata';
import type {
	MediaParserContainer,
	MediaParserKeyframe,
	ParseMediaProgress,
	ParseMediaResult,
	ParseMediaSrc,
	SerializeableOptionalParseMediaParams,
} from '../options';
import type {MediaParserStructureUnstable} from '../parse-result';
import type {SeekingHints} from '../seeking-hints';
import type {MediaParserEmbeddedImage} from '../state/images';
import type {InternalStats} from '../state/parser-state';
import type {
	MediaParserAudioSample,
	MediaParserOnAudioTrackParams,
	MediaParserOnVideoTrackParams,
	MediaParserVideoSample,
} from '../webcodec-sample-types';
import type {SeekResolution} from '../work-on-seek-request';

export type ParseMediaOnWorkerPayload = {
	type: 'request-worker';
	src: ParseMediaSrc;
	payload: Partial<
		SerializeableOptionalParseMediaParams<Options<ParseMediaFields>>
	>;
	postAudioCodec: boolean;
	postContainer: boolean;
	postDimensions: boolean;
	postUnrotatedDimensions: boolean;
	postVideoCodec: boolean;
	postFps: boolean;
	postImages: boolean;
	postInternalStats: boolean;
	postIsHdr: boolean;
	postKeyframes: boolean;
	postLocation: boolean;
	postM3uStreams: boolean;
	postMetadata: boolean;
	postMimeType: boolean;
	postName: boolean;
	postNumberOfAudioChannels: boolean;
	postRotation: boolean;
	postSampleRate: boolean;
	postSize: boolean;
	postSlowAudioBitrate: boolean;
	postSlowDurationInSeconds: boolean;
	postSlowFps: boolean;
	postSlowKeyframes: boolean;
	postSlowNumberOfFrames: boolean;
	postSlowVideoBitrate: boolean;
	postSlowStructure: boolean;
	postTracks: boolean;
	postDurationInSeconds: boolean;
	postParseProgress: boolean;
	postM3uStreamSelection: boolean;
	postM3uAssociatedPlaylistsSelection: boolean;
	postOnAudioTrack: boolean;
	postOnVideoTrack: boolean;
};

type RequestPause = {
	type: 'request-pause';
};

type RequestSeek = {
	type: 'request-seek';
	payload: number;
};

type RequestResume = {
	type: 'request-resume';
};

type RequestGetSeekingHints = {
	type: 'request-get-seeking-hints';
};

type RequestSimulateSeek = {
	type: 'request-simulate-seek';
	payload: number;
	nonce: string;
};

type RequestAbort = {
	type: 'request-abort';
};

type ResponseDone = {
	type: 'response-done';
	payload: ParseMediaResult<Options<ParseMediaFields>>;
	seekingHints: SeekingHints | null;
};

type ResponseGetSeekingHints = {
	type: 'response-get-seeking-hints';
	payload: SeekingHints;
};

type ResponseSimulateSeek = {
	type: 'response-simulate-seek';
	nonce: string;
	payload: SeekResolution;
};

type BaseError = {
	errorStack: string;
	errorMessage: string;
};

type AbortError = BaseError & {
	errorName: 'AbortError';
};

type GenericError = BaseError & {
	errorName: 'Error';
};

type NotReadableError = BaseError & {
	errorName: 'NotReadableError';
};

type TypeError = BaseError & {
	errorName: 'TypeError';
};

type IsAnImageError = BaseError & {
	errorName: 'IsAnImageError';
	imageType: ImageType;
	dimensions: MediaParserDimensions | null;
	mimeType: string | null;
	sizeInBytes: number | null;
	fileName: string | null;
};

type IsAPdfError = BaseError & {
	errorName: 'IsAPdfError';
	mimeType: string | null;
	sizeInBytes: number | null;
	fileName: string | null;
};

type IsAnUnsupportedFileTypeError = BaseError & {
	errorName: 'IsAnUnsupportedFileTypeError';
	mimeType: string | null;
	sizeInBytes: number | null;
	fileName: string | null;
};

type MediaParserAbortError = BaseError & {
	errorName: 'MediaParserAbortError';
	seekingHints: SeekingHints | null;
};

type AnyError =
	| GenericError
	| IsAnImageError
	| IsAPdfError
	| IsAnUnsupportedFileTypeError
	| MediaParserAbortError
	// browser native errors
	| AbortError
	| NotReadableError
	| TypeError;

export type ResponseError = {
	type: 'response-error';
} & AnyError;

export type ResponseCallbackPayload =
	| {
			callbackType: 'audio-codec';
			value: MediaParserAudioCodec | null;
	  }
	| {
			callbackType: 'container';
			value: MediaParserContainer;
	  }
	| {
			callbackType: 'dimensions';
			value: MediaParserDimensions | null;
	  }
	| {
			callbackType: 'unrotated-dimensions';
			value: MediaParserDimensions | null;
	  }
	| {
			callbackType: 'video-codec';
			value: MediaParserVideoCodec | null;
	  }
	| {
			callbackType: 'fps';
			value: number | null;
	  }
	| {
			callbackType: 'images';
			value: MediaParserEmbeddedImage[];
	  }
	| {
			callbackType: 'internal-stats';
			value: InternalStats;
	  }
	| {
			callbackType: 'is-hdr';
			value: boolean;
	  }
	| {
			callbackType: 'keyframes';
			value: MediaParserKeyframe[] | null;
	  }
	| {
			callbackType: 'location';
			value: MediaParserLocation | null;
	  }
	| {
			callbackType: 'm3u-streams';
			value: M3uStream[] | null;
	  }
	| {
			callbackType: 'metadata';
			value: MediaParserMetadataEntry[];
	  }
	| {
			callbackType: 'mime-type';
			value: string | null;
	  }
	| {
			callbackType: 'name';
			value: string;
	  }
	| {
			callbackType: 'number-of-audio-channels';
			value: number | null;
	  }
	| {
			callbackType: 'rotation';
			value: number | null;
	  }
	| {
			callbackType: 'sample-rate';
			value: number | null;
	  }
	| {
			callbackType: 'size';
			value: number | null;
	  }
	| {
			callbackType: 'slow-audio-bitrate';
			value: number | null;
	  }
	| {
			callbackType: 'slow-duration-in-seconds';
			value: number;
	  }
	| {
			callbackType: 'slow-fps';
			value: number;
	  }
	| {
			callbackType: 'slow-keyframes';
			value: MediaParserKeyframe[];
	  }
	| {
			callbackType: 'slow-number-of-frames';
			value: number;
	  }
	| {
			callbackType: 'slow-video-bitrate';
			value: number | null;
	  }
	| {
			callbackType: 'slow-structure';
			value: MediaParserStructureUnstable;
	  }
	| {
			callbackType: 'tracks';
			value: MediaParserTrack[];
	  }
	| {
			callbackType: 'unrotated-dimensions';
			value: MediaParserDimensions | null;
	  }
	| {
			callbackType: 'video-codec';
			value: MediaParserVideoCodec | null;
	  }
	| {
			callbackType: 'duration-in-seconds';
			value: number | null;
	  }
	| {
			callbackType: 'parse-progress';
			value: ParseMediaProgress;
	  }
	| {
			callbackType: 'm3u-stream-selection';
			value: SelectM3uStreamFnOptions;
	  }
	| {
			callbackType: 'on-audio-track';
			value: MediaParserOnAudioTrackParams;
	  }
	| {
			callbackType: 'on-video-track';
			value: MediaParserOnVideoTrackParams;
	  }
	| {
			callbackType: 'on-audio-sample';
			value: MediaParserAudioSample;
			trackId: number;
	  }
	| {
			callbackType: 'on-video-sample';
			value: MediaParserVideoSample;
			trackId: number;
	  }
	| {
			callbackType: 'track-done';
			trackId: number;
	  }
	| {
			callbackType: 'm3u-associated-playlists-selection';
			value: SelectM3uAssociatedPlaylistsFnOptions;
	  };

export type ResponseOnCallbackRequest = {
	type: 'response-on-callback-request';
	nonce: string;
	payload: ResponseCallbackPayload;
};

export type AcknowledgePayload =
	| {
			payloadType: 'void';
	  }
	| {
			payloadType: 'm3u-stream-selection';
			value: number;
	  }
	| {
			payloadType: 'm3u-associated-playlists-selection';
			value: M3uAssociatedPlaylist[];
	  }
	| {
			payloadType: 'on-audio-track-response';
			registeredCallback: boolean;
	  }
	| {
			payloadType: 'on-video-track-response';
			registeredCallback: boolean;
	  }
	| {
			payloadType: 'on-sample-response';
			registeredTrackDoneCallback: boolean;
	  };

export type AcknowledgeCallback = {
	type: 'acknowledge-callback';
	nonce: string;
} & AcknowledgePayload;

export type SignalErrorInCallback = {
	type: 'signal-error-in-callback';
	nonce: string;
};

export type WorkerRequestPayload =
	| ParseMediaOnWorkerPayload
	| RequestResume
	| RequestPause
	| RequestAbort
	| RequestSeek
	| RequestGetSeekingHints
	| RequestSimulateSeek
	| AcknowledgeCallback
	| SignalErrorInCallback;

export type WorkerResponsePayload =
	| ResponseDone
	| ResponseError
	| ResponseOnCallbackRequest
	| ResponseGetSeekingHints
	| ResponseSimulateSeek;
