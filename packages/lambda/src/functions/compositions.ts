import {getCompositions, RenderInternals} from '@remotion/renderer';
import {VERSION} from 'remotion/version';
import {getOrCreateBucket} from '../api/get-or-create-bucket';
import type {LambdaPayload} from '../defaults';
import {LambdaRoutines} from '../defaults';
import {deserializeInputProps} from '../shared/deserialize-input-props';
import {getBrowserInstance} from './helpers/get-browser-instance';
import {getCurrentRegionInFunction} from './helpers/get-current-region';

type Options = {
	expectedBucketOwner: string;
};

export const compositionsHandler = async (
	lambdaParams: LambdaPayload,
	options: Options
) => {
	if (lambdaParams.type !== LambdaRoutines.compositions) {
		throw new TypeError('Expected info compositions');
	}

	if (lambdaParams.version !== VERSION) {
		if (!lambdaParams.version) {
			throw new Error(
				`Version mismatch: When calling getCompositionsOnLambda(), you called the function ${process.env.AWS_LAMBDA_FUNCTION_NAME} which has the version ${VERSION} but the @remotion/lambda package is an older version. Deploy a new function and use it to call getCompositionsOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`
			);
		}

		throw new Error(
			`Version mismatch: When calling getCompositionsOnLambda(), you passed ${process.env.AWS_LAMBDA_FUNCTION_NAME} as the function, which has the version ${VERSION}, but the @remotion/lambda package you used to invoke the function has version ${lambdaParams.version}. Deploy a new function and use it to call getCompositionsOnLambda(). See: https://www.remotion.dev/docs/lambda/upgrading`
		);
	}

	const [{bucketName}, browserInstance] = await Promise.all([
		getOrCreateBucket({
			region: getCurrentRegionInFunction(),
		}),
		getBrowserInstance(
			RenderInternals.isEqualOrBelowLogLevel(lambdaParams.logLevel, 'verbose'),
			lambdaParams.chromiumOptions ?? {}
		),
	]);

	const inputProps = await deserializeInputProps({
		bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		serialized: lambdaParams.inputProps,
	});

	const downloadMap = RenderInternals.makeDownloadMap();

	const compositions = await getCompositions(lambdaParams.serveUrl, {
		puppeteerInstance: browserInstance,
		inputProps: inputProps as object,
		envVariables: lambdaParams.envVariables,
		ffmpegExecutable: null,
		ffprobeExecutable: null,
		timeoutInMilliseconds: lambdaParams.timeoutInMilliseconds,
		chromiumOptions: lambdaParams.chromiumOptions,
		port: null,
		downloadMap,
	});

	return Promise.resolve({
		compositions,
	});
};
