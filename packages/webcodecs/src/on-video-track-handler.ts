import type {
	LogLevel,
	ParseMediaContainer,
	VideoTrack,
} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './get-available-containers';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';

export type VideoOperation =
	| {type: 'reencode'; videoCodec: ConvertMediaVideoCodec; rotate?: number}
	| {type: 'copy'}
	| {type: 'drop'}
	| {type: 'fail'};

export type ConvertMediaOnVideoTrackHandler = (options: {
	defaultVideoCodec: ConvertMediaVideoCodec | null;
	track: VideoTrack;
	logLevel: LogLevel;
	outputContainer: ConvertMediaContainer;
	rotate: number;
	inputContainer: ParseMediaContainer;
	canCopyTrack: boolean;
}) => VideoOperation | Promise<VideoOperation>;
