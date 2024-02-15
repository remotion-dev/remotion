import {RenderInternals} from '@remotion/renderer';

let message: string | null = null;

export const setServerReadyComment = (newMessage: string) => {
	message = newMessage;
};

export const printServerReadyComment = (prefix: string) => {
	RenderInternals.Log.info(`${prefix} - ${message}`);
};
