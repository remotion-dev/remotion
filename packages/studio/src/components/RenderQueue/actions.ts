import type {
	AudioCodec,
	ChromeMode,
	Codec,
	ColorSpace,
	LogLevel,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import type {HardwareAccelerationOption} from '@remotion/renderer/client';
import type {
	ApplyCodemodRequest,
	CanUpdateDefaultPropsResponse,
	EnumPath,
	OpenInFileExplorerRequest,
	RecastCodemod,
	RenderJob,
	RequiredChromiumOptions,
} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';
import {callApi} from '../call-api';

export const addStillRenderJob = ({
	compositionId,
	outName,
	imageFormat,
	jpegQuality,
	frame,
	scale,
	logLevel,
	chromiumOptions,
	delayRenderTimeout,
	envVariables,
	inputProps,
	offthreadVideoCacheSizeInBytes,
	offthreadVideoThreads,
	multiProcessOnLinux,
	beepOnFinish,
	metadata,
	chromeMode,
}: {
	compositionId: string;
	outName: string;
	imageFormat: StillImageFormat;
	jpegQuality: number;
	frame: number;
	scale: number;
	logLevel: LogLevel;
	chromiumOptions: RequiredChromiumOptions;
	delayRenderTimeout: number;
	envVariables: Record<string, string>;
	inputProps: Record<string, unknown>;
	offthreadVideoCacheSizeInBytes: number | null;
	offthreadVideoThreads: number | null;
	multiProcessOnLinux: boolean;
	beepOnFinish: boolean;
	metadata: Record<string, string> | null;
	chromeMode: ChromeMode;
}) => {
	return callApi('/api/render', {
		compositionId,
		type: 'still',
		outName,
		imageFormat,
		jpegQuality,
		frame,
		scale,
		logLevel,
		chromiumOptions,
		delayRenderTimeout,
		envVariables,
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				data: inputProps,
				staticBase: window.remotion_staticBase,
				indent: undefined,
			}).serializedString,
		offthreadVideoCacheSizeInBytes,
		offthreadVideoThreads,
		multiProcessOnLinux,
		beepOnFinish,
		metadata,
		chromeMode,
	});
};

export const addSequenceRenderJob = ({
	compositionId,
	outName,
	imageFormat,
	startFrame,
	endFrame,
	scale,
	logLevel,
	chromiumOptions,
	delayRenderTimeout,
	envVariables,
	inputProps,
	concurrency,
	offthreadVideoCacheSizeInBytes,
	offthreadVideoThreads,
	jpegQuality,
	disallowParallelEncoding,
	multiProcessOnLinux,
	beepOnFinish,
	repro,
	metadata,
	chromeMode,
}: {
	compositionId: string;
	outName: string;
	imageFormat: VideoImageFormat;
	jpegQuality: number;
	startFrame: number;
	endFrame: number;
	scale: number;
	logLevel: LogLevel;
	chromiumOptions: RequiredChromiumOptions;
	concurrency: number;
	delayRenderTimeout: number;
	envVariables: Record<string, string>;
	inputProps: Record<string, unknown>;
	offthreadVideoCacheSizeInBytes: number | null;
	offthreadVideoThreads: number | null;
	disallowParallelEncoding: boolean;
	multiProcessOnLinux: boolean;
	beepOnFinish: boolean;
	repro: boolean;
	metadata: Record<string, string> | null;
	chromeMode: ChromeMode;
}) => {
	return callApi('/api/render', {
		compositionId,
		type: 'sequence',
		outName,
		imageFormat,
		jpegQuality,
		scale,
		startFrame,
		endFrame,
		logLevel,
		chromiumOptions,
		delayRenderTimeout,
		envVariables,
		concurrency,
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				data: inputProps,
				staticBase: window.remotion_staticBase,
				indent: undefined,
			}).serializedString,
		offthreadVideoCacheSizeInBytes,
		offthreadVideoThreads,
		disallowParallelEncoding,
		multiProcessOnLinux,
		beepOnFinish,
		repro,
		metadata,
		chromeMode,
	});
};

