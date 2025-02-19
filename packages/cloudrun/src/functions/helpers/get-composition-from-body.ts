import {RenderInternals} from '@remotion/renderer';
import type {CloudRunPayloadType} from './payloads';

export const getCompositionFromBody = async (body: CloudRunPayloadType) => {
	const {metadata, propsSize} = await RenderInternals.internalSelectComposition(
		{
			serveUrl: body.serveUrl,
			browserExecutable: null,
			chromiumOptions: {
				...(body.chromiumOptions ?? {}),
				enableMultiProcessOnLinux: true,
			},
			envVariables: body.envVariables ?? {},
			id: body.composition,
			indent: false,
			serializedInputPropsWithCustomSchema:
				body.serializedInputPropsWithCustomSchema,
			logLevel: body.logLevel,
			onBrowserLog: () => null,
			port: null,
			puppeteerInstance: undefined,
			server: undefined,
			timeoutInMilliseconds:
				body.delayRenderTimeoutInMilliseconds ??
				RenderInternals.DEFAULT_TIMEOUT,
			offthreadVideoCacheSizeInBytes: body.offthreadVideoCacheSizeInBytes,
			offthreadVideoThreads: body.offthreadVideoThreads,
			binariesDirectory: null,
			onBrowserDownload: () => {
				throw new Error('Should not download a browser in Cloud Run');
			},
			onServeUrlVisited: () => undefined,
			chromeMode: 'headless-shell',
		},
	);

	if (propsSize > 10_000_000) {
		RenderInternals.Log.warn(
			{indent: false, logLevel: body.logLevel},
			`The props of your composition are large (${propsSize} bytes). This may cause slowdown.`,
		);
	}

	return metadata;
};
