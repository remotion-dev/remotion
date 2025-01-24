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
import {getRemotionEnvironment} from './get-remotion-environment.js';
import {useNonce} from './nonce.js';
import {
	TimelineContext,
	useTimelinePosition,
} from './timeline-position-state.js';
import {useVideoConfig} from './use-video-config.js';

import {Freeze} from './freeze.js';
import {useCurrentFrame} from './use-current-frame';

export type AbsoluteFillLayout = {
	layout?: 'absolute-fill';
	premountFor?: number;
	style?: React.CSSProperties;
	styleWhilePremounted?: React.CSSProperties;
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
	readonly _remotionInternalStack?: string;
	/**
	 * @deprecated For internal use only.
	 */
	readonly _remotionInternalIsPremounting?: boolean;
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
		return (
			parentSequence?.premounting ??
			Boolean(other._remotionInternalIsPremounting)
		);
	}, [other._remotionInternalIsPremounting, parentSequence?.premounting]);

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
	]);

	const timelineClipName = useMemo(() => {
		return name ?? '';
	}, [name]);

	useEffect(() => {
		if (!getRemotionEnvironment().isStudio) {
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

const PremountedSequenceRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLDivElement,
	SequenceProps
> = (props, ref) => {
	const frame = useCurrentFrame();

	if (props.layout === 'none') {
		throw new Error(
			'`<Sequence>` with `premountFor` prop does not support layout="none"',
		);
	}

	const {
		style: passedStyle,
		from = 0,
		premountFor = 0,
		styleWhilePremounted,
		...otherProps
	} = props;

	const premountingActive = frame < from && frame >= from - premountFor;

	const style = useMemo(() => {
		return {
			...passedStyle,
			opacity: premountingActive ? 0 : 1,
			pointerEvents: premountingActive
				? 'none'
				: (passedStyle?.pointerEvents ?? undefined),
			...(premountingActive ? styleWhilePremounted : {}),
		};
	}, [passedStyle, premountingActive, styleWhilePremounted]);

	return (
		<Freeze frame={from} active={premountingActive}>
			<Sequence
				ref={ref}
				from={from}
				style={style}
				_remotionInternalPremountDisplay={premountFor}
				_remotionInternalIsPremounting={premountingActive}
				{...otherProps}
			/>
		</Freeze>
	);
};

const PremountedSequence = forwardRef(PremountedSequenceRefForwardingFunction);
const SequenceRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLDivElement,
	SequenceProps
> = (props, ref) => {
	if (
		props.layout !== 'none' &&
		props.premountFor &&
		!getRemotionEnvironment().isRendering
	) {
		return <PremountedSequence {...props} ref={ref} />;
	}

	return <RegularSequence {...props} ref={ref} />;
};

/*
 * @description A component that time-shifts its children and wraps them in an absolutely positioned <div>.
 * @see [Documentation](https://www.remotion.dev/docs/sequence)
 */
export const Sequence = forwardRef(SequenceRefForwardingFunction);
