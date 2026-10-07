import React, {useContext, useMemo} from 'react';
import {SequenceActivityDormantContext} from './sequence-activity-context.js';
import {
	AbsoluteTimeContext,
	TimelineContext,
	type TimelineContextValue,
} from './TimelineContext.js';
import {useVideoConfig} from './use-video-config.js';

const areActivityChildrenEqual = (
	previous: React.ReactNode,
	next: React.ReactNode,
): boolean => {
	if (Object.is(previous, next)) {
		return true;
	}

	if (Array.isArray(previous) && Array.isArray(next)) {
		return (
			previous.length === next.length &&
			previous.every((child, index) =>
				areActivityChildrenEqual(child, next[index]),
			)
		);
	}

	if (
		!React.isValidElement<Record<string, unknown>>(previous) ||
		!React.isValidElement<Record<string, unknown>>(next) ||
		previous.type !== next.type ||
		previous.key !== next.key
	) {
		return false;
	}

	const keys = Object.keys(previous.props);
	return (
		keys.length === Object.keys(next.props).length &&
		keys.every(
			(key) =>
				Object.prototype.hasOwnProperty.call(next.props, key) &&
				(key === 'children'
					? areActivityChildrenEqual(
							previous.props.children as React.ReactNode,
							next.props.children as React.ReactNode,
						)
					: Object.is(previous.props[key], next.props[key])),
		)
	);
};

// Parent frame subscriptions often recreate unchanged JSX. Compare element
// structure and all props instead of ignoring changes to dormant scene props.
export const SequenceActivityContent = React.memo<{
	readonly children: React.ReactNode;
	readonly dormant: boolean;
}>(
	({children}) => children,
	(previous, next) =>
		previous.dormant &&
		next.dormant &&
		areActivityChildrenEqual(previous.children, next.children),
);

export const SequenceActivityBoundary: React.FC<{
	readonly children: React.ReactNode;
	readonly dormant: boolean;
	readonly frame: number;
}> = ({children, dormant, frame}) => {
	const timeline = useContext(TimelineContext);
	const absoluteTime = useContext(AbsoluteTimeContext);
	const {id} = useVideoConfig();
	if (timeline === null) {
		throw new Error('TimelineContext is missing');
	}

	const {audioAndVideoTags} = timeline;
	const dormantTimeline = useMemo<TimelineContextValue>(
		() => ({
			frame: {[id]: frame},
			isPlaying: () => false,
			isInsideFreeze: true,
			audioAndVideoTags,
		}),
		[audioAndVideoTags, frame, id],
	);

	// Keep the providers and Activity at the same position when activating a
	// scene. Unlike Freeze, discovery does not reset SequenceContext origins or
	// disable Series duration inference.
	return (
		<SequenceActivityDormantContext.Provider value={dormant}>
			<TimelineContext.Provider value={dormant ? dormantTimeline : timeline}>
				<AbsoluteTimeContext.Provider
					value={dormant ? dormantTimeline : absoluteTime}
				>
					<React.Activity mode={dormant ? 'hidden' : 'visible'}>
						{children}
					</React.Activity>
				</AbsoluteTimeContext.Provider>
			</TimelineContext.Provider>
		</SequenceActivityDormantContext.Provider>
	);
};
