/**
 * A symbolicateable error is an error that can be symolicated by fetching the original sources. By throwing a symbolicateable error, Remotion CLI will attempt to symplicate it
 */

import type {Page} from '../browser/BrowserPage';
import {parseDelayRenderEmbeddedStack} from '../delay-render-embedded-stack';
import type {UnsymbolicatedStackFrame} from '../parse-browser-error-stack';

export class SymbolicateableError extends Error {
	stackFrame: UnsymbolicatedStackFrame[] | null;
	delayRenderCall: UnsymbolicatedStackFrame[] | null;
	frame: number | null;
	page: Page | null;

	constructor({
		message,
		stack,
		stackFrame,
		frame,
		name,
		page,
	}: {
		message: string;
		stack: string | undefined;
		frame: number | null;
		name: string;
		stackFrame: UnsymbolicatedStackFrame[] | null;
		page: Page | null;
	}) {
		super(message);
		this.stack = stack;
		this.stackFrame = stackFrame;
		this.frame = frame;
		this.name = name;
		this.page = page;
		this.delayRenderCall = stack ? parseDelayRenderEmbeddedStack(stack) : null;
	}
}
