import type {AnyZodObject} from './any-zod-type.js';
import type {
	CalcMetadataReturnType,
	CalculateMetadataFunction,
} from './Composition.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import {serializeThenDeserializeInStudio} from './input-props-serialization.js';
import type {InferProps} from './props-if-has-props.js';
import {validateCodec} from './validation/validate-default-codec.js';
import {validateDimension} from './validation/validate-dimensions.js';
import {validateDurationInFrames} from './validation/validate-duration-in-frames.js';
import {validateFps} from './validation/validate-fps.js';
import type {VideoConfig} from './video-config.js';

const validateCalculated = ({
	calculated,
	compositionId,
	compositionFps,
	compositionHeight,
	compositionWidth,
	compositionDurationInFrames,
}: {
	calculated: CalcMetadataReturnType<Record<string, unknown>> | null;
	compositionId: string;
	compositionWidth: number | null;
	compositionHeight: number | null;
	compositionFps: number | null;
	compositionDurationInFrames: number | null;
}) => {
	const calculateMetadataErrorLocation = `calculated by calculateMetadata() for the composition "${compositionId}"`;
	const defaultErrorLocation = `of the "<Composition />" component with the id "${compositionId}"`;

	const width = calculated?.width ?? compositionWidth ?? undefined;

	validateDimension(
		width,
		'width',
		calculated?.width ? calculateMetadataErrorLocation : defaultErrorLocation,
	);

	const height = calculated?.height ?? compositionHeight ?? undefined;

	validateDimension(
		height,
		'height',
		calculated?.height ? calculateMetadataErrorLocation : defaultErrorLocation,
	);

	const fps = calculated?.fps ?? compositionFps ?? null;

	validateFps(
		fps,
		calculated?.fps ? calculateMetadataErrorLocation : defaultErrorLocation,
		false,
	);

	const durationInFrames =
		calculated?.durationInFrames ?? compositionDurationInFrames ?? null;

	validateDurationInFrames(durationInFrames, {
		allowFloats: false,
		component: `of the "<Composition />" component with the id "${compositionId}"`,
	});

	const defaultCodec = calculated?.defaultCodec;
	validateCodec(defaultCodec, calculateMetadataErrorLocation, 'defaultCodec');

	const defaultOutName = calculated?.defaultOutName;
	const defaultVideoImageFormat = calculated?.defaultVideoImageFormat;
	const defaultPixelFormat = calculated?.defaultPixelFormat;
	const defaultProResProfile = calculated?.defaultProResProfile;
	const defaultSampleRate = calculated?.defaultSampleRate;

	return {
		width,
		height,
		fps,
		durationInFrames,
		defaultCodec,
		defaultOutName,
		defaultVideoImageFormat,
		defaultPixelFormat,
		defaultProResProfile,
		defaultSampleRate,
	};
};

type ResolveVideoConfigParams = {
	compositionId: string;
	compositionWidth: number | null;
	compositionHeight: number | null;
	compositionFps: number | null;
	compositionDurationInFrames: number | null;
	calculateMetadata: CalculateMetadataFunction<
		InferProps<AnyZodObject, Record<string, unknown>>
	> | null;
	signal: AbortSignal;
	defaultProps: Record<string, unknown>;
	inputProps: Record<string, unknown>;
};

export type VideoConfigMetadataSource = {
	readonly durationInFrames: 'calculate-metadata' | 'composition';
	readonly fps: 'calculate-metadata' | 'composition';
	readonly height: 'calculate-metadata' | 'composition';
	readonly width: 'calculate-metadata' | 'composition';
};

export type VideoConfigWithMetadata = {
	readonly metadataSource: VideoConfigMetadataSource;
	readonly videoConfig: VideoConfig;
};

