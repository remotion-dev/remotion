import type {MediaParserLogLevel} from '../../log';
import type {WebmState} from '../../state/matroska/webm';
import type {ParserState} from '../../state/parser-state';
import type {CallbacksState} from '../../state/sample-callbacks';
import type {StructureState} from '../../state/structure';
import type {
	MediaParserOnAudioTrack,
	MediaParserOnVideoTrack,
} from '../../webcodec-sample-types';

export type WebmRequiredStatesForProcessing = {
	webmState: WebmState;
	callbacks: CallbacksState;
	logLevel: MediaParserLogLevel;
	onAudioTrack: MediaParserOnAudioTrack | null;
	onVideoTrack: MediaParserOnVideoTrack | null;
	structureState: StructureState;
};

export const selectStatesForProcessing = ({
	callbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	structure,
	webm,
}: ParserState): WebmRequiredStatesForProcessing => {
	return {
		webmState: webm,
		callbacks,
		logLevel,
		onAudioTrack,
		onVideoTrack,
		structureState: structure,
	};
};
