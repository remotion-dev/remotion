import {Internals} from 'remotion';
import {setErrorsRef} from '../remotion-overlay/Overlay';
import {ErrorRecord, listenToRuntimeErrors} from './listen-to-runtime-errors';

let stopListeningToRuntimeErrors: null | (() => void) = null;

let currentRuntimeErrorRecords: ErrorRecord[] = [];

export const dismissErrors = () => {
	currentRuntimeErrorRecords = [];
};

export const shouldReload = () => {
	return !Internals.getPreviewDomElement()?.hasChildNodes();
};

const errorsAreTheSame = (first: Error, second: Error) => {
	return first.stack === second.stack && first.message === second.message;
};

export function startReportingRuntimeErrors(onError: () => void) {
	if (stopListeningToRuntimeErrors !== null) {
		throw new Error('Already listening');
	}

	const handleRuntimeError = (errorRecord: ErrorRecord) => {
		try {
			onError();
		} finally {
			if (
				currentRuntimeErrorRecords.some(({error}) =>
					errorsAreTheSame(error, errorRecord.error)
				)
			) {
				// Deduplicate identical errors.
				// This fixes https://github.com/facebook/create-react-app/issues/3011.
			} else {
				currentRuntimeErrorRecords = currentRuntimeErrorRecords.concat([
					errorRecord,
				]);
				update();
			}
		}
	};

	function update() {
		setErrorsRef.current?.setErrors({
			type: 'errors',
			errors: currentRuntimeErrorRecords,
		});
	}

	stopListeningToRuntimeErrors = listenToRuntimeErrors(handleRuntimeError);
}
