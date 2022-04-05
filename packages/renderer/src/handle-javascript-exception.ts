import {CDPSession, Page, Protocol} from 'puppeteer-core';
import {
	SymbolicatedStackFrame,
	symbolicateStackTrace,
} from './symbolicate-stacktrace';

export class ErrorWithStackFrame extends Error {
	frames: SymbolicatedStackFrame[];

	constructor(m: string, _frames: SymbolicatedStackFrame[]) {
		super(m);
		this.frames = _frames;
	}
}

export const handleJavascriptException = (
	page: Page,
	onError: (err: Error) => void
) => {
	const client = (page as unknown as {_client: CDPSession})._client;

	const handler = (exception: Protocol.Runtime.ExceptionThrownEvent) => {
		const err = new Error(exception.exceptionDetails.exception?.description);
		err.stack = exception.exceptionDetails.exception?.description;
		if (!exception.exceptionDetails.stackTrace) {
			onError(err);
			return;
		}

		symbolicateStackTrace(
			// TODO: if no callframes
			exception.exceptionDetails.stackTrace
				.callFrames as Protocol.Runtime.CallFrame[]
		)
			.then((sym) => {
				// TODO: Maybe something better
				const symbolicatedErr = new ErrorWithStackFrame(
					exception.exceptionDetails.exception?.description as string,
					sym
				);
				onError(symbolicatedErr);
			})
			.catch((errorVisualizingError) => {
				console.log('error symbolicating error:', errorVisualizingError);
				onError(err);
			});
	};
	client.on('Runtime.exceptionThrown', handler);

	return () => {
		client.off('Runtime.exceptionThrown', handler);
	};
};
