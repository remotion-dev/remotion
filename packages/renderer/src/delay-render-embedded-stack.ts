import {Internals} from 'remotion';
import type {UnsymbolicatedStackFrame} from './parse-browser-error-stack';
import {parseStack} from './parse-browser-error-stack';

export const parseDelayRenderEmbeddedStack = (
	message: string
): UnsymbolicatedStackFrame[] | null => {
	const index = message.indexOf(Internals.DELAY_RENDER_CALLSTACK_TOKEN);
	if (index === -1) {
		return null;
	}

	const msg = message
		.substring(index + Internals.DELAY_RENDER_CALLSTACK_TOKEN.length)
		.trim();

	const parsed = parseStack(msg.split('\n'));
	return parsed;
};
