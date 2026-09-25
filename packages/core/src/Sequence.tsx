/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
	forwardRef,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react';
import {AbsoluteFillElement} from './AbsoluteFillElement.js';
import type {
	LoopDisplay,
	SequenceControls,
	SequenceRegistrationControls,
	TSequence,
} from './CompositionManager.js';
import type {EffectDefinition} from './effects/effect-types.js';
import {getStackForControls} from './enable-sequence-stack-traces.js';
import {Freeze} from './freeze.js';
import {getSequenceBoundaryTolerance} from './get-sequence-boundary-tolerance.js';
import {
	sequenceSchema,
	sequenceSchemaWithoutFrom,
} from './interactivity-schema.js';
import type {RuntimeValueStore} from './runtime-value-store.js';
import {
	getSequenceCropClipPath,
	resolveSequenceCrop,
	validateSequenceCrop,
} from './sequence-crop.js';
import {SequenceOrderMarker} from './sequence-order-marker.js';
import {
	SequenceOutlineContext,
	SequenceOutlineInternals,
} from './sequence-outline.js';
import type {SequenceContextType} from './SequenceContext.js';
import {SequenceContext} from './SequenceContext.js';
import {SequenceRegistrationContext} from './SequenceManager.js';
import {IsInsideSeriesContext} from './series/is-inside-series.js';
import {useTimelinePosition} from './timeline-position-state.js';
import type {BasicMediaInTimelineReturnType} from './use-media-in-timeline.js';
import {usePremounting} from './use-premounting.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useSequenceRegistration} from './use-sequence-registration.js';
import {useVideoConfig} from './use-video-config.js';
import {ENABLE_V5_BREAKING_CHANGES} from './v5-flag.js';
import {withInteractivitySchema} from './with-interactivity-schema.js';

const EMPTY_EFFECTS: readonly EffectDefinition<unknown>[] = [];
type EffectDefinitionsWithRuntimeValues =
	readonly EffectDefinition<unknown>[] & {
		readonly runtimeValues: readonly RuntimeValueStore[];
	};

export type AbsoluteFillLayout = {
	layout?: 'absolute-fill';
	premountFor?: number;
	postmountFor?: number;
	style?: React.CSSProperties;
	styleWhilePremounted?: React.CSSProperties;
	styleWhilePostmounted?: React.CSSProperties;
	className?: string;
};

export type LayoutAndStyle =
	| AbsoluteFillLayout
	| {
			layout: 'none';
	  };

export type SequencePropsWithoutDuration = {
	readonly children?: React.ReactNode;
	readonly width?: number;
	readonly height?: number;
	readonly cropLeft?: number;
	readonly cropRight?: number;
	readonly cropTop?: number;
	readonly cropBottom?: number;
	readonly from?: number;
	readonly trimBefore?: number;
	readonly playbackRate?: number;
	readonly freeze?: number | null;
	readonly name?: string;
	readonly showInTimeline?: boolean;
	readonly hidden?: boolean;
	readonly controls?: SequenceControls;
	readonly _remotionInternalEffects?: readonly EffectDefinition<unknown>[];
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalLoopDisplay?: LoopDisplay;
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalPremountDisplay?: number | null;
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalPostmountDisplay?: number | null;
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalStack?: string;
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalDocumentationLink?: string;
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalSingleChildComponent?: unknown;
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalIsPremounting?: boolean;
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalIsPostmounting?: boolean;
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalIsMedia?:
		| {
				type: 'video' | 'audio';
				data: BasicMediaInTimelineReturnType;
		  }
		| {
				type: 'image';
				src: string;
		  };
	/**
	 * @deprecated Remotion Studio discovers rendered elements automatically.
	 * Remove this prop.
	 */
	readonly outlineRef?: React.RefObject<Element | null> | null;
} & LayoutAndStyle;

export type SequenceProps = {
	readonly durationInFrames?: number;
} & SequencePropsWithoutDuration;

const RegularSequenceRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLDivElement,
	SequenceProps