export const addVideoRenderJob = ({
	compositionId,
	outName,
	imageFormat,
	jpegQuality,
	scale,
	logLevel,
	codec,
	concurrency,
	crf,
	startFrame,
	endFrame,
	muted,
	enforceAudioTrack,
	proResProfile,
	x264Preset,
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
	offthreadVideoCacheSizeInBytes,
	offthreadVideoThreads,
	colorSpace,
	multiProcessOnLinux,
	encodingMaxRate,
	encodingBufferSize,
	beepOnFinish,
	repro,
	forSeamlessAacConcatenation,
	separateAudioTo,
	metadata,
	hardwareAcceleration,
	chromeMode,
}: {
	compositionId: string;
	outName: string;
	imageFormat: VideoImageFormat;
	jpegQuality: number | null;
	scale: number;
	logLevel: LogLevel;
	codec: Codec;
	concurrency: number;
	crf: number | null;
	startFrame: number;
	endFrame: number;
	muted: boolean;
	enforceAudioTrack: boolean;
	proResProfile: ProResProfile | null;
	x264Preset: X264Preset | null;
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
	inputProps: Record<string, unknown>;
	offthreadVideoCacheSizeInBytes: number | null;
	offthreadVideoThreads: number | null;
	colorSpace: ColorSpace;
	multiProcessOnLinux: boolean;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	beepOnFinish: boolean;
	repro: boolean;
	forSeamlessAacConcatenation: boolean;
	separateAudioTo: string | null;
	metadata: Record<string, string> | null;
	hardwareAcceleration: HardwareAccelerationOption;
	chromeMode: ChromeMode;
}) => {
	return callApi('/api/render', {
		compositionId,
		type: 'video',
		outName,
		imageFormat,
		jpegQuality,
		scale,
		logLevel,
		codec,
		concurrency,
		crf,
		endFrame,
		startFrame,
		muted,
		enforceAudioTrack,
		proResProfile,
		x264Preset,
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
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				data: inputProps,
				staticBase: window.remotion_staticBase,
				indent: undefined,
			}).serializedString,
		offthreadVideoCacheSizeInBytes,
		offthreadVideoThreads,
		colorSpace,
		multiProcessOnLinux,
		encodingBufferSize,
		encodingMaxRate,
		beepOnFinish,
		repro,
		forSeamlessAacConcatenation,
		separateAudioTo,
		metadata,
		hardwareAcceleration,
		chromeMode,
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

export const applyCodemod = ({
	codemod,
	dryRun,
	signal,
}: {
	codemod: RecastCodemod;
	dryRun: boolean;
	signal: AbortController['signal'];
}) => {
	const body: ApplyCodemodRequest = {
		codemod,
		dryRun,
	};
	return callApi('/api/apply-codemod', body, signal);
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

export const updateAvailable = (signal: AbortSignal) => {
	return callApi('/api/update-available', {}, signal);
};

export const getProjectInfo = (signal: AbortSignal) => {
	return callApi('/api/project-info', {}, signal);
};

export const callUpdateDefaultPropsApi = (
	compositionId: string,
	defaultProps: Record<string, unknown>,
	enumPaths: EnumPath[],
) => {
	return callApi('/api/update-default-props', {
		compositionId,
		defaultProps: NoReactInternals.serializeJSONWithDate({
			data: defaultProps,
			indent: undefined,
			staticBase: window.remotion_staticBase,
		}).serializedString,
		enumPaths,
	});
};

export const canUpdateDefaultProps = (
	compositionId: string,
	readOnlyStudio: boolean,
): Promise<CanUpdateDefaultPropsResponse> => {
	if (readOnlyStudio) {
		return Promise.resolve({
			canUpdate: false,
			reason: 'Read-only studio',
		});
	}

	return callApi('/api/can-update-default-props', {
		compositionId,
	});
};
