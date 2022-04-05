import {CDPSession, Page, Protocol} from 'puppeteer-core';
import {
	SymbolicatedStackFrame,
	symbolicateStackTrace,
} from './symbolicate-stacktrace';

export class ErrorWithStackFrame extends Error {
	stackFrames: SymbolicatedStackFrame[];
	frame: number | null;
	errorType: string;

	constructor(
		m: string,
		_stackFrames: SymbolicatedStackFrame[],
		_frame: number | null,
		_errorType: string
	) {
		super(m);
		this.stackFrames = _stackFrames;
		this.frame = _frame;
		this.errorType = _errorType;
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

	const handler = (exception: Protocol.Runtime.ExceptionThrownEvent) => {
		const errorMessage = cleanUpErrorMessage(exception);
		const err = new Error(errorMessage);
		err.stack = errorMessage;
		if (!exception.exceptionDetails.stackTrace) {
			onError(err);
			return;
		}
		const errorType = exception.exceptionDetails.exception?.className as string;

		symbolicateStackTrace(
			exception.exceptionDetails.stackTrace
				.callFrames as Protocol.Runtime.CallFrame[]
		)
			.then((sym) => {
				const symbolicatedErr = new ErrorWithStackFrame(
					errorMessage,
					sym,
					frame,
					errorType
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
