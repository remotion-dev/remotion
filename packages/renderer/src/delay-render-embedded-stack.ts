import {DELAY_RENDER_CALLSTACK_TOKEN} from 'remotion';
import {parseStack} from './parse-browser-error-stack';
import {symbolicateStackTrace} from './symbolicate-stacktrace';

export const parseDelayRenderEmbeddedStack = (message: string) => {
	const index = message.indexOf(DELAY_RENDER_CALLSTACK_TOKEN);
	if (index === -1) {
		return null;
	}

	const msg = message
		.substring(index + DELAY_RENDER_CALLSTACK_TOKEN.length)
		.trim();

	const parsed = parseStack(msg.split('\n'));

	try {
		return symbolicateStackTrace(parsed);
	} catch (err) {
		console.warn('error symbolicating delayRender() stack: ' + err);
		return null;
	}
};
