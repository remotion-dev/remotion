import {
	createContext,
	createRef,
	useContext,
	useMemo,
} from 'react';
import type {AnyComposition} from './CompositionManager.js';
import {CompositionManager} from './CompositionManagerContext.js';
import {EditorPropsContext} from './EditorProps.js';
import {getInputProps} from './config/input-props.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {validateDimension} from './validation/validate-dimensions.js';
import {validateDurationInFrames} from './validation/validate-duration-in-frames.js';
import {validateFps} from './validation/validate-fps.js';
import type {VideoConfig} from './video-config.js';

type ResolveCompositionConfigContect = Record<
	string,
	VideoConfigState | undefined
>;

export const ResolveCompositionContext =
	createContext<ResolveCompositionConfigContect | null>(null);

export const resolveCompositionsRef = createRef<{
	setCurrentRenderModalComposition: (compositionId: string | null) => void;
	reloadCurrentlySelectedComposition: () => void;
}>();

type VideoConfigState =
	| {
			type: 'loading';
	  }
	| {
			type: 'success';
			result: VideoConfig;
	  }
	| {
			type: 'success-and-refreshing';
			result: VideoConfig;
	  }
	| {
			type: 'error';
			error: Error;
	  };

export const needsResolution = (composition: AnyComposition) => {
	return Boolean(composition.calculateMetadata);
};

export const PROPS_UPDATED_EXTERNALLY = 'remotion.propsUpdatedExternally';

export const useResolvedVideoConfig = (
	preferredCompositionId: string | null,
): VideoConfigState | null => {
	const context = useContext(ResolveCompositionContext);

	const {props: allEditorProps} = useContext(EditorPropsContext);

	const {compositions, canvasContent, currentCompositionMetadata} =
		useContext(CompositionManager);
	const currentComposition =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const compositionId = preferredCompositionId ?? currentComposition;
	const composition = compositions.find((c) => c.id === compositionId);

	const selectedEditorProps = useMemo(() => {
		return composition ? (allEditorProps[composition.id] ?? {}) : {};
	}, [allEditorProps, composition]);

	const env = useRemotionEnvironment();

	return useMemo(() => {
		if (!composition) {
			return null;
		}

		if (currentCompositionMetadata) {
			return {
				type: 'success',
				result: {
					...currentCompositionMetadata,
					id: composition.id,
					defaultProps: composition.defaultProps ?? {},
				},
			};
		}

		if (!needsResolution(composition)) {
			validateDurationInFrames(composition.durationInFrames, {
				allowFloats: false,
				component: `in <Composition id="${composition.id}">`,
			});
			validateFps(
				composition.fps,
				`in <Composition id="${composition.id}">`,
				false,
			);
			validateDimension(
				composition.width,
				'width',
				`in <Composition id="${composition.id}">`,
			);
			validateDimension(
				composition.height,
				'height',
				`in <Composition id="${composition.id}">`,
			);

			return {
				type: 'success',
				result: {
					width: composition.width as number,
					height: composition.height as number,
					fps: composition.fps as number,
					id: composition.id,
					durationInFrames: composition.durationInFrames as number,
					defaultProps: composition.defaultProps ?? {},
					props: {
						...(composition.defaultProps ?? {}),
						...(selectedEditorProps ?? {}),
						...(typeof window === 'undefined' ||
						env.isPlayer ||
						// In tests, we don't set window.remotion_inputProps,
						// otherwise it should be available here
						!window.remotion_inputProps
							? {}
							: (getInputProps() ?? {})),
					},
					defaultCodec: null,
					defaultOutName: null,
					defaultVideoImageFormat: null,
					defaultPixelFormat: null,
					defaultProResProfile: null,
				},
			};
		}

		// Could be the case in selectComposition()
		if (!context) {
			return null;
		}

		if (!context[composition.id]) {
			return null;
		}

		return context[composition.id] as VideoConfigState;
	}, [
		composition,
		context,
		currentCompositionMetadata,
		selectedEditorProps,
		env.isPlayer,
	]);
};
