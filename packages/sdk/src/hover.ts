import {PlayerInternals} from '@remotion/player';
import type {Dispatch, SetStateAction} from 'react';
import {useCallback, useLayoutEffect, useMemo} from 'react';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import {getCanvasSequenceSelectionKey} from './selection';
import {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';
import {useSyncExternalStore} from './use-sync-external-store';

export type CanvasHover = {
	readonly key: string;
	readonly nodePathKey: string;
	readonly source: 'canvas' | 'timeline';
};

export type CanvasHoverController = {
	readonly getSnapshot: () => CanvasHover | null;
	readonly subscribe: (listener: () => void) => () => void;
	readonly setHoveredSequence: Dispatch<SetStateAction<CanvasHover | null>>;
	readonly clear: (source: CanvasHover['source'] | null) => void;
};

type HoverElement = HTMLElement | SVGElement;
type HoverEvent = {
	readonly currentTarget: HoverElement;
	readonly nativeEvent: PointerEvent | null;
	readonly pointerType: string | null;
};

// A row, its track, and several canvas handles can represent the same sequence.
// Keep their claims separate so one element's late leave cannot clear another.
const hoverClaims = new WeakMap<
	CanvasHoverController,
	Map<object, {hover: CanvasHover; element: HoverElement | null}>
>();

const updateHoverClaim = (
	controller: CanvasHoverController,
	token: object,
	element: HoverElement | null,
	hover: CanvasHover | null,
) => {
	let claims = hoverClaims.get(controller);
	if (hover !== null) {
		if (!claims) {
			claims = new Map();
			hoverClaims.set(controller, claims);
		}

		claims.delete(token);
		claims.set(token, {hover, element});
		controller.setHoveredSequence(hover);
		return;
	}

	const previous = claims?.get(token);
	if (!claims || !previous) {
		return;
	}

	claims.delete(token);
	const current = controller.getSnapshot();
	if (
		current?.key !== previous.hover.key ||
		current.nodePathKey !== previous.hover.nodePathKey ||
		current.source !== previous.hover.source
	) {
		return;
	}

	const fallback = [...claims.values()].reverse().find((claim) => {
		return (
			claim.element === null ||
			(claim.element.isConnected && claim.element.matches(':hover'))
		);
	});
	controller.setHoveredSequence(fallback?.hover ?? null);
};

export const createCanvasHoverController = (): CanvasHoverController => {
	let hoveredSequence: CanvasHover | null = null;
	const listeners = new Set<() => void>();
	const setHoveredSequence: CanvasHoverController['setHoveredSequence'] = (
		action,
	) => {
		const nextHoveredSequence =
			typeof action === 'function' ? action(hoveredSequence) : action;
		if (
			nextHoveredSequence === hoveredSequence ||
			(nextHoveredSequence !== null &&
				hoveredSequence !== null &&
				nextHoveredSequence.key === hoveredSequence.key &&
				nextHoveredSequence.nodePathKey === hoveredSequence.nodePathKey &&
				nextHoveredSequence.source === hoveredSequence.source)
		) {
			return;
		}

		hoveredSequence = nextHoveredSequence;
		for (const listener of listeners) {
			listener();
		}
	};

	return {
		getSnapshot: () => hoveredSequence,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		setHoveredSequence,
		clear: (source) => {
			if (source === null || hoveredSequence?.source === source) {
				setHoveredSequence(null);
			}
		},
	};
};

export const useCanvasHover = (
	controller: CanvasHoverController,
): CanvasHover | null => {
	return useSyncExternalStore(
		controller.subscribe,
		controller.getSnapshot,
		controller.getSnapshot,
	);
};

export const useIsCanvasSequenceHovered = (
	controller: CanvasHoverController,
	nodePathKey: string | null,
): boolean => {
	const getSnapshot = useCallback(
		() =>
			nodePathKey !== null &&
			controller.getSnapshot()?.nodePathKey === nodePathKey,
		[controller, nodePathKey],
	);

	return useSyncExternalStore(controller.subscribe, getSnapshot, getSnapshot);
};

export const useCanvasSequenceHover = (
	controller: CanvasHoverController,
	nodePathInfo: SequenceNodePathInfo | null,
	source: CanvasHover['source'],
) => {
	const sequenceKey = useMemo(
		() =>
			nodePathInfo === null
				? null
				: getCanvasSequenceSelectionKey(nodePathInfo),
		[nodePathInfo],
	);
	const nodePathKey = useMemo(
		() =>
			nodePathInfo === null
				? null
				: timelineSequenceNodePathToKey(nodePathInfo.sequenceSubscriptionKey),
		[nodePathInfo],
	);
	const hovered = useIsCanvasSequenceHovered(controller, nodePathKey);
	const handlers = useMemo(() => {
		const tokens = new Map<HoverElement | null, object>();
		const observers = new Map<HoverElement, () => void>();
		let attachedElement: HoverElement | null = null;
		const setHover = (element: HoverElement | null, active: boolean) => {
			if (sequenceKey === null || nodePathKey === null) {
				return;
			}

			let token = tokens.get(element);
			if (!token) {
				if (!active) {
					return;
				}

				token = {};
				tokens.set(element, token);
			}

			updateHoverClaim(
				controller,
				token,
				element,
				active ? {key: sequenceKey, nodePathKey, source} : null,
			);
			if (!active) {
				tokens.delete(element);
			}
		};

		const observe = (element: HoverElement, event: PointerEvent | null) => {
			if (observers.has(element)) {
				return;
			}

			observers.set(
				element,
				PlayerInternals.observeHover({
					element,
					initialPointerEvent: event,
					onPointerMove: null,
					onHoverChange: (active) => setHover(element, active),
				}),
			);
		};

		const dispose = () => {
			for (const stopObserving of observers.values()) {
				stopObserving();
			}

			observers.clear();
			for (const element of tokens.keys()) {
				setHover(element, false);
			}

			tokens.clear();
		};

		return {
			dispose,
			connect: () => {
				if (attachedElement !== null) {
					observe(attachedElement, null);
				}
			},
			ref: (element: HoverElement | null) => {
				if (element === attachedElement) {
					return;
				}

				dispose();
				attachedElement = element;
				if (element !== null) {
					observe(element, null);
				}
			},
			onPointerEnter: (event?: HoverEvent) => {
				if (event?.pointerType === 'touch') {
					return;
				}

				if (event?.nativeEvent) {
					observe(event.currentTarget, event.nativeEvent);
				}

				setHover(event?.currentTarget ?? null, true);
			},
			onPointerLeave: (event?: Pick<HoverEvent, 'currentTarget'>) => {
				setHover(event?.currentTarget ?? null, false);
			},
		};
	}, [controller, nodePathKey, sequenceKey, source]);
	useLayoutEffect(() => {
		handlers.connect();
		return handlers.dispose;
	}, [handlers]);

	return useMemo(
		() => ({
			hovered,
			onPointerEnter: handlers.onPointerEnter,
			onPointerLeave: handlers.onPointerLeave,
			ref: handlers.ref,
		}),
		[handlers, hovered],
	);
};
