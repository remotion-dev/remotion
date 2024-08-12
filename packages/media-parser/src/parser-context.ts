import type {OnAudioTrack, OnVideoTrack} from './options';
import type {ParserState} from './parser-state';

export type ParserContext = {
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	canSkipVideoData: boolean;
	parserState: ParserState;
};
