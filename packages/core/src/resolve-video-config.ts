import type {ZodTypeAny} from 'zod';
import type {TCompMetadataWithCalcFunction} from './CompositionManager.js';
import {getInputProps} from './config/input-props.js';
import {validateDimension} from './validation/validate-dimensions.js';
import {validateDurationInFrames} from './validation/validate-duration-in-frames.js';
import type {VideoConfig} from './video-config.js';

export const resolveVideoConfig = async ({
	comp,
	editorProps: editorPropsOrUndefined,
}: {
	comp: TCompMetadataWithCalcFunction<ZodTypeAny, unknown>;
	editorProps: object;
}): Promise<VideoConfig> => {
	const calculated = comp.calculateMetadata
		? await comp.calculateMetadata({
				defaultProps: comp.defaultProps,
				props: {
					...(comp.defaultProps ?? {}),
					...(editorPropsOrUndefined ?? {}),
					...(getInputProps() ?? {}),
				},
		  })
		: null;

	const width = calculated?.width ?? comp.width ?? null;
	if (!width) {
		throw new TypeError(
			'Composition width was neither specified via the `width` prop nor the `calculateMetadata()` function.'
		);
	}

	validateDimension(width, 'width', 'calculated by calculateMetadata()');

	const height = calculated?.height ?? comp.height ?? null;
	if (!height) {
		throw new TypeError(
			'Composition height was neither specified via the `height` prop nor the `calculateMetadata()` function.'
		);
	}

	validateDimension(width, 'height', 'calculated by calculateMetadata()');

	const fps = calculated?.fps ?? comp.fps ?? null;
	if (!fps) {
		throw new TypeError(
			'Composition fps was neither specified via the `fps` prop nor the `calculateMetadata()` function.'
		);
	}

	const durationInFrames =
		calculated?.durationInFrames ?? comp.durationInFrames ?? null;
	if (!durationInFrames) {
		throw new TypeError(
			'Composition durationInFrames was neither specified via the `durationInFrames` prop nor the `calculateMetadata()` function.'
		);
	}

	validateDurationInFrames({
		durationInFrames,
		component: 'calculated by calculateMetadata()',
		allowFloats: false,
	});

	return {
		width,
		height,
		fps,
		durationInFrames,
		id: comp.id,
		defaultProps: comp.defaultProps,
	};
};
