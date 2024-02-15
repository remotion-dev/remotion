import {NoReactInternals} from 'remotion/no-react';
import type {UnsymbolicatedStackFrame} from './parse-browser-error-stack';
import {parseStack} from './parse-browser-error-stack';

export const parseDelayRenderEmbeddedStack = (
	message: string,
): UnsymbolicatedStackFrame[] | null => {
	const index = message.indexOf(NoReactInternals.DELAY_RENDER_CALLSTACK_TOKEN);
	if (index === -1) {
		return null;
	}

	const msg = message
		.substring(index + NoReactInternals.DELAY_RENDER_CALLSTACK_TOKEN.length)
		.trim();

	const parsed = parseStack(msg.split('\n'));
	return parsed;
};
