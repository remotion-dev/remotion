import {Log} from './log';

let message: string | null = null;

export const setServerReadyComment = (newMessage: string) => {
	message = newMessage;
};

export const printServerReadyComment = (prefix: string) => {
	Log.info(`${prefix} - ${message}`);
};
