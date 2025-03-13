import {ServerlessRoutines} from '@remotion/serverless';
import {VERSION} from 'remotion/version';
import {mockImplementation} from '../mocks/mock-implementation';

export const waitUntilDone = async (bucketName: string, renderId: string) => {
	while (true) {
		const progress = await mockImplementation.callFunctionSync({
			type: ServerlessRoutines.status,
			payload: {
				type: ServerlessRoutines.status,
				bucketName,
				renderId,
				version: VERSION,
				logLevel: 'error',
				forcePathStyle: false,
				s3OutputProvider: null,
			},
			functionName: 'remotion-dev-lambda',
			region: 'eu-central-1',
			timeoutInTest: 120000,
		});
		if (progress.done) {
			return progress;
		}

		if (progress.fatalErrorEncountered) {
			throw new Error(progress.errors.join('\n'));
		}

		await new Promise((resolve) => {
			setTimeout(resolve, 1000);
		});
	}
};
