import {NoReactInternals} from 'remotion/no-react';
import type {Page} from '../browser/BrowserPage';
import type {CallFrame, ExceptionThrownEvent} from '../browser/devtools-types';
import type {UnsymbolicatedStackFrame} from '../parse-browser-error-stack';
import type {SymbolicatedStackFrame} from '../symbolicate-stacktrace';
import {SymbolicateableError} from './symbolicateable-error';

export class ErrorWithStackFrame extends Error {
	symbolicatedStackFrames: SymbolicatedStackFrame[] | null;
	frame: number | null;
	chunk: number | null;
	name: string;
	delayRenderCall: SymbolicatedStackFrame[] | null;

	constructor({
		message,
		symbolicatedStackFrames,
		frame,
		name,
		delayRenderCall,
		stack,
		chunk,
	}: {
		message: string;
		symbolicatedStackFrames: SymbolicatedStackFrame[] | null;
		frame: number | null;
		chunk: number | null;
		name: string;
		delayRenderCall: SymbolicatedStackFrame[] | null;
		stack: string | undefined;
	}) {
		super(message);
		this.symbolicatedStackFrames = symbolicatedStackFrames;
		this.frame = frame;
		this.chunk = chunk;
		this.name = name;
		this.delayRenderCall = delayRenderCall;
		// If error symbolication did not yield any stack frames, we print the original stack
		this.stack = stack;
	}
}

const cleanUpErrorMessage = (exception: ExceptionThrownEvent) => {
	let errorMessage = exception.exceptionDetails.exception?.description;
	if (!errorMessage) {
		return null;
	}

	const errorType = exception.exceptionDetails.exception?.className as string;
	const prefix = `${errorType}: `;

	if (errorMessage.startsWith(prefix)) {
		errorMessage = errorMessage.substring(prefix.length);
	}

	const frames = exception.exceptionDetails.stackTrace?.callFrames.length ?? 0;
	const split = errorMessage.split('\n');
	return split.slice(0, Math.max(1, split.length - frames)).join('\n');
};

const removeDelayRenderStack = (message: string) => {
	const index = message.indexOf(NoReactInternals.DELAY_RENDER_CALLSTACK_TOKEN);
	if (index === -1) {
		return message;
	}

	return message.substring(0, index);
};

const callFrameToStackFrame = (
	callFrame: CallFrame,
): UnsymbolicatedStackFrame => {
	return {
		columnNumber: callFrame.columnNumber,
		fileName: callFrame.url,
		functionName: callFrame.functionName,
		lineNumber: callFrame.lineNumber,
	};
};

export const handleJavascriptException = ({
	page,
	onError,
	frame,
}: {
	page: Page;
	frame: number | null;
	onError: (err: Error) => void;
}) => {
	const client = page._client();

	const handler = (exception: ExceptionThrownEvent) => {
		const rawErrorMessage = exception.exceptionDetails.exception?.description;
		const cleanErrorMessage = cleanUpErrorMessage(exception);

		if (!cleanErrorMessage) {
			// eslint-disable-next-line no-console
			console.error(exception);
			const err = new Error(rawErrorMessage);
			err.stack = rawErrorMessage;
			onError(err);
			return;
		}

		if (!exception.exceptionDetails.stackTrace) {
			const err = new Error(removeDelayRenderStack(cleanErrorMessage));
			err.stack = rawErrorMessage;
			onError(err);
			return;
		}

		const errorType = exception.exceptionDetails.exception?.className as string;

		const symbolicatedErr = new SymbolicateableError({
			message: removeDelayRenderStack(cleanErrorMessage),
			stackFrame: (
				exception.exceptionDetails.stackTrace.callFrames as CallFrame[]
			).map((f) => callFrameToStackFrame(f)),
			frame,
			name: errorType,
			stack: exception.exceptionDetails.exception?.description,
			chunk: null,
		});
		onError(symbolicatedErr);
	};

	client.on('Runtime.exceptionThrown', handler);

	return () => {
		client.off('Runtime.exceptionThrown', handler);
		return Promise.resolve();
	};
};
