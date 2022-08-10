import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {AbsoluteFill} from './AbsoluteFill';
import {CompositionManager} from './CompositionManager';
import {getTimelineClipName} from './get-timeline-clip-name';
import {useNonce} from './nonce';
import {TimelineContext} from './timeline-position-state';
import {useAbsoluteCurrentFrame} from './use-current-frame';
import {useUnsafeVideoConfig} from './use-unsafe-video-config';

export type SequenceContextType = {
	cumulatedFrom: number;
	relativeFrom: number;
	parentFrom: number;
	durationInFrames: number;
	id: string;
};

export const SequenceContext = createContext<SequenceContextType | null>(null);

type LayoutAndStyle =
	| {
			layout: 'none';
	  }
	| {
			layout?: 'absolute-fill';
			style?: React.CSSProperties;
	  };

export type SequenceProps = {
	children: React.ReactNode;
	from: number;
	durationInFrames?: number;
	name?: string;
	showInTimeline?: boolean;
	showLoopTimesInTimeline?: number;
} & LayoutAndStyle;

export const Sequence: React.FC<SequenceProps> = ({
	from,
	durationInFrames = Infinity,
	children,
	name,
	showInTimeline = true,
	showLoopTimesInTimeline,
	...other
}) => {
	const {layout = 'absolute-fill'} = other;
	const [id] = useState(() => String(() => Math.random()));
	const parentSequence = useContext(SequenceContext);
	const {rootId} = useContext(TimelineContext);
	const cumulatedFrom = parentSequence
		? parentSequence.cumulatedFrom + parentSequence.relativeFrom
		: 0;
	const actualFrom = cumulatedFrom + from;
	const nonce = useNonce();

	if (layout !== 'absolute-fill' && layout !== 'none') {
		throw new TypeError(
			`The layout prop of <Sequence /> expects either "absolute-fill" or "none", but you passed: ${layout}`
		);
	}

	// @ts-expect-error
	if (layout === 'none' && typeof other.style !== 'undefined') {
		throw new TypeError('If layout="none", you may not pass a style.');
	}

	if (typeof durationInFrames !== 'number') {
		throw new TypeError(
			`You passed to durationInFrames an argument of type ${typeof durationInFrames}, but it must be a number.`
		);
	}

	if (durationInFrames <= 0) {
		throw new TypeError(
			`durationInFrames must be positive, but got ${durationInFrames}`
		);
	}

	// Infinity is non-integer but allowed!
	if (durationInFrames % 1 !== 0 && Number.isFinite(durationInFrames)) {
		throw new TypeError(
			`The "durationInFrames" of a sequence must be an integer, but got ${durationInFrames}.`
		);
	}

	if (typeof from !== 'number') {
		throw new TypeError(
			`You passed to the "from" props of your <Sequence> an argument of type ${typeof from}, but it must be a number.`
		);
	}

	if (from % 1 !== 0) {
		throw new TypeError(
			`The "from" prop of a sequence must be an integer, but got ${from}.`
		);
	}

	const absoluteFrame = useAbsoluteCurrentFrame();
	const unsafeVideoConfig = useUnsafeVideoConfig();
	const compositionDuration = unsafeVideoConfig
		? unsafeVideoConfig.durationInFrames
		: 0;
	const actualDurationInFrames = Math.min(
		compositionDuration - from,
		parentSequence
			? Math.min(
					parentSequence.durationInFrames +
						(parentSequence.cumulatedFrom + parentSequence.relativeFrom) -
						actualFrom,
					durationInFrames
			  )
			: durationInFrames
	);
	const {registerSequence, unregisterSequence} = useContext(CompositionManager);

	const contextValue = useMemo((): SequenceContextType => {
		return {
			cumulatedFrom,
			relativeFrom: from,
			durationInFrames: actualDurationInFrames,
			parentFrom: parentSequence?.relativeFrom ?? 0,
			id,
		};
	}, [
		cumulatedFrom,
		from,
		actualDurationInFrames,
		parentSequence?.relativeFrom,
		id,
	]);

	const timelineClipName = useMemo(() => {
		return name ?? getTimelineClipName(children);
	}, [children, name]);

	useEffect(() => {
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
			showLoopTimesInTimeline,
		});
		return () => {
			unregisterSequence(id);
		};
	}, [
		durationInFrames,
		actualFrom,
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
		showLoopTimesInTimeline,
	]);

	const endThreshold = (() => {
		return actualFrom + durationInFrames - 1;
	})();

	const content =
		absoluteFrame < actualFrom
			? null
			: absoluteFrame > endThreshold
			? null
			: children;

	const styleIfThere = other.layout === 'none' ? undefined : other.style;

	const defaultStyle: React.CSSProperties = useMemo(() => {
		return {
			flexDirection: undefined,
			...(styleIfThere ?? {}),
		};
	}, [styleIfThere]);

	return (
		<SequenceContext.Provider value={contextValue}>
			{content === null ? null : layout === 'absolute-fill' ? (
				<AbsoluteFill style={defaultStyle}>{content}</AbsoluteFill>
			) : (
				content
			)}
		</SequenceContext.Provider>
	);
};
