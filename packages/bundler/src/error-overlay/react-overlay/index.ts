import {Internals} from 'remotion';
import {listenToRuntimeErrors} from './listen-to-runtime-errors';

let stopListeningToRuntimeErrors: null | (() => void) = null;

export const didUnmountReactApp = () => {
	return !Internals.getPreviewDomElement()?.hasChildNodes();
};

export function startReportingRuntimeErrors(onError: () => void) {
	if (stopListeningToRuntimeErrors !== null) {
		throw new Error('Already listening');
	}

	const handleRuntimeError = () => {
		onError();
	};

	stopListeningToRuntimeErrors = listenToRuntimeErrors(handleRuntimeError);
}
