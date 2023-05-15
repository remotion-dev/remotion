import type {
	AudioCodec,
	Codec,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import type {ApiRoutes} from '../../../preview-server/api-types';
import type {
	OpenInFileExplorerRequest,
	RenderJob,
} from '../../../preview-server/render-queue/job';
import type {RequiredChromiumOptions} from '../../../required-chromium-options';
import {serializeJSONWithDate} from '../RenderModal/SchemaEditor/date-serialization';

const callApi = <Endpoint extends keyof ApiRoutes>(
	endpoint: Endpoint,
	body: ApiRoutes[Endpoint]['Request']
): Promise<ApiRoutes[Endpoint]['Response']> => {
	return new Promise<ApiRoutes[Endpoint]['Response']>((resolve, reject) => {
		fetch(endpoint, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((res) => res.json())
			.then(
				(
					data:
						| {success: true; data: ApiRoutes[Endpoint]['Response']}
						| {success: false; error: string}
				) => {
					if (data.success) {
						resolve(data.data);
					} else {
						reject(new Error(data.error));
					}
				}
			)
			.catch((err) => {
				reject(err);
			});
	});
};

export const addStillRenderJob = ({
	compositionId,
	outName,
	imageFormat,
	jpegQuality,
	frame,
	scale,
	verbose,
	chromiumOptions,
	delayRenderTimeout,
	envVariables,
	inputProps,
}: {
	compositionId: string;
	outName: string;
	imageFormat: StillImageFormat;
	jpegQuality: number | null;
	frame: number;
	scale: number;
	verbose: boolean;
	chromiumOptions: RequiredChromiumOptions;
	delayRenderTimeout: number;
	envVariables: Record<string, string>;
	inputProps: unknown;
}) => {
	return callApi('/api/render', {
		compositionId,
		type: 'still',
		outName,
		imageFormat,
		jpegQuality,
		frame,
		scale,
		verbose,
		chromiumOptions,
		delayRenderTimeout,
		envVariables,
		inputProps,
	});
};

export const addVideoRenderJob = ({
	compositionId,
	outName,
	imageFormat,
	jpegQuality,
	scale,
	verbose,
	codec,
	concurrency,
	crf,
	startFrame,
	endFrame,
	muted,
	enforceAudioTrack,
	proResProfile,
	pixelFormat,
	audioBitrate,
	videoBitrate,
	everyNthFrame,
	numberOfGifLoops,
	delayRenderTimeout,
	audioCodec,
	disallowParallelEncoding,
	chromiumOptions,
	envVariables,
	inputProps,
}: {
	compositionId: string;
	outName: string;
	imageFormat: VideoImageFormat;
	jpegQuality: number | null;
	scale: number;
	verbose: boolean;
	codec: Codec;
	concurrency: number;
	crf: number | null;
	startFrame: number;
	endFrame: number;
	muted: boolean;
	enforceAudioTrack: boolean;
	proResProfile: ProResProfile | null;
	pixelFormat: PixelFormat;
	audioBitrate: string | null;
	videoBitrate: string | null;
	everyNthFrame: number;
	numberOfGifLoops: number | null;
	delayRenderTimeout: number;
	audioCodec: AudioCodec;
	disallowParallelEncoding: boolean;
	chromiumOptions: RequiredChromiumOptions;
	envVariables: Record<string, string>;
	inputProps: unknown;
}) => {
	return callApi('/api/render', {
		compositionId,
		type: 'video',
		outName,
		imageFormat,
		jpegQuality,
		scale,
		verbose,
		codec,
		concurrency,
		crf,
		endFrame,
		startFrame,
		muted,
		enforceAudioTrack,
		proResProfile,
		pixelFormat,
		audioBitrate,
		videoBitrate,
		everyNthFrame,
		numberOfGifLoops,
		delayRenderTimeout,
		audioCodec,
		disallowParallelEncoding,
		chromiumOptions,
		envVariables,
		inputProps,
	});
};

export const unsubscribeFromFileExistenceWatcher = ({
	file,
	clientId,
}: {
	file: string;
	clientId: string;
}) => {
	return callApi('/api/unsubscribe-from-file-existence', {file, clientId});
};

export const subscribeToFileExistenceWatcher = async ({
	file,
	clientId,
}: {
	file: string;
	clientId: string;
}): Promise<boolean> => {
	const {exists} = await callApi('/api/subscribe-to-file-existence', {
		file,
		clientId,
	});
	return exists;
};

export const openInFileExplorer = ({directory}: {directory: string}) => {
	const body: OpenInFileExplorerRequest = {
		directory,
	};
	return callApi('/api/open-in-file-explorer', body);
};

export const removeRenderJob = (job: RenderJob) => {
	return callApi('/api/remove-render', {
		jobId: job.id,
	});
};

export const cancelRenderJob = (job: RenderJob) => {
	return callApi('/api/cancel', {
		jobId: job.id,
	});
};

export const updateDefaultProps = (
	compositionId: string,
	defaultProps: unknown
) => {
	return callApi('/api/update-default-props', {
		compositionId,
		defaultProps: serializeJSONWithDate(defaultProps, undefined)
			.serializedString,
	});
};

export const canUpdateDefaultProps = (compositionId: string) => {
	return callApi('/api/can-update-default-props', {
		compositionId,
	});
};
