import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

let message: string | null = null;

export const setServerReadyComment = (newMessage: string) => {
	message = newMessage;
};

export const printServerReadyComment = (prefix: string, logLevel: LogLevel) => {
	RenderInternals.Log.info({indent: false, logLevel}, `${prefix} - ${message}`);
};
