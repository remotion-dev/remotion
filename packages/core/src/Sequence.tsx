/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
	forwardRef,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {AbsoluteFill} from './AbsoluteFill.js';
import type {LoopDisplay} from './CompositionManager.js';
import type {SequenceContextType} from './SequenceContext.js';
import {SequenceContext} from './SequenceContext.js';
import {
	SequenceManager,
	SequenceVisibilityToggleContext,
} from './SequenceManager.js';
import {TimelineContext} from './TimelineContext.js';
import {useNonce} from './nonce.js';
import {useTimelinePosition} from './timeline-position-state.js';
import {useVideoConfig} from './use-video-config.js';

import {Freeze} from './freeze.js';
import {useCurrentFrame} from './use-current-frame';
import {useRemotionEnvironment} from './use-remotion-environment.js';

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
	readonly children: React.ReactNode;
	readonly width?: number;
	readonly height?: number;
	readonly from?: number;
	readonly name?: string;
	readonly showInTimeline?: boolean;
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
	readonly _remotionInternalIsPremounting?: boolean;
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalIsPostmounting?: boolean;
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
		durationInFrames = Infinity,
		children,
		name,
		height,
		width,
		showInTimeline = true,
		_remotionInternalLoopDisplay: loopDisplay,
		_remotionInternalStack: stack,
		_remotionInternalPremountDisplay: premountDisplay,
		_remotionInternalPostmountDisplay: postmountDisplay,
		...other
	},
	ref,
) => {
	const {layout = 'absolute-fill'} = other;

	const [id] = useState(() => String(Math.random()));
	const parentSequence = useContext(SequenceContext);
	const {rootId} = useContext(TimelineContext);
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
		throw new TypeError('If layout="none", you may not pass a style.');
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

	const absoluteFrame = useTimelinePosition();
	const videoConfig = useVideoConfig();

	const parentSequenceDuration = parentSequence
		? Math.min(parentSequence.durationInFrames - from, durationInFrames)
		: durationInFrames;
	const actualDurationInFrames = Math.max(
		0,
		Math.min(videoConfig.durationInFrames - from, parentSequenceDuration),
	);
	const {registerSequence, unregisterSequence} = useContext(SequenceManager);
	const {hidden} = useContext(SequenceVisibilityToggleContext);

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

	const contextValue = useMemo((): SequenceContextType => {
		return {
			cumulatedFrom,
			relativeFrom: from,
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
		from,
		actualDurationInFrames,
		parentSequence,
		id,
		height,
		width,
		premounting,
		postmounting,
		premountDisplay,
		postmountDisplay,
	]);

	const timelineClipName = useMemo(() => {
		return name ?? '';
	}, [name]);

	const env = useRemotionEnvironment();

	useEffect(() => {
		if (!env.isStudio) {
			return;
		}

		registerSequence({
			from,
			duration: actualDurationInFrames,
			id,
			displayName: timelineClipName,
			parent: parentSequence?.id ?? null,
			type: 'sequence',
			rootId,
			showInTimeline,
			nonce,
			loopDisplay,
			stack: stack ?? null,
			premountDisplay: premountDisplay ?? null,
			postmountDisplay: postmountDisplay ?? null,
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
		showInTimeline,
		nonce,
		loopDisplay,
		stack,
		premountDisplay,
		postmountDisplay,
		env.isStudio,
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

	const styleIfThere = other.layout === 'none' ? undefined : other.style;

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

	const isSequenceHidden = hidden[id] ?? false;

	if (isSequenceHidden) {
		return null;
	}

	return (
		<SequenceContext.Provider value={contextValue}>
			{content === null ? null : other.layout === 'none' ? (
				content
			) : (
				<AbsoluteFill
					ref={ref}
					style={defaultStyle}
					className={other.className}
				>
					{content}
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
	const frame = useCurrentFrame();

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
			<Sequence
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
	if (props.layout !== 'none' && !env.isRendering) {
		if (props.premountFor || props.postmountFor) {
			return <PremountedPostmountedSequence {...props} ref={ref} />;
		}
	}

	return <RegularSequence {...props} ref={ref} />;
};

/*
 * @description A component that time-shifts its children and wraps them in an absolutely positioned <div>.
 * @see [Documentation](https://www.remotion.dev/docs/sequence)
 */
export const Sequence = forwardRef(SequenceRefForwardingFunction);
