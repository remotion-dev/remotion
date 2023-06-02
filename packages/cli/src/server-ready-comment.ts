import {Log} from './log';

let message: string | null = null;

export const setServerReadyComment = (newMessage: string) => {
	message = newMessage;
};

export const printServerReadyComment = () => {
	Log.info(message);
};