> = (
	{
		from = 0,
		trimBefore = 0,
		playbackRate = 1,
		freeze,
		durationInFrames = Infinity,
		children,
		name,
		height,
		width,
		showInTimeline = true,
		hidden = false,
		controls,
		_remotionInternalEffects,
		_remotionInternalLoopDisplay: loopDisplay,
		_remotionInternalStack: stack,
		_remotionInternalDocumentationLink: documentationLink,
		_remotionInternalSingleChildComponent: singleChildComponent,
		_remotionInternalPremountDisplay: premountDisplay,
		_remotionInternalPostmountDisplay: postmountDisplay,
		_remotionInternalIsMedia: isMedia,
		outlineRef: passedRefForOutline,
		cropLeft,
		cropRight,
		cropTop,
		cropBottom,
		...other
	},
	ref,
) => {
	const {layout = 'absolute-fill'} = other;

	const [id] = useState(() => String(Math.random()));
	const parentSequence = useContext(SequenceContext);
	const parentPlaybackRate = parentSequence?.playbackRate ?? 1;
	const cumulativePlaybackRate = parentPlaybackRate * playbackRate;
	const cumulatedFrom = parentSequence
		? parentSequence.cumulatedFrom + parentSequence.relativeFrom
		: 0;
	if (layout !== 'absolute-fill' && layout !== 'none') {
		throw new TypeError(
			`The layout prop of <Sequence /> expects either "absolute-fill" or "none", but you passed: ${layout}`,
		);
	}

	const cropProps = {cropLeft, cropRight, cropTop, cropBottom};
	const hasCropProp = Object.values(cropProps).some(
		(value) => value !== undefined,
	);

	if (layout === 'none' && hasCropProp) {
		throw new TypeError(
			'The cropLeft, cropRight, cropTop and cropBottom props of <Sequence /> are only supported with layout="absolute-fill".',
		);
	}

	validateSequenceCrop(cropProps);
	const {
		left: resolvedCropLeft,
		right: resolvedCropRight,
		top: resolvedCropTop,
		bottom: resolvedCropBottom,
	} = resolveSequenceCrop(cropProps);
	// @ts-expect-error
	if (layout === 'none' && typeof other.style !== 'undefined') {
		throw new TypeError(
			'If layout="none", you may not pass a style. Passed: ' +
				// @ts-expect-error
				JSON.stringify(other.style),
		);
	}

	if (typeof durationInFrames !== 'number') {
		throw new TypeError(
			`You passed to durationInFrames an argument of type ${typeof durationInFrames}, but it must be a number.`,
		);
	}

	if (durationInFrames <= 0) {
		throw new TypeError(
			`durationInFrames must be positive, but got ${durationInFrames}`,
		);
	}

	if (typeof from !== 'number') {
		throw new TypeError(
			`You passed to the "from" props of your <Sequence> an argument of type ${typeof from}, but it must be a number.`,
		);
	}

	if (!Number.isFinite(from)) {
		throw new TypeError(
			`The "from" prop of a sequence must be finite, but got ${from}.`,
		);
	}

	if (typeof trimBefore !== 'number') {
		throw new TypeError(
			`You passed to the "trimBefore" prop of your <Sequence> an argument of type ${typeof trimBefore}, but it must be a number.`,
		);
	}

	if (trimBefore < 0) {
		throw new TypeError(
			`The "trimBefore" prop of <Sequence /> must be greater than or equal to 0, but got ${trimBefore}.`,
		);
	}

	if (Number.isNaN(trimBefore)) {
		throw new TypeError(
			'The "trimBefore" prop of <Sequence /> must be a real number, but it is NaN.',
		);
	}

	if (!Number.isFinite(trimBefore)) {
		throw new TypeError(
			`The "trimBefore" prop of <Sequence /> must be finite, but it is ${trimBefore}.`,
		);
	}

	if (typeof freeze !== 'undefined' && freeze !== null) {
		if (typeof freeze !== 'number') {
			throw new TypeError(
				`The "freeze" prop of <Sequence /> must be a number, but is of type ${typeof freeze}.`,
			);
		}

		if (Number.isNaN(freeze)) {
			throw new TypeError(
				`The "freeze" prop of <Sequence /> must be a real number, but it is NaN.`,
			);
		}

		if (!Number.isFinite(freeze)) {
			throw new TypeError(
				`The "freeze" prop of <Sequence /> must be finite, but it is ${freeze}.`,
			);
		}
	}

	const absoluteFrame = useTimelinePosition();
	const lastPlaybackRate = useRef({playbackRate, frame: absoluteFrame});
	if (
		typeof playbackRate !== 'number' ||
		!Number.isFinite(playbackRate) ||
		playbackRate <= 0
	) {
		throw new TypeError(
			`The "playbackRate" prop of <Sequence /> must be a positive finite number, but got ${playbackRate}.`,
		);
	}

	if (
		lastPlaybackRate.current.frame !== absoluteFrame &&
		lastPlaybackRate.current.playbackRate !== playbackRate
	) {
		throw new Error(
			'The "playbackRate" prop of <Sequence /> must be constant. Animating playbackRate is not supported.',
		);
	}

	lastPlaybackRate.current = {playbackRate, frame: absoluteFrame};
	const videoConfig = useVideoConfig();
	const effectiveRelativeFrom = from - trimBefore / playbackRate;
	const relativeFrom = effectiveRelativeFrom / parentPlaybackRate;
	const absoluteFrom = (parentSequence?.absoluteFrom ?? 0) + relativeFrom;

	const parentSequenceDuration = parentSequence
		? Math.min(
				parentSequence.durationInFrames - effectiveRelativeFrom,
				durationInFrames,
			)
		: durationInFrames;
	const actualDurationInFrames = Math.max(
		0,
		Math.min(videoConfig.durationInFrames - from, parentSequenceDuration),
	);
	const sequenceRegistrationEnabled = useContext(SequenceRegistrationContext);
	const canvasOutlinesEnabled = useContext(SequenceOutlineContext);
	const env = useRemotionEnvironment();
	const shouldDiscoverOutline = env.isStudio || canvasOutlinesEnabled;
	const automaticOutlineRef = useMemo(
		() =>
			shouldDiscoverOutline && layout === 'none' && !passedRefForOutline
				? SequenceOutlineInternals.createRef()
				: null,
		[shouldDiscoverOutline, layout, passedRefForOutline],
	);
	const wrapperRefForOutline = useRef<HTMLDivElement | null>(null);
	const refForOutline =
		other.layout === 'none'
			? (passedRefForOutline ?? automaticOutlineRef)
			: (passedRefForOutline ?? wrapperRefForOutline);

	const premounting = useMemo(() => {
		// || is intentional, ?? would not trigger on `false`
		return (
			parentSequence?.premounting ||
			Boolean(other._remotionInternalIsPremounting)
		);
	}, [other._remotionInternalIsPremounting, parentSequence?.premounting]);

	const postmounting = useMemo(() => {
		// || is intentional, ?? would not trigger on `false`
		return (
			parentSequence?.postmounting ||
			Boolean(other._remotionInternalIsPostmounting)
		);
	}, [other._remotionInternalIsPostmounting, parentSequence?.postmounting]);

	// `cumulatedNegativeFrom` answers: "How many frames of this media have
	// already elapsed before the first visible frame of this sequence?"
	//
	// This is intentionally based on the effective sequence start, not on adding
	// all negative `from` values. See the asset-calculation tests for:
	// - "Should calculate startFrom correctly with negative offset (Html5Audio)"
	// - "same as above, but with <Sequence from={0}> inbetween"
	// - "same as above, but a positive child offset cancels part of the negative parent offset"
	//
	// In particular, <Sequence from={-20}><Sequence from={10}> should have a
	// 10-frame pre-roll, because the positive child offset cancels part of the
	// negative parent offset. But <Sequence from={10}><Sequence from={-5}>
	// should still trim 5 frames from the media once the parent starts.
	const currentSequenceStart = cumulatedFrom + relativeFrom;
	const parentSequenceStart = parentSequence
		? parentSequence.cumulatedFrom + parentSequence.relativeFrom
		: 0;
	const parentFirstFrame = parentSequence
		? parentSequenceStart -
			parentSequence.cumulatedNegativeFrom / parentPlaybackRate
		: 0;
	const firstFrame = Math.max(
		0,
		parentFirstFrame,
		cumulatedFrom + from / parentPlaybackRate,
	);
	const cumulatedNegativeFrom =
		(currentSequenceStart - firstFrame) * cumulativePlaybackRate;

	const contextValue = useMemo((): SequenceContextType => {
		return {
			playbackRate: cumulativePlaybackRate,
			absoluteFrom,
			cumulatedFrom,
			relativeFrom,
			cumulatedNegativeFrom,
			durationInFrames: actualDurationInFrames * playbackRate + trimBefore,
			parentFrom: parentSequence?.relativeFrom ?? 0,
			id,
			height: height ?? parentSequence?.height ?? null,
			width: width ?? parentSequence?.width ?? null,
			premounting,
			postmounting,
			premountDisplay: premountDisplay ?? null,
			postmountDisplay: postmountDisplay ?? null,
		};
	}, [
		cumulatedFrom,
		absoluteFrom,
		relativeFrom,
		cumulativePlaybackRate,
		playbackRate,
		trimBefore,
		actualDurationInFrames,
		parentSequence,
		id,
		height,
		width,
		premounting,
		postmounting,
		premountDisplay,
		postmountDisplay,
		cumulatedNegativeFrom,
	]);

	const timelineClipName = useMemo(() => {
		return name ?? '';
	}, [name]);

	const resolvedDocumentationLink =
		documentationLink ?? 'https://www.remotion.dev/docs/sequence';

	const isInsideSeries = useContext(IsInsideSeriesContext);

	// Our assumption: Stack doesnt' change. After we symbolicate we assign it a nodePath
	// and if it changes, it would lead to-remounting of the sequence.
	const stackRef = useRef<string | null>(null);
	stackRef.current = controls
		? (getStackForControls(controls) ?? stack ?? null)
		: (stack ?? null);
	const registeredFrozenFrame = typeof freeze === 'number' ? freeze : null;
	const registeredTrimBefore = trimBefore === 0 ? null : trimBefore;
	const parentCumulatedNegativeFrom =
		parentSequence?.cumulatedNegativeFrom ?? 0;
	const startMediaFrom =
		isMedia && isMedia.type !== 'image'
			? isMedia.data.startMediaFrom +
				parentCumulatedNegativeFrom -
				cumulatedNegativeFrom
			: null;
	const mediaFrameAtSequenceZero =
		isMedia && isMedia.type !== 'image'
			? isMedia.data.startMediaFrom + parentCumulatedNegativeFrom
			: null;
	const frozenMediaFrame =
		isMedia && isMedia.type !== 'image' && mediaFrameAtSequenceZero !== null
			? registeredFrozenFrame === null
				? null
				: mediaFrameAtSequenceZero +
					(loopDisplay
						? registeredFrozenFrame % loopDisplay.durationInFrames
						: registeredFrozenFrame) *
						isMedia.data.playbackRate
			: null;
	const controlsSchema = controls?.schema;
	const controlsRuntimeValues = controls?.runtimeValues;
	const controlsOverrideId = controls?.overrideId;
	const controlsSupportsEffects = controls?.supportsEffects;
	const controlsComponentIdentity = controls?.componentIdentity;
	const controlsComponentName = controls?.componentName;
	const controlsVideoConfigValues = controls?.videoConfigValues;
	const effectRuntimeValues = useMemo(
		() =>
			(
				_remotionInternalEffects as
					| EffectDefinitionsWithRuntimeValues
					| undefined
			)?.runtimeValues ?? null,
		[_remotionInternalEffects],
	);
	const registrationControls =
		useMemo((): SequenceRegistrationControls | null => {
			if (
				controlsSchema === undefined ||
				controlsRuntimeValues === undefined ||
				controlsOverrideId === undefined ||
				controlsSupportsEffects === undefined ||
				controlsComponentIdentity === undefined ||
				controlsComponentName === undefined ||
				controlsVideoConfigValues === undefined
			) {
				return null;
			}

			return {
				schema: controlsSchema,
				runtimeValues: controlsRuntimeValues,
				overrideId: controlsOverrideId,
				supportsEffects: controlsSupportsEffects,
				componentIdentity: controlsComponentIdentity,
				componentName: controlsComponentName,
				videoConfigValues: controlsVideoConfigValues,
			};
		}, [
			controlsComponentIdentity,
			controlsComponentName,
			controlsVideoConfigValues,
			controlsOverrideId,
			controlsRuntimeValues,
			controlsSchema,
			controlsSupportsEffects,
		]);

	const getSequenceForRegistration = useCallback((): TSequence => {
		if (isMedia) {
			if (isMedia.type === 'image') {
				return {
					sequencePlaybackRate: playbackRate,
					type: 'image',
					controls: registrationControls,
					effects: _remotionInternalEffects ?? EMPTY_EFFECTS,
					effectRuntimeValues,
					displayName: timelineClipName,
					documentationLink: resolvedDocumentationLink,
					duration: actualDurationInFrames,
					from,
					trimBefore: registeredTrimBefore,
					id,
					loopDisplay,
					parent: parentSequence?.id ?? null,
					postmountDisplay: postmountDisplay ?? null,
					premountDisplay: premountDisplay ?? null,
					showInTimeline,
					timelineOrder: null,
					src: isMedia.src,
					getStack: () => stackRef.current,
					refForOutline: refForOutline ?? null,
					isInsideSeries,
					frozenFrame: registeredFrozenFrame,
					singleChildComponent: singleChildComponent ?? null,
				};
			}

			return {
				type: isMedia.type,
				sequencePlaybackRate: playbackRate,
				controls: registrationControls,
				effects: _remotionInternalEffects ?? EMPTY_EFFECTS,
				effectRuntimeValues,
				displayName: timelineClipName,
				documentationLink: resolvedDocumentationLink,
				doesVolumeChange: isMedia.data.doesVolumeChange,
				duration: actualDurationInFrames,
				from,
				trimBefore: registeredTrimBefore,
				id,
				loopDisplay,
				parent: parentSequence?.id ?? null,
				playbackRate: isMedia.data.playbackRate,
				postmountDisplay: postmountDisplay ?? null,
				premountDisplay: premountDisplay ?? null,
				showInTimeline,
				timelineOrder: null,
				src: isMedia.data.src,
				getStack: () => stackRef.current,
				startMediaFrom: startMediaFrom ?? isMedia.data.startMediaFrom,
				mediaFrameAtSequenceZero,
				volume: isMedia.data.volumes,
				muted: isMedia.data.muted,
				refForOutline: refForOutline ?? null,
				isInsideSeries,
				frozenFrame: registeredFrozenFrame,
				frozenMediaFrame,
				singleChildComponent: singleChildComponent ?? null,
			};
		}

		return {
			from,
			sequencePlaybackRate: playbackRate,
			trimBefore: registeredTrimBefore,
			duration: actualDurationInFrames,
			id,
			displayName: timelineClipName,
			documentationLink: resolvedDocumentationLink,
			parent: parentSequence?.id ?? null,
			type: 'sequence',
			showInTimeline,
			timelineOrder: null,
			loopDisplay,
			getStack: () => stackRef.current,
			premountDisplay: premountDisplay ?? null,
			postmountDisplay: postmountDisplay ?? null,
			controls: registrationControls,
			effects: _remotionInternalEffects ?? EMPTY_EFFECTS,
			effectRuntimeValues,
			refForOutline: refForOutline ?? null,
			isInsideSeries,
			frozenFrame: registeredFrozenFrame,
			singleChildComponent: singleChildComponent ?? null,
		};
	}, [
		id,
		timelineClipName,
		playbackRate,
		parentSequence?.id,
		actualDurationInFrames,
		from,
		registeredTrimBefore,
		showInTimeline,
		loopDisplay,
		premountDisplay,
		postmountDisplay,
		registrationControls,
		_remotionInternalEffects,
		effectRuntimeValues,
		isMedia,
		resolvedDocumentationLink,
		refForOutline,
		isInsideSeries,
		registeredFrozenFrame,
		startMediaFrom,
		mediaFrameAtSequenceZero,
		frozenMediaFrame,
		singleChildComponent,
	]);
	useSequenceRegistration({
		getSequence:
			env.isStudio || sequenceRegistrationEnabled
				? getSequenceForRegistration
				: null,
		id,
	});

	// Use an exclusive end so fractional clocks and frozen subframes remain visible.
	const frameInParent = (absoluteFrame - cumulatedFrom) * parentPlaybackRate;
	const endThreshold = from + durationInFrames;
	const boundaryTolerance = getSequenceBoundaryTolerance({
		absoluteFrame,
		cumulatedFrom,
		from,
		parentPlaybackRate,
		durationInFrames,
	});
	const content =
		frameInParent - from < -boundaryTolerance
			? null
			: frameInParent - endThreshold >= -boundaryTolerance
				? null
				: children;
	const frozenContent =
		content === null || typeof freeze === 'undefined' || freeze === null ? (
			content
		) : (
			<Freeze frame={freeze}>{content}</Freeze>
		);

	const styleIfThere = other.layout === 'none' ? undefined : other.style;
	const cropClipPath = getSequenceCropClipPath({
		left: resolvedCropLeft,
		right: resolvedCropRight,
		top: resolvedCropTop,
		bottom: resolvedCropBottom,
		style: styleIfThere,
	});

	const sequenceRef = useCallback(
		(node: HTMLDivElement | null) => {
			wrapperRefForOutline.current = node;

			if (typeof ref === 'function') {
				ref(node);
			} else if (ref) {
				ref.current = node;
			}
		},
		[ref],
	);

	const defaultStyle: React.CSSProperties = useMemo(() => {
		return {
			flexDirection: undefined,
			...(width ? {width} : {}),
			...(height ? {height} : {}),
			...(styleIfThere ?? {}),
			...(cropClipPath
				? {
						clipPath: cropClipPath,
					}
				: {}),
		};
	}, [cropClipPath, height, styleIfThere, width]);

	if (ref !== null && layout === 'none') {
		throw new TypeError(
			'It is not supported to pass both a `ref` and `layout="none"` to <Sequence />.',
		);
	}

	if (hidden) {
		return shouldDiscoverOutline ? (
			<SequenceOrderMarker
				sequenceId={id}
				outlineChildrenRef={automaticOutlineRef}
			>
				{null}
			</SequenceOrderMarker>
		) : null;
	}

	const sequence = (
		<SequenceContext.Provider value={contextValue}>
			{frozenContent === null ? null : other.layout === 'none' ? (
				frozenContent
			) : (
				<AbsoluteFillElement
					ref={sequenceRef}
					style={defaultStyle}
					className={other.className}
				>
					{frozenContent}
				</AbsoluteFillElement>
			)}
		</SequenceContext.Provider>
	);

	return shouldDiscoverOutline ? (
		<SequenceOrderMarker
			sequenceId={id}
			outlineChildrenRef={automaticOutlineRef}
		>
			{sequence}
		</SequenceOrderMarker>
	) : (
		sequence
	);
};

