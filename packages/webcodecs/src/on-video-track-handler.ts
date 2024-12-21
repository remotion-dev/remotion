import type {
	LogLevel,
	ParseMediaContainer,
	VideoTrack,
} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './get-available-containers';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import type {ResizingOperation} from './resizing/mode';

export type VideoOperation =
	| {
			type: 'reencode';
			videoCodec: ConvertMediaVideoCodec;
			rotate?: number;
			// TODO: Make this optional
			resize: ResizingOperation | null;
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
	resizeOperation: ResizingOperation | null;
	inputContainer: ParseMediaContainer;
	canCopyTrack: boolean;
}) => VideoOperation | Promise<VideoOperation>;
