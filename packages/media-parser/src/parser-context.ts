import type {
	OnAudioSample,
	OnVideoSample,
} from './boxes/iso-base-media/mdat/mdat';
import type {OnAudioTrack, OnVideoTrack} from './options';
import type {ParserState} from './parser-state';

export type ParserContext = {
	onAudioSample: OnAudioSample | null;
	onVideoSample: OnVideoSample | null;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	canSkipVideoData: boolean;
	parserState: ParserState;
};
