import type {LogLevel} from '../../log';
import type {WebmState} from '../../state/matroska/webm';
import type {ParserState} from '../../state/parser-state';
import type {SampleCallbacks} from '../../state/sample-callbacks';
import type {StructureState} from '../../state/structure';
import type {OnAudioTrack, OnVideoTrack} from '../../webcodec-sample-types';

export type WebmRequiredStatesForProcessing = {
	webmState: WebmState;
	callbacks: SampleCallbacks;
	logLevel: LogLevel;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
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
