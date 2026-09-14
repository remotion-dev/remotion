import {LambdaClientInternals, type AwsProvider} from '@remotion/lambda-client';
import {RenderInternals} from '@remotion/renderer';
import type {InsideFunctionSpecifics} from '@remotion/serverless';
import {
	closeBrowserInstanceImplementation,
	forgetBrowserEventLoopImplementation,
	getBrowserInstanceImplementation,
	invokeWebhook,
} from '@remotion/serverless';
import {NoReactInternals} from 'remotion/no-react';
import {deleteTmpDir} from './helpers/clean-tmpdir';
import {getCurrentRegionInFunctionImplementation} from './helpers/get-current-region';
import {getTmpDirStateIfENoSp} from './helpers/get-tmp-dir';
import {startLeakDetection} from './helpers/leak-detection';
import {makeAwsArtifact} from './helpers/make-aws-artifact';
import {timer} from './helpers/timer';
import {enableNodeIntrospection} from './helpers/why-is-node-running';

const ENABLE_SLOW_LEAK_DETECTION = false;

export const serverAwsImplementation: InsideFunctionSpecifics<AwsProvider> = {
	defaultX264Preset: NoReactInternals.ENABLE_V5_BREAKING_CHANGES
		? 'veryfast'
		: null,
	forgetBrowserEventLoop: forgetBrowserEventLoopImplementation,
	closeBrowserInstance: closeBrowserInstanceImplementation,
	getBrowserInstance: (options) =>
		getBrowserInstanceImplementation({
			...options,
			chromiumOptions: {
				...options.chromiumOptions,
				// The CLI can pass null; Lambda still needs software rendering.
				gl: options.chromiumOptions.gl ?? 'swangle',
				enableMultiProcessOnLinux: false,
			},
		}),
	timer,
	getCurrentRegionInFunction: getCurrentRegionInFunctionImplementation,

	generateRandomId: ({deleteAfter, randomHashFn}) => {
		return LambdaClientInternals.generateRandomHashWithLifeCycleRule({
			deleteAfter,
			randomHashFn,
		});
	},
	deleteTmpDir: () => Promise.resolve(deleteTmpDir()),
	getCurrentFunctionName: () => {
		if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
			throw new Error('Expected AWS_LAMBDA_FUNCTION_NAME to be set');
		}

		return process.env.AWS_LAMBDA_FUNCTION_NAME;
	},
	getCurrentMemorySizeInMb: () => {
		return Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE);
	},
	invokeWebhook,
	makeArtifactWithDetails: makeAwsArtifact,
	normalizeChromiumOptions: ({chromiumOptions, logLevel}) => {
		if (chromiumOptions.gl !== 'angle') {
			return chromiumOptions;
		}

		RenderInternals.Log.warn(
			{indent: false, logLevel},
			'gl=angle is not supported in Lambda. Changing to gl=swangle instead.',
		);
		return {...chromiumOptions, gl: 'swangle'};
	},
	getTmpDirState: getTmpDirStateIfENoSp,
	startRendererDiagnostics: ENABLE_SLOW_LEAK_DETECTION
		? (requestId) => {
				const diagnostics = enableNodeIntrospection(true);
				return () => startLeakDetection(diagnostics, requestId);
			}
		: null,
};