const makeVideoConfigWithMetadata = ({
	calculated,
	compositionDurationInFrames,
	compositionFps,
	compositionHeight,
	compositionId,
	compositionWidth,
	defaultProps,
	originalProps,
}: Omit<
	ResolveVideoConfigParams,
	'calculateMetadata' | 'signal' | 'inputProps'
> & {
	readonly calculated: CalcMetadataReturnType<Record<string, unknown>> | null;
	readonly originalProps: Record<string, unknown>;
}): VideoConfigWithMetadata => {
	const data = validateCalculated({
		calculated,
		compositionDurationInFrames,
		compositionFps,
		compositionHeight,
		compositionWidth,
		compositionId,
	});

	return {
		metadataSource: {
			durationInFrames:
				calculated?.durationInFrames === undefined
					? 'composition'
					: 'calculate-metadata',
			fps: calculated?.fps === undefined ? 'composition' : 'calculate-metadata',
			height:
				calculated?.height === undefined ? 'composition' : 'calculate-metadata',
			width:
				calculated?.width === undefined ? 'composition' : 'calculate-metadata',
		},
		videoConfig: {
			...data,
			id: compositionId,
			defaultProps: serializeThenDeserializeInStudio(defaultProps ?? {}),
			props: serializeThenDeserializeInStudio(
				calculated?.props ?? originalProps,
			),
			defaultCodec: data.defaultCodec ?? null,
			defaultOutName: data.defaultOutName ?? null,
			defaultVideoImageFormat: data.defaultVideoImageFormat ?? null,
			defaultPixelFormat: data.defaultPixelFormat ?? null,
			defaultProResProfile: data.defaultProResProfile ?? null,
			defaultSampleRate: data.defaultSampleRate ?? null,
		},
	};
};

export const resolveVideoConfigWithMetadata = ({
	calculateMetadata,
	signal,
	defaultProps,
	inputProps: originalProps,
	compositionId,
	compositionDurationInFrames,
	compositionFps,
	compositionHeight,
	compositionWidth,
}: ResolveVideoConfigParams):
	| VideoConfigWithMetadata
	| Promise<VideoConfigWithMetadata> => {
	const calculatedProm = calculateMetadata
		? calculateMetadata({
				defaultProps,
				props: originalProps,
				abortSignal: signal,
				compositionId,
				isRendering: getRemotionEnvironment().isRendering,
			})
		: null;

	if (
		calculatedProm !== null &&
		typeof calculatedProm === 'object' &&
		'then' in calculatedProm
	) {
		return calculatedProm.then((c) => {
			return makeVideoConfigWithMetadata({
				calculated: c,
				compositionDurationInFrames,
				compositionFps,
				compositionHeight,
				compositionWidth,
				compositionId,
				defaultProps,
				originalProps,
			});
		});
	}

	return makeVideoConfigWithMetadata({
		calculated: calculatedProm,
		compositionDurationInFrames,
		compositionFps,
		compositionHeight,
		compositionWidth,
		compositionId,
		defaultProps,
		originalProps,
	});
};

export const resolveVideoConfig = (
	params: ResolveVideoConfigParams,
): VideoConfig | Promise<VideoConfig> => {
	const resolved = resolveVideoConfigWithMetadata(params);
	if (typeof resolved === 'object' && 'then' in resolved) {
		return resolved.then(({videoConfig}) => videoConfig);
	}

	return resolved.videoConfig;
};

export const resolveVideoConfigWithMetadataOrCatch = (
	params: ResolveVideoConfigParams,
):
	| {
			type: 'success';
			result: VideoConfigWithMetadata | Promise<VideoConfigWithMetadata>;
	  }
	| {
			type: 'error';
			error: Error;
	  } => {
	try {
		return {
			type: 'success',
			result: resolveVideoConfigWithMetadata(params),
		};
	} catch (err) {
		return {
			type: 'error',
			error: err as Error,
		};
	}
};

export const resolveVideoConfigOrCatch = (
	params: ResolveVideoConfigParams,
):
	| {
			type: 'success';
			result: VideoConfig | Promise<VideoConfig>;
	  }
	| {
			type: 'error';
			error: Error;
	  } => {
	try {
		const promiseOrReturnValue = resolveVideoConfig(params);
		return {
			type: 'success',
			result: promiseOrReturnValue,
		};
	} catch (err) {
		return {
			type: 'error',
			error: err as Error,
		};
	}
};
