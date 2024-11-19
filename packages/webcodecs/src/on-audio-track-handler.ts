import type {AudioTrack, LogLevel} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec, ConvertMediaContainer} from './codec-id';

export type AudioOperation =
	| {type: 'reencode'; bitrate: number; audioCodec: ConvertMediaAudioCodec}
	| {type: 'copy'}
	| {type: 'fail'}
	| {type: 'drop'};

export type ConvertMediaOnAudioTrackHandler = (options: {
	track: AudioTrack;
	defaultAudioCodec: ConvertMediaAudioCodec | null;
	logLevel: LogLevel;
	container: ConvertMediaContainer;
}) => AudioOperation | Promise<AudioOperation>;
