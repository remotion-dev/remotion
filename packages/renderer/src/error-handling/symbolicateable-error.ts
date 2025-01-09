/**
 * A symbolicateable error is an error that can be symolicated by fetching the original sources. By throwing a symbolicateable error, Remotion CLI will attempt to symplicate it
 */

import {parseDelayRenderEmbeddedStack} from '../delay-render-embedded-stack';
import type {UnsymbolicatedStackFrame} from '../parse-browser-error-stack';

export class SymbolicateableError extends Error {
	stackFrame: UnsymbolicatedStackFrame[] | null;
	delayRenderCall: UnsymbolicatedStackFrame[] | null;
	frame: number | null;
	chunk: number | null;

	constructor({
		message,
		stack,
		stackFrame,
		frame,
		name,
		chunk,
	}: {
		message: string;
		stack: string | undefined;
		frame: number | null;
		name: string;
		stackFrame: UnsymbolicatedStackFrame[] | null;
		chunk: number | null;
	}) {
		super(message);
		this.stack = stack;
		this.stackFrame = stackFrame;
		this.frame = frame;
		this.chunk = chunk;
		this.name = name;
		this.delayRenderCall = stack ? parseDelayRenderEmbeddedStack(stack) : null;
	}
}
