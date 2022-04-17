import {DELAY_RENDER_CALLSTACK_TOKEN} from 'remotion';
import {
	parseStack,
	UnsymbolicatedStackFrame,
} from './parse-browser-error-stack';

export const parseDelayRenderEmbeddedStack = (
	message: string
): UnsymbolicatedStackFrame[] | null => {
	const index = message.indexOf(DELAY_RENDER_CALLSTACK_TOKEN);
	if (index === -1) {
		return null;
	}

	const msg = message
		.substring(index + DELAY_RENDER_CALLSTACK_TOKEN.length)
		.trim();

	const parsed = parseStack(msg.split('\n'));
	return parsed;
};
