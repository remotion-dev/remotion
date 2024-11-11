import type {ParserState} from './parser-state';
import type {OnAudioTrack, OnVideoTrack} from './webcodec-sample-types';

export type ParserContext = {
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	canSkipVideoData: boolean;
	parserState: ParserState;
	nullifySamples: boolean;
	supportsContentRange: boolean;
};
