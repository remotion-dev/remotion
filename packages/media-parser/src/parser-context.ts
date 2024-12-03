import type {ParserState} from './state/parser-state';
import type {OnAudioTrack, OnVideoTrack} from './webcodec-sample-types';

export type ParserContext = {
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	parserState: ParserState;
	nullifySamples: boolean;
	supportsContentRange: boolean;
	nextTrackIndex: number;
};
