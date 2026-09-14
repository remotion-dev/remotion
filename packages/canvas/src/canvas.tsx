import type {PlayerProps, PlayerRef} from '@remotion/player';
import {Player, PlayerInternals} from '@remotion/player';
import type {RefObject} from 'react';
import React, {forwardRef, useCallback, useEffect} from 'react';
import type {AnyZodObject, TSequence} from 'remotion';
import type {CanvasController} from './canvas-controller';
import {getCanvasControllerInternals} from './canvas-controller';

export type CanvasProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = PlayerProps<Schema, Props> & {
	readonly controller: CanvasController;
};

const CanvasFn = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>(
	{controller, ...playerProps}: CanvasProps<Schema, Props>,
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

	return React.createElement(
		PlayerInternals.TimelineSequenceObserverContext.Provider,
		{value: onTimelineSequenceChange},
		React.createElement(
			Player as React.ComponentType,
			{
				...(playerProps as Record<string, unknown>),
				ref,
			} as Record<string, unknown>,
		),
	);
};

const forward = forwardRef as <T, P = {}>(
	render: (props: P, ref: React.RefObject<T>) => React.ReactElement | null,
) => (props: P & React.RefAttributes<T>) => React.ReactElement | null;

export const Canvas = forward(CanvasFn);
