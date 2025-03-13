import type {
	AudioTrack,
	LogLevel,
	MediaParserContainer,
} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import type {ConvertMediaContainer} from './get-available-containers';

export type AudioOperation =
	| {type: 'reencode'; bitrate: number; audioCodec: ConvertMediaAudioCodec}
	| {type: 'copy'}
	| {type: 'fail'}
	| {type: 'drop'};

export type ConvertMediaOnAudioTrackHandler = (options: {
	track: AudioTrack;
	defaultAudioCodec: ConvertMediaAudioCodec | null;
	logLevel: LogLevel;
	outputContainer: ConvertMediaContainer;
	inputContainer: MediaParserContainer;
	canCopyTrack: boolean;
}) => AudioOperation | Promise<AudioOperation>;
