import type {OnLog} from './browser/BrowserPage';
import {Log} from './logger';

export const defaultOnLog: OnLog = ({logLevel, tag, previewString}) => {
	Log[logLevel]({logLevel, tag, indent: false}, previewString);
};
