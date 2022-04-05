import {StackFrame} from '@remotion/bundler/src/error-overlay/react-overlay/utils/stack-frame';
import {CDPSession, Page, Protocol} from 'puppeteer-core';
import {DELAY_RENDER_CALLSTACK_TOKEN} from 'remotion';
import {parseDelayRenderEmbeddedStack} from './delay-render-embedded-stack';
import {
	SymbolicatedStackFrame,
	symbolicateStackTrace,
} from './symbolicate-stacktrace';

export class ErrorWithStackFrame extends Error {
	stackFrames: SymbolicatedStackFrame[];
	frame: number | null;
	errorType: string;
	delayRenderCall: SymbolicatedStackFrame[] | null;

	constructor(
		m: string,
		_stackFrames: SymbolicatedStackFrame[],
		_frame: number | null,
		_errorType: string,
		_delayRenderCall: SymbolicatedStackFrame[] | null
	) {
		super(m);
		this.stackFrames = _stackFrames;
		this.frame = _frame;
		this.errorType = _errorType;
		this.delayRenderCall = _delayRenderCall;
	}
}

const cleanUpErrorMessage = (
	exception: Protocol.Runtime.ExceptionThrownEvent
) => {
	let errorMessage = exception.exceptionDetails.exception
		?.description as string;
	const errorType = exception.exceptionDetails.exception?.className as string;
	const prefix = `${errorType}: `;

	if (errorMessage.startsWith(prefix)) {
		errorMessage = errorMessage.substring(prefix.length);
	}
	const frames = exception.exceptionDetails.stackTrace?.callFrames.length ?? 0;
	const split = errorMessage.split('\n');
	return split.slice(0, split.length - frames).join('\n');
};

export const removeDelayRenderStack = (message: string) => {
	const index = message.indexOf(DELAY_RENDER_CALLSTACK_TOKEN);

	return message.substring(0, index);
};

const callFrameToStackFrame = (
	callFrame: Protocol.Runtime.CallFrame
): StackFrame => {
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
	const client = (page as unknown as {_client: CDPSession})._client;

	const handler = async (exception: Protocol.Runtime.ExceptionThrownEvent) => {
		const rawErrorMessage = exception.exceptionDetails.exception
			?.description as string;
		const cleanErrorMessage = cleanUpErrorMessage(exception);
		const err = new Error(removeDelayRenderStack(cleanErrorMessage));
		err.stack = rawErrorMessage;
		if (!exception.exceptionDetails.stackTrace) {
			onError(err);
			return;
		}
		const errorType = exception.exceptionDetails.exception?.className as string;
		const delayRenderStack = await parseDelayRenderEmbeddedStack(
			cleanErrorMessage
		);

		try {
			const sym = await symbolicateStackTrace(
				(
					exception.exceptionDetails.stackTrace
						.callFrames as Protocol.Runtime.CallFrame[]
				).map((f) => callFrameToStackFrame(f))
			);
			const symbolicatedErr = new ErrorWithStackFrame(
				removeDelayRenderStack(cleanErrorMessage),
				sym,
				frame,
				errorType,
				delayRenderStack
			);
			onError(symbolicatedErr);
		} catch (errorVisualizingError) {
			console.log('error symbolicating error:', errorVisualizingError);
			onError(err);
		}
	};
	client.on('Runtime.exceptionThrown', handler);

	return () => {
		client.off('Runtime.exceptionThrown', handler);
	};
};
