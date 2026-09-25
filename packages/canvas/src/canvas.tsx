import type {PlayerProps, PlayerRef} from '@remotion/player';
import {Player, PlayerInternals} from '@remotion/player';
import type {RefObject} from 'react';
import React, {
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from 'react';
import type {AnyZodObject, TSequence} from 'remotion';
import {Internals} from 'remotion';
import type {CanvasController} from './canvas-controller';
import {getCanvasControllerInternals} from './canvas-controller';
import {CanvasOutlineOverlay} from './canvas-outline-overlay';
import type {CanvasSequenceNodePathResolver} from './sequence-node-path';
import {getCanvasSequenceNodePathInfo} from './sequence-node-path';
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
	const overlay = useMemo(
		() => (
			<>
				<CanvasVisualModeBridge controller={controller} />
				{showOutlines ? (
					<CanvasOutlineOverlay
						controller={controller}
						resolveSequenceNodePathInfo={resolveSequenceNodePathInfo}
					/>
				) : null}
			</>
		),
		[controller, resolveSequenceNodePathInfo, showOutlines],
	);

	return React.createElement(
		Internals.EnableInteractivityProvider,
		null,
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
	);
};

const forward = forwardRef as <T, P = {}>(
	render: (props: P, ref: React.RefObject<T>) => React.ReactElement | null,
) => (props: P & React.RefAttributes<T>) => React.ReactElement | null;

export const Canvas = forward(CanvasFn);