const RegularSequence = forwardRef(RegularSequenceRefForwardingFunction);

const PremountedPostmountedSequenceRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLDivElement,
	SequenceProps
> = (props, ref) => {
	if (props.layout === 'none') {
		throw new Error(
			'`<Sequence>` with `premountFor` and `postmountFor` props does not support layout="none"',
		);
	}

	const {
		style: passedStyle,
		from = 0,
		durationInFrames = Infinity,
		premountFor = 0,
		postmountFor = 0,
		styleWhilePremounted,
		styleWhilePostmounted,
		...otherProps
	} = props;

	const {
		freezeFrame,
		isPremountingOrPostmounting,
		postmountingActive,
		premountingActive,
		premountingStyle,
	} = usePremounting({
		from,
		durationInFrames,
		premountFor,
		postmountFor,
		style: passedStyle ?? null,
		styleWhilePremounted: styleWhilePremounted ?? null,
		styleWhilePostmounted: styleWhilePostmounted ?? null,
		hideWhilePremounted: 'opacity',
	});

	return (
		<Freeze frame={freezeFrame} active={isPremountingOrPostmounting}>
			<SequenceInner
				ref={ref}
				from={from}
				durationInFrames={durationInFrames}
				style={premountingStyle ?? undefined}
				_remotionInternalPremountDisplay={premountFor}
				_remotionInternalPostmountDisplay={postmountFor}
				_remotionInternalIsPremounting={premountingActive}
				_remotionInternalIsPostmounting={postmountingActive}
				{...otherProps}
			/>
		</Freeze>
	);
};

