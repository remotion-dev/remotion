import {ConsoleMessageLocation, ConsoleMessageType} from 'puppeteer-core';

export type BrowserLog = {
	text: string;
	stackTrace: ConsoleMessageLocation[];
	type: ConsoleMessageType;
};
