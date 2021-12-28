import {setErrorsRef} from '../remotion-overlay/Overlay';
import {ErrorRecord, listenToRuntimeErrors} from './listen-to-runtime-errors';

let stopListeningToRuntimeErrors: null | (() => void) = null;
type RuntimeReportingOptions = {
	onError: () => void;
	filename?: string;
};

let currentRuntimeErrorRecords: Array<ErrorRecord> = [];

export function startReportingRuntimeErrors(options: RuntimeReportingOptions) {
	if (stopListeningToRuntimeErrors !== null) {
		throw new Error('Already listening');
	}

	const handleRuntimeError =
		(opts: RuntimeReportingOptions) => (errorRecord: ErrorRecord) => {
			console.log('err');
			try {
				if (typeof opts.onError === 'function') {
					opts.onError.call(null);
				}
			} finally {
				if (
					currentRuntimeErrorRecords.some(
						({error}) => error === errorRecord.error
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
		setErrorsRef.current?.setErrors(currentRuntimeErrorRecords);
		console.log('do something', currentRuntimeErrorRecords);
	}

	stopListeningToRuntimeErrors = listenToRuntimeErrors(
		handleRuntimeError(options),
		options.filename as string
	);
}