const PremountedPostmountedSequence = forwardRef(
	PremountedPostmountedSequenceRefForwardingFunction,
);

const SequenceRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLDivElement,
	SequenceProps
> = (props, ref) => {
	const env = useRemotionEnvironment();
	const {fps} = useVideoConfig();
	if (props.layout !== 'none' && !env.isRendering) {
		const effectivePremountFor = ENABLE_V5_BREAKING_CHANGES
			? (props.premountFor ?? fps)
			: props.premountFor;
		if (effectivePremountFor || props.postmountFor) {
			return (
				<PremountedPostmountedSequence
					ref={ref}
					{...props}
					premountFor={effectivePremountFor}
				/>
			);
		}
	}

	return <RegularSequence {...props} ref={ref} />;
};

const SequenceInner = forwardRef(SequenceRefForwardingFunction);
export const SequenceWithoutSchema = SequenceInner;

/*
 * @description A component that time-shifts its children and wraps them in an absolutely positioned <div>.
 * @see [Documentation](https://www.remotion.dev/docs/sequence)
 */
export const Sequence = withInteractivitySchema({
	Component: SequenceInner,
	componentName: '<Sequence>',
	componentIdentity: 'dev.remotion.remotion.Sequence',
	schema: sequenceSchema,
	supportsEffects: false,
});

export const SequenceWithoutFrom = withInteractivitySchema({
	Component: SequenceInner,
	componentName: '<Sequence>',
	componentIdentity: null,
	schema: sequenceSchemaWithoutFrom,
	supportsEffects: false,
});
