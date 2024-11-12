import type {AudioTrack, LogLevel} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec} from './codec-id';
import type {ConvertMediaContainer} from './convert-media';

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
