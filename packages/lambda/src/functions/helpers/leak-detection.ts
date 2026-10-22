import type {NodeIntrospection} from './why-is-node-running';
import {whyIsNodeRunning} from './why-is-node-running';

type LeakTimeout = {
	timeout: Timer;
	requestId: string;
};

let currentRequestId: string | null = null;
let leakDetectionTimeout: LeakTimeout | null = null;

export const stopLeakDetection = () => {
	if (leakDetectionTimeout !== null) {
		clearTimeout(leakDetectionTimeout.timeout);
		leakDetectionTimeout = null;
	}
};

export const setCurrentRequestId = (requestId: string) => {
	currentRequestId = requestId;
};

export const startLeakDetection = (
	leakDetection: NodeIntrospection,
	requestId: string,
) => {
	currentRequestId = requestId;
	leakDetectionTimeout = {
		requestId,
		timeout: setTimeout(() => {
			// First allow request ID to be set
			setTimeout(() => {
				if (currentRequestId !== requestId) {
					// New function, all good
					return;
				}

				console.log(
					'Leak detected: Lambda function is still running 10s after the render has finished.',
				);
				console.log('You may report this to the Remotion team.');
				console.log('Include the logs below:');
				whyIsNodeRunning(leakDetection);
				console.log('Force-quitting the Lambda function now.');
				process.exit(0);
			}, 100);
		}, 10000),
	};

	leakDetectionTimeout.timeout.unref();
};
