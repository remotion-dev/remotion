import type {PlayerProps, PlayerRef} from '@remotion/player';
import {Player, PlayerInternals} from '@remotion/player';
import type {RefObject} from 'react';
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
} from 'react';
import {Internals, type AnyZodObject, type TSequence} from 'remotion';
import type {CanvasController} from './canvas-controller';
import {getCanvasControllerInternals} from './canvas-controller';
import {CanvasOutlineOverlay} from './canvas-outline-overlay';
import {installFiberCommitOrderObserver} from './install-fiber-sequence-order-observer';
import type {CanvasSequenceNodePathResolver} from './sequence-node-path';
import {getCanvasSequenceNodePathInfo} from './sequence-node-path';

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
		() =>
			showOutlines ? (
				<CanvasOutlineOverlay
					controller={controller}
					resolveSequenceNodePathInfo={resolveSequenceNodePathInfo}
				/>
			) : null,
		[controller, resolveSequenceNodePathInfo, showOutlines],
	);

	return React.createElement(
		PlayerInternals.TimelineSequenceObserverContext.Provider,
		{value: onTimelineSequenceChange},
		React.createElement(
			Internals.SequenceOutlineContext.Provider,
			{value: showOutlines},
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
	);
};

const forward = forwardRef as <T, P = {}>(
	render: (props: P, ref: React.RefObject<T>) => React.ReactElement | null,
) => (props: P & React.RefAttributes<T>) => React.ReactElement | null;

export const Canvas = forward(CanvasFn);
