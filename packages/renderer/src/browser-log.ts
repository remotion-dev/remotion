import type {
	ConsoleMessageLocation,
	ConsoleMessageType,
} from './browser/ConsoleMessage';

export type BrowserLog = {
	text: string;
	stackTrace: ConsoleMessageLocation[];
	type: ConsoleMessageType;
};
