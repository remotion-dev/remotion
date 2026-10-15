import React, {useContext, useMemo} from 'react';
import {
	SequenceActivityAbsoluteTimeContext,
	SequenceActivityDormantContext,
	SequenceActivityRevisionContext,
	SequenceActivitySettingsContext,
	SequenceActivitySettledContext,
	SequenceActivityTimelineContext,
} from './sequence-activity-context.js';
import {
	AbsoluteTimeContext,
	SetTimelineContext,
	TimelineContext,
	type TimelineContextValue,
} from './TimelineContext.js';
import {useVideoConfig} from './use-video-config.js';

const SequenceActivityParkingContext =
	React.createContext<Promise<void> | null>(null);
const useCommitEffect = React.useInsertionEffect ?? React.useLayoutEffect;

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
	({children, dormant}) => {
		const parkedScene = useContext(SequenceActivityParkingContext);
		if (dormant && parkedScene !== null) {
			throw parkedScene;
		}

		return children;
	},
	(previous, next) =>
		previous.dormant &&
		next.dormant &&
		areActivityChildrenEqual(previous.children, next.children),
);

type SequenceActivityBoundaryProps = {
	readonly children: React.ReactNode;
	readonly dormant: boolean;
	readonly frame: number;
};

const SequenceActivityBoundaryInner = React.memo<
	SequenceActivityBoundaryProps & {readonly parked: boolean}
>(
	({children, dormant, frame, parked}) => {
		const settings = useContext(SequenceActivitySettingsContext);
		const stableTimeline = settings?.enabled === true && settings.limit === -1;
		const parking = useMemo(() => {
			if (!parked) {
				return null;
			}

			let resume: () => void = () => undefined;
			const promise = new Promise<void>((resolve) => {
				resume = resolve;
			});
			return {promise, resume};
		}, [parked]);
		// Release React's retry listeners on activation, revision changes, or
		// unmount. A shared never-resolving promise would retain old boundaries.
		useCommitEffect(() => () => parking?.resume(), [parking]);
		const parentDormant = useContext(SequenceActivityDormantContext);
		const timeline = useContext(
			parked || parentDormant
				? SequenceActivityTimelineContext
				: TimelineContext,
		);
		const absoluteTime = useContext(
			parked || parentDormant
				? SequenceActivityAbsoluteTimeContext
				: AbsoluteTimeContext,
		);
		const setTimeline = useContext(SetTimelineContext);
		const {id} = useVideoConfig();
		if (!parked && timeline === null) {
			throw new Error('TimelineContext is missing');
		}

		// A parked root has no discovery clock above it. Read the stable media ref
		// without subscribing to the live timeline just to construct a frozen clock.
		const audioAndVideoTags =
			timeline?.audioAndVideoTags ?? setTimeline.audioAndVideoTags;
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
				<SequenceActivityTimelineContext.Provider
					value={dormant ? dormantTimeline : null}
				>
					<SequenceActivityAbsoluteTimeContext.Provider
						value={dormant ? dormantTimeline : null}
					>
						<TimelineContext.Provider
							value={dormant ? dormantTimeline : timeline}
						>
							<AbsoluteTimeContext.Provider
								value={dormant ? dormantTimeline : absoluteTime}
							>
								<React.Activity
									mode={dormant && !parentDormant ? 'hidden' : 'visible'}
								>
									{stableTimeline ? (
										<SequenceActivityParkingContext.Provider
											value={parking?.promise ?? null}
										>
											<React.Suspense fallback={null}>
												{children}
											</React.Suspense>
										</SequenceActivityParkingContext.Provider>
									) : (
										children
									)}
								</React.Activity>
							</AbsoluteTimeContext.Provider>
						</TimelineContext.Provider>
					</SequenceActivityAbsoluteTimeContext.Provider>
				</SequenceActivityTimelineContext.Provider>
			</SequenceActivityDormantContext.Provider>
		);
	},
	(previous, next) => previous.parked && next.parked,
);

export const SequenceActivityBoundary: React.FC<
	SequenceActivityBoundaryProps
> = (props) => {
	const revision = useContext(SequenceActivityRevisionContext);
	const settled = useContext(SequenceActivitySettledContext);
	return (
		<SequenceActivityBoundaryInner
			{...props}
			parked={props.dormant && revision !== null && settled === revision}
		/>
	);
};
