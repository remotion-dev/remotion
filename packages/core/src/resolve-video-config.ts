import type {AnyZodObject} from 'zod';
import type {CalcMetadataReturnType} from './Composition.js';
import type {TCompMetadataWithCalcFunction} from './CompositionManager.js';
import {getInputProps} from './config/input-props.js';
import {getRemotionEnvironment} from './get-environment.js';
import {validateDimension} from './validation/validate-dimensions.js';
import {validateDurationInFrames} from './validation/validate-duration-in-frames.js';
import type {VideoConfig} from './video-config.js';

export const resolveVideoConfig = ({
	composition,
	editorProps: editorPropsOrUndefined,
	signal,
}: {
	composition: TCompMetadataWithCalcFunction<
		AnyZodObject,
		Record<string, unknown> | undefined
	>;
	editorProps: object;
	signal: AbortSignal;
}): VideoConfig | Promise<VideoConfig> => {
	const calculatedProm = composition.calculateMetadata
		? composition.calculateMetadata({
				defaultProps: composition.defaultProps ?? {},
				props: {
					...((composition.defaultProps ?? {}) as object),
					...(editorPropsOrUndefined ?? {}),
					...(typeof window === 'undefined' ||
					getRemotionEnvironment() === 'player-development' ||
					getRemotionEnvironment() === 'player-production'
						? {}
						: getInputProps() ?? {}),
				},
				abortSignal: signal,
		  })
		: null;

	if (
		calculatedProm !== null &&
		typeof calculatedProm === 'object' &&
		'then' in calculatedProm
	) {
		return calculatedProm.then((c) => {
			const {height, width, durationInFrames, fps} = validateCalculated({
				calculated: c,
				composition,
			});
			return {
				width,
				height,
				fps,
				durationInFrames,
				id: composition.id,
				defaultProps: c.props as Record<string, unknown>,
			};
		});
	}

	const data = validateCalculated({
		calculated: calculatedProm,
		composition,
	});
	if (calculatedProm === null) {
		return {
			...data,
			id: composition.id,
			defaultProps: composition?.defaultProps ?? {},
		};
	}

	return {
		...data,
		id: composition.id,
		defaultProps: (calculatedProm?.props ?? {}) as Record<string, unknown>,
	};
};

const validateCalculated = ({
	composition,
	calculated,
}: {
	composition: TCompMetadataWithCalcFunction<
		AnyZodObject,
		Record<string, unknown> | undefined
	>;
	calculated: CalcMetadataReturnType<unknown> | null;
}) => {
	const potentialErrorLocation = `calculated by calculateMetadata() for the composition "${composition.id}"`;

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

	return {width, height, fps, durationInFrames};
};
