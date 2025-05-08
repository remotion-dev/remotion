import type {
	MediaParserAudioTrack,
	MediaParserContainer,
	MediaParserLogLevel,
} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import type {ConvertMediaContainer} from './get-available-containers';

export type AudioOperation =
	| {
			type: 'reencode';
			bitrate: number;
			audioCodec: ConvertMediaAudioCodec;
			sampleRate: number | null;
	  }
	| {type: 'copy'}
	| {type: 'fail'}
	| {type: 'drop'};

export type ConvertMediaOnAudioTrackHandler = (options: {
	track: MediaParserAudioTrack;
	defaultAudioCodec: ConvertMediaAudioCodec | null;
	logLevel: MediaParserLogLevel;
	outputContainer: ConvertMediaContainer;
	inputContainer: MediaParserContainer;
	canCopyTrack: boolean;
}) => AudioOperation | Promise<AudioOperation>;
