import type {PlayerProps, PlayerRef} from '@remotion/player';
import {Player, PlayerInternals} from '@remotion/player';
import type {RefObject} from 'react';
import React, {
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
} from 'react';
import type {AnyZodObject, TSequence} from 'remotion';
import {Internals} from 'remotion';
import type {CanvasController} from './canvas-controller';
import {getCanvasControllerInternals} from './canvas-controller';
import {CanvasOutlineOverlay} from './canvas-outline-overlay';
import {installFiberCommitOrderObserver} from './install-fiber-sequence-order-observer';
import type {CanvasSequenceNodePathResolver} from './sequence-node-path';
import {getCanvasSequenceNodePathInfo} from './sequence-node-path';
import type {
	CanvasSequencePropsChangeHandler,
	CanvasSequencePropStatusResolver,
} from './sequence-props-change';
import {useSyncExternalStore} from './use-sync-external-store';

export type CanvasProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = PlayerProps<Schema, Props> & {
	readonly controller: CanvasController;
	/** Enable hover and selection on the composition. Defaults to false. */
	readonly showOutlines?: boolean;
	/** Use the same resolver for your layer list and canvas selection. */
	readonly resolveSequenceNodePathInfo?: CanvasSequenceNodePathResolver;
	/**
	 * Enables moving selected outlines by dragging them or pressing the arrow
	 * keys. Called with the resulting prop values once a gesture ends; the
	 * values stay previewed through `controller.overrides` until you clear them.
	 */
	readonly onSequencePropsChange?: CanvasSequencePropsChangeHandler;
	/**
	 * How the props of a sequence are written in the source. Computed values
	 * cannot be moved, keyframed values receive a keyframe at the current frame.
	 * Without it, every value is treated as a static value.
	 */
	readonly getSequencePropStatuses?: CanvasSequencePropStatusResolver;
};

// Rendered inside the Player so the controller can reach the Visual Mode
// override setters of the mounted composition.
const CanvasVisualModeBridge: React.FC<{
	readonly controller: CanvasController;
}> = ({controller}) => {
	const setters = useContext(Internals.VisualModeSettersContext);
	const internals = getCanvasControllerInternals(controller);

	useEffect(() => {
		internals.setVisualModeSetters(setters);
		return () => internals.setVisualModeSetters(null);
	}, [internals, setters]);

	return null;
};

const CanvasFn = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>(
	{
		controller,
		showOutlines = false,
		resolveSequenceNodePathInfo = getCanvasSequenceNodePathInfo,
		onSequencePropsChange,
		getSequencePropStatuses,
		...playerProps
	}: CanvasProps<Schema, Props>,
	ref: RefObject<PlayerRef>,
) => {
	const internals = getCanvasControllerInternals(controller);
	const onTimelineSequenceChange = useCallback(
		(sequences: TSequence[]) => internals.setSequences(sequences),
		[internals],
	);
	const nodePaths = useSyncExternalStore(
		internals.nodePaths.subscribe,
		internals.nodePaths.getSnapshot,
		internals.nodePaths.getSnapshot,
	);
	const nodePathGetters = useMemo(
		() => ({overrideIdToNodePathMappings: nodePaths}),
		[nodePaths],
	);

	useEffect(() => {
		return () => internals.clear();
	}, [internals]);
	// React Refresh (used by Browser Studio) or React DevTools must have
	// registered the renderer before this commit. Install before the commit hook
	// fires so the initial outline nodes are discovered as well.
	useLayoutEffect(() => {
		if (showOutlines && typeof window !== 'undefined') {
			installFiberCommitOrderObserver(window);
		}
	}, [showOutlines]);
	const overlay = useMemo(
		() => (
			<>
				<CanvasVisualModeBridge controller={controller} />
				{showOutlines ? (
					<CanvasOutlineOverlay
						controller={controller}
						resolveSequenceNodePathInfo={resolveSequenceNodePathInfo}
						onSequencePropsChange={onSequencePropsChange ?? null}
						getSequencePropStatuses={getSequencePropStatuses ?? null}
					/>
				) : null}
			</>
		),
		[
			controller,
			getSequencePropStatuses,
			onSequencePropsChange,
			resolveSequenceNodePathInfo,
			showOutlines,
		],
	);

	return React.createElement(
		Internals.EnableInteractivityProvider,
		null,
		React.createElement(
			Internals.SequenceOutlineContext.Provider,
			{value: showOutlines},
			React.createElement(
				Internals.OverrideIdsToNodePathsGettersContext.Provider,
				{value: nodePathGetters},
				React.createElement(
					PlayerInternals.TimelineSequenceObserverContext.Provider,
					{value: onTimelineSequenceChange},
					React.createElement(
						PlayerInternals.CanvasOverlayContext.Provider,
						{value: overlay},
						React.createElement(
							Player as React.ComponentType,
							{
								...(playerProps as Record<string, unknown>),
								ref,
							} as Record<string, unknown>,
						),
					),
				),
			),
		),
	);
};

const forward = forwardRef as <T, P = {}>(
	render: (props: P, ref: React.RefObject<T>) => React.ReactElement | null,
) => (props: P & React.RefAttributes<T>) => React.ReactElement | null;

export const Canvas = forward(CanvasFn);
