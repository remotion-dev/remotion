/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {AbsoluteFill} from './AbsoluteFill.js';
import type {LoopDisplay, SequenceControls} from './CompositionManager.js';
import type {EffectDefinition} from './effects/effect-types.js';
import {Freeze} from './freeze.js';
import {
	sequenceSchema,
	sequenceSchemaWithoutFrom,
} from './interactivity-schema.js';
import {useNonce} from './nonce.js';
import {PremountContext} from './PremountContext.js';
import type {SequenceContextType} from './SequenceContext.js';
import {SequenceContext} from './SequenceContext.js';
import {SequenceManager} from './SequenceManager.js';
import {IsInsideSeriesContext} from './series/is-inside-series.js';
import {
	useTimelineContext,
	useTimelinePosition,
} from './timeline-position-state.js';
import {useCurrentFrame} from './use-current-frame';
import type {BasicMediaInTimelineReturnType} from './use-media-in-timeline.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useVideoConfig} from './use-video-config.js';
import {ENABLE_V5_BREAKING_CHANGES} from './v5-flag.js';
import {withInteractivitySchema} from './with-interactivity-schema.js';

const EMPTY_EFFECTS: readonly EffectDefinition<unknown>[] = [];

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
	readonly from?: number;
	readonly trimBefore?: number;
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
	 * A React ref pointing to the element that Remotion Studio should use for
	 * drawing the selection outline in the preview.
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
		_remotionInternalPremountDisplay: premountDisplay,
		_remotionInternalPostmountDisplay: postmountDisplay,
		_remotionInternalIsMedia: isMedia,
		outlineRef: passedRefForOutline,
		...other
	},
	ref,
) => {
	const {layout = 'absolute-fill'} = other;

	const [id] = useState(() => String(Math.random()));
	const parentSequence = useContext(SequenceContext);
	const {rootId} = useTimelineContext();
	const cumulatedFrom = parentSequence
		? parentSequence.cumulatedFrom + parentSequence.relativeFrom
		: 0;
	const nonce = useNonce();

	if (layout !== 'absolute-fill' && layout !== 'none') {
		throw new TypeError(
			`The layout prop of <Sequence /> expects either "absolute-fill" or "none", but you passed: ${layout}`,
		);
	}

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
	const videoConfig = useVideoConfig();
	const effectiveRelativeFrom = from - trimBefore;
	const absoluteFrom =
		(parentSequence?.absoluteFrom ?? 0) + effectiveRelativeFrom;

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
	const {registerSequence, unregisterSequence} = useContext(SequenceManager);
	const wrapperRefForOutline = useRef<HTMLDivElement | null>(null);
	const refForOutline =
		other.layout === 'none'
			? (passedRefForOutline ?? null)
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
	const currentSequenceStart = cumulatedFrom + effectiveRelativeFrom;
	const parentSequenceStart = parentSequence
		? parentSequence.cumulatedFrom + parentSequence.relativeFrom
		: 0;
	const parentFirstFrame = parentSequence
		? parentSequenceStart - parentSequence.cumulatedNegativeFrom
		: 0;
	const firstFrame = Math.max(0, parentFirstFrame, currentSequenceStart);
	const cumulatedNegativeFrom = currentSequenceStart - firstFrame;

	const contextValue = useMemo((): SequenceContextType => {
		return {
			absoluteFrom,
			cumulatedFrom,
			relativeFrom: effectiveRelativeFrom,
			cumulatedNegativeFrom,
			durationInFrames: actualDurationInFrames,
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
		effectiveRelativeFrom,
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

	const env = useRemotionEnvironment();

	const isInsideSeries = useContext(IsInsideSeriesContext);

	const inheritedStack = (other as {readonly stack?: string})?.stack ?? null;
	// Our assumption: Stack doesnt' change. After we symbolicate we assign it a nodePath
	// and if it changes, it would lead to-remounting of the sequence.
	const stackRef = useRef<string | null>(null);
	stackRef.current = stack ?? inheritedStack;
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

	useEffect(() => {
		if (!env.isStudio) {
			return;
		}

		if (isMedia) {
			if (isMedia.type === 'image') {
				registerSequence({
					type: 'image',
					controls: controls ?? null,
					effects: _remotionInternalEffects ?? EMPTY_EFFECTS,
					displayName: timelineClipName,
					documentationLink: resolvedDocumentationLink,
					duration: actualDurationInFrames,
					from,
					trimBefore: registeredTrimBefore,
					id,
					loopDisplay,
					nonce: nonce.get(),
					parent: parentSequence?.id ?? null,
					postmountDisplay: postmountDisplay ?? null,
					premountDisplay: premountDisplay ?? null,
					rootId,
					showInTimeline,
					src: isMedia.src,
					getStack: () => stackRef.current,
					refForOutline: refForOutline ?? null,
					isInsideSeries,
					frozenFrame: registeredFrozenFrame,
				});
			} else {
				registerSequence({
					type: isMedia.type,
					controls: controls ?? null,
					effects: _remotionInternalEffects ?? EMPTY_EFFECTS,
					displayName: timelineClipName,
					documentationLink: resolvedDocumentationLink,
					doesVolumeChange: isMedia.data.doesVolumeChange,
					duration: actualDurationInFrames,
					from,
					trimBefore: registeredTrimBefore,
					id,
					loopDisplay,
					nonce: nonce.get(),
					parent: parentSequence?.id ?? null,
					playbackRate: isMedia.data.playbackRate,
					postmountDisplay: postmountDisplay ?? null,
					premountDisplay: premountDisplay ?? null,
					rootId,
					showInTimeline,
					src: isMedia.data.src,
					getStack: () => stackRef.current,
					startMediaFrom: startMediaFrom ?? isMedia.data.startMediaFrom,
					volume: isMedia.data.volumes,
					refForOutline: refForOutline ?? null,
					isInsideSeries,
					frozenFrame: registeredFrozenFrame,
					frozenMediaFrame,
				});
			}

			return () => {
				unregisterSequence(id);
			};
		}

		registerSequence({
			from,
			trimBefore: registeredTrimBefore,
			duration: actualDurationInFrames,
			id,
			displayName: timelineClipName,
			documentationLink: resolvedDocumentationLink,
			parent: parentSequence?.id ?? null,
			type: 'sequence',
			rootId,
			showInTimeline,
			nonce: nonce.get(),
			loopDisplay,
			getStack: () => stackRef.current,
			premountDisplay: premountDisplay ?? null,
			postmountDisplay: postmountDisplay ?? null,
			controls: controls ?? null,
			effects: _remotionInternalEffects ?? EMPTY_EFFECTS,
			refForOutline: refForOutline ?? null,
			isInsideSeries,
			frozenFrame: registeredFrozenFrame,
		});
		return () => {
			unregisterSequence(id);
		};
	}, [
		durationInFrames,
		id,
		name,
		registerSequence,
		timelineClipName,
		unregisterSequence,
		parentSequence?.id,
		actualDurationInFrames,
		rootId,
		from,
		trimBefore,
		registeredTrimBefore,
		showInTimeline,
		nonce,
		loopDisplay,
		premountDisplay,
		postmountDisplay,
		env.isStudio,
		controls,
		_remotionInternalEffects,
		isMedia,
		resolvedDocumentationLink,
		refForOutline,
		isInsideSeries,
		registeredFrozenFrame,
		startMediaFrom,
		frozenMediaFrame,
	]);

	// Ceil to support floats
	// https://github.com/remotion-dev/remotion/issues/2958
	const endThreshold = Math.ceil(cumulatedFrom + from + durationInFrames - 1);
	const content =
		absoluteFrame < cumulatedFrom + from
			? null
			: absoluteFrame > endThreshold
				? null
				: children;
	const frozenContent =
		content === null || typeof freeze === 'undefined' || freeze === null ? (
			content
		) : (
			<Freeze frame={freeze}>{content}</Freeze>
		);

	const styleIfThere = other.layout === 'none' ? undefined : other.style;

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
		};
	}, [height, styleIfThere, width]);

	if (ref !== null && layout === 'none') {
		throw new TypeError(
			'It is not supported to pass both a `ref` and `layout="none"` to <Sequence />.',
		);
	}

	if (hidden) {
		return null;
	}

	return (
		<SequenceContext.Provider value={contextValue}>
			{frozenContent === null ? null : other.layout === 'none' ? (
				frozenContent
			) : (
				<AbsoluteFill
					ref={sequenceRef}
					style={defaultStyle}
					className={other.className}
				>
					{frozenContent}
				</AbsoluteFill>
			)}
		</SequenceContext.Provider>
	);
};

