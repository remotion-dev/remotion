import React, {
	forwardRef,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {AbsoluteFill} from './AbsoluteFill.js';
import type {LoopDisplay} from './CompositionManager.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import {useNonce} from './nonce.js';
import type {SequenceContextType} from './SequenceContext.js';
import {SequenceContext} from './SequenceContext.js';
import {
	SequenceManager,
	SequenceVisibilityToggleContext,
} from './SequenceManager.js';
import {
	TimelineContext,
	useTimelinePosition,
} from './timeline-position-state.js';
import {useVideoConfig} from './use-video-config.js';

export type LayoutAndStyle =
	| {
			layout?: 'absolute-fill';
			style?: React.CSSProperties;
			className?: string;
	  }
	| {
			layout: 'none';
	  };

export type SequencePropsWithoutDuration = {
	children: React.ReactNode;
	width?: number;
	height?: number;
	from?: number;
	name?: string;
	/**
	 * @deprecated For internal use only.
	 */
	showInTimeline?: boolean;
	/**
	 * @deprecated For internal use only.
	 */
	loopDisplay?: LoopDisplay;
} & LayoutAndStyle;

export type SequenceProps = {
	durationInFrames?: number;
} & SequencePropsWithoutDuration;

const SequenceRefForwardingFunction: React.ForwardRefRenderFunction<
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
		loopDisplay,
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

	const contextValue = useMemo((): SequenceContextType => {
		return {
			cumulatedFrom,
			relativeFrom: from,
			durationInFrames: actualDurationInFrames,
			parentFrom: parentSequence?.relativeFrom ?? 0,
			id,
			height: height ?? parentSequence?.height ?? null,
			width: width ?? parentSequence?.width ?? null,
		};
	}, [
		cumulatedFrom,
		from,
		actualDurationInFrames,
		parentSequence,
		id,
		height,
		width,
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

/**
 * @description A component that time-shifts its children and wraps them in an absolutely positioned <div>.
 * @see [Documentation](https://www.remotion.dev/docs/sequence)
 */
export const Sequence = forwardRef(SequenceRefForwardingFunction);
