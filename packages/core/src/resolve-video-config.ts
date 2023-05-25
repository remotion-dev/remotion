import type {ZodTypeAny} from 'zod';
import type {TCompMetadataWithCalcFunction} from './CompositionManager.js';
import {getInputProps} from './config/input-props.js';
import {validateDimension} from './validation/validate-dimensions.js';
import {validateDurationInFrames} from './validation/validate-duration-in-frames.js';
import type {VideoConfig} from './video-config.js';

export const resolveVideoConfig = async ({
	composition,
	editorProps: editorPropsOrUndefined,
	signal,
}: {
	composition: TCompMetadataWithCalcFunction<ZodTypeAny, unknown>;
	editorProps: object;
	signal: AbortSignal;
}): Promise<VideoConfig> => {
	const potentialErrorLocation = `calculated by calculateMetadata() for the composition "${composition.id}"`;

	const calculated = composition.calculateMetadata
		? await composition.calculateMetadata({
				defaultProps: composition.defaultProps,
				props: {
					...((composition.defaultProps ?? {}) as object),
					...(editorPropsOrUndefined ?? {}),
					...(getInputProps() ?? {}),
				},
				abortSignal: signal,
		  })
		: null;

	const width = calculated?.width ?? composition.width ?? null;
	if (!width) {
		throw new TypeError(
			'Composition width was neither specified via the `width` prop nor the `calculateMetadata()` function.'
		);
	}

	validateDimension(width, 'width', potentialErrorLocation);

	const height = calculated?.height ?? composition.height ?? null;
	if (!height) {
		throw new TypeError(
			'Composition height was neither specified via the `height` prop nor the `calculateMetadata()` function.'
		);
	}

	validateDimension(width, 'height', potentialErrorLocation);

	const fps = calculated?.fps ?? composition.fps ?? null;
	if (!fps) {
		throw new TypeError(
			'Composition fps was neither specified via the `fps` prop nor the `calculateMetadata()` function.'
		);
	}

	const durationInFrames =
		calculated?.durationInFrames ?? composition.durationInFrames ?? null;
	if (!durationInFrames) {
		throw new TypeError(
			'Composition durationInFrames was neither specified via the `durationInFrames` prop nor the `calculateMetadata()` function.'
		);
	}

	validateDurationInFrames({
		durationInFrames,
		component: potentialErrorLocation,
		allowFloats: false,
	});

	return {
		width,
		height,
		fps,
		durationInFrames,
		id: composition.id,
		defaultProps: composition.defaultProps,
	};
};
