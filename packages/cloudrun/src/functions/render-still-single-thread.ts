import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import type {ChromiumOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';
import {VERSION} from 'remotion/version';
import {Log} from '../cli/log';
import {randomHash} from '../shared/random-hash';
import {getCompositionFromBody} from './helpers/get-composition-from-body';
import {getDownloadBehaviorSetting} from './helpers/get-download-behavior-setting';
import type {
	CloudRunPayloadType,
	RenderStillOnCloudrunOutput,
} from './helpers/payloads';
import {writeCloudrunError} from './helpers/write-cloudrun-error';

export const renderStillSingleThread = async (
	body: CloudRunPayloadType,
	res: ff.Response,
) => {
	if (body.type !== 'still') {
		throw new Error('expected type still');
	}

	if (body.clientVersion !== VERSION) {
		if (!body.clientVersion) {
			throw new Error(
				`Version mismatch: When calling renderMediaOnCloudRun(), you called a service which has the version ${VERSION} but the @remotion/cloudrun package is an older version. Deploy a new service with matchin version and use it to call renderMediaOnCloudRun().`,
			);
		}

		throw new Error(
			`Version mismatch: When calling renderMediaOnCloudRun(), you called a service, which has the version ${VERSION}, but the @remotion/cloudrun package you used to invoke the function has version ${VERSION}. Deploy a new service and use it to call renderMediaOnCloudrun().`,
		);
	}

	const renderId = body.renderIdOverride ?? randomHash({randomInTests: true});

	try {
		Log.verbose(
			{indent: false, logLevel: body.logLevel},
			'Rendering still frame',
			body,
		);

		const composition = await getCompositionFromBody(body);

		Log.verbose(
			{indent: false, logLevel: body.logLevel},
			'Composition loaded',
			composition,
		);

		const tempFilePath = '/tmp/still.png';

		const actualChromiumOptions: ChromiumOptions = {
			...body.chromiumOptions,
			// Override the `null` value, which might come from CLI with swANGLE
			gl: body.chromiumOptions?.gl ?? 'swangle',
			enableMultiProcessOnLinux: true,
		};

		await RenderInternals.internalRenderStill({
			composition: {
				...composition,
				height: body.forceHeight ?? composition.height,
				width: body.forceWidth ?? composition.width,
			},
			serveUrl: body.serveUrl,
			output: tempFilePath,
			serializedInputPropsWithCustomSchema:
				body.serializedInputPropsWithCustomSchema,
			serializedResolvedPropsWithCustomSchema:
				NoReactInternals.serializeJSONWithDate({
					data: composition.props,
					indent: undefined,
					staticBase: null,
				}).serializedString,
			jpegQuality: body.jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
			imageFormat: body.imageFormat,
			scale: body.scale,
			envVariables: body.envVariables,
			chromiumOptions: actualChromiumOptions,
			frame: body.frame,
			logLevel: body.logLevel,
			browserExecutable: null,
			cancelSignal: null,
			indent: false,
			timeoutInMilliseconds: body.delayRenderTimeoutInMilliseconds,
			onBrowserLog: null,
			onDownload: null,
			overwrite: true,
			port: null,
			puppeteerInstance: null,
			server: undefined,
			offthreadVideoCacheSizeInBytes: body.offthreadVideoCacheSizeInBytes,
			offthreadVideoThreads: body.offthreadVideoThreads,
			binariesDirectory: null,
			onBrowserDownload: () => {
				throw new Error('Should not download a browser in Cloud Run');
			},
			onArtifact: () => {
				throw new Error('Emitting artifacts is not supported in Cloud Run');
			},
			chromeMode: 'headless-shell',
		});
		Log.info({indent: false, logLevel: body.logLevel}, 'Still rendered');

		const storage = new Storage();

		const publicUpload = body.privacy === 'public' || !body.privacy;

		const uploadedResponse = await storage
			.bucket(body.outputBucket)
			.upload(tempFilePath, {
				destination: `renders/${renderId}/${body.outName ?? 'out.png'}`,
				predefinedAcl: publicUpload ? 'publicRead' : 'projectPrivate',
				metadata: getDownloadBehaviorSetting(body.downloadBehavior),
			});

		Log.info({indent: false, logLevel: body.logLevel}, 'Still uploaded');

		const uploadedFile = uploadedResponse[0];
		const renderMetadata = await uploadedFile.getMetadata();
		const responseData: RenderStillOnCloudrunOutput = {
			publicUrl: uploadedFile.publicUrl(),
			cloudStorageUri: uploadedFile.cloudStorageURI.href,
			size: renderMetadata[0].size as number,
			bucketName: body.outputBucket,
			renderId,
			type: 'success',
			privacy: publicUpload ? 'public-read' : 'project-private',
		};

		RenderInternals.Log.info(
			{indent: false, logLevel: body.logLevel},
			'Render Completed:',
			responseData,
		);

		res.end(JSON.stringify({response: responseData}));
	} catch (err) {
		await writeCloudrunError({
			bucketName: body.outputBucket,
			renderId,
			errorInfo: {
				name: (err as Error).name as string,
				message: (err as Error).message as string,
				stack: (err as Error).stack as string,
				type: 'renderer',
			},
			publicUpload: body.privacy === 'public' || !body.privacy,
		});

		throw err;
	}
};
