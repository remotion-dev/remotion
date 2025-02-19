import type {
	LogLevel,
	MediaParserContainer,
	VideoTrack,
} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './get-available-containers';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import type {ResizeOperation} from './resizing/mode';

export type VideoOperation =
	| {
			type: 'reencode';
			videoCodec: ConvertMediaVideoCodec;
			rotate?: number;
			resize?: ResizeOperation | null;
	  }
	| {type: 'copy'}
	| {type: 'drop'}
	| {type: 'fail'};

export type ConvertMediaOnVideoTrackHandler = (options: {
	defaultVideoCodec: ConvertMediaVideoCodec | null;
	track: VideoTrack;
	logLevel: LogLevel;
	outputContainer: ConvertMediaContainer;
	rotate: number;
	resizeOperation: ResizeOperation | null;
	inputContainer: MediaParserContainer;
	canCopyTrack: boolean;
}) => VideoOperation | Promise<VideoOperation>;
