import type {LogLevel, VideoTrack} from '@remotion/media-parser';
import type {ConvertMediaContainer, ConvertMediaVideoCodec} from './codec-id';

export type VideoOperation =
	| {type: 'reencode'; videoCodec: ConvertMediaVideoCodec}
	| {type: 'copy'}
	| {type: 'drop'}
	| {type: 'fail'};

export type ConvertMediaOnVideoTrackHandler = (options: {
	defaultVideoCodec: ConvertMediaVideoCodec | null;
	track: VideoTrack;
	logLevel: LogLevel;
	container: ConvertMediaContainer;
}) => VideoOperation | Promise<VideoOperation>;