const RegularSequence = forwardRef(RegularSequenceRefForwardingFunction);

const PremountedPostmountedSequenceRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLDivElement,
	SequenceProps
> = (props, ref) => {
	const parentPremountContext = useContext(PremountContext);
	const frame =
		useCurrentFrame() - parentPremountContext.premountFramesRemaining;

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

	const endThreshold = Math.ceil(from + durationInFrames - 1);
	const premountingActive = frame < from && frame >= from - premountFor;
	const postmountingActive =
		frame > endThreshold && frame <= endThreshold + postmountFor;

	// Determine which freeze frame to use
	const freezeFrame = premountingActive
		? from
		: postmountingActive
			? from + durationInFrames - 1
			: 0;
	const isFreezingActive = premountingActive || postmountingActive;

	const style = useMemo(() => {
		return {
			...passedStyle,
			opacity: premountingActive || postmountingActive ? 0 : 1,
			pointerEvents:
				premountingActive || postmountingActive
					? 'none'
					: (passedStyle?.pointerEvents ?? undefined),
			...(premountingActive ? styleWhilePremounted : {}),
			...(postmountingActive ? styleWhilePostmounted : {}),
		};
	}, [
		passedStyle,
		premountingActive,
		postmountingActive,
		styleWhilePremounted,
		styleWhilePostmounted,
	]);

	return (
		<Freeze frame={freezeFrame} active={isFreezingActive}>
			<SequenceInner
				ref={ref}
				from={from}
				durationInFrames={durationInFrames}
				style={style}
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
