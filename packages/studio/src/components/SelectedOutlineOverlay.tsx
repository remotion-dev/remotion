import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {OverrideIdToNodePaths, TSequence} from 'remotion';
import {Internals} from 'remotion';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {BLUE} from '../helpers/colors';
import {getBoxQuadsPonyfill} from '../helpers/get-box-quads-ponyfill';
import {
	ENABLE_OUTLINES,
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from './Timeline/TimelineSelection';

type OutlinePoint = {
	readonly x: number;
	readonly y: number;
};

type SelectedOutline = {
	readonly key: string;
	readonly points: readonly [
		OutlinePoint,
		OutlinePoint,
		OutlinePoint,
		OutlinePoint,
	];
};

type SelectedOutlineTarget = {
	readonly key: string;
	readonly ref: React.RefObject<HTMLElement | null>;
};

const outlineContainer: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	overflow: 'visible',
};

const pointToString = (point: OutlinePoint) => `${point.x},${point.y}`;

const rectToPoints = (
	elementRect: DOMRect,
	containerRect: DOMRect,
): SelectedOutline['points'] => {
	const left = elementRect.left - containerRect.left;
	const top = elementRect.top - containerRect.top;
	const right = elementRect.right - containerRect.left;
	const bottom = elementRect.bottom - containerRect.top;

	return [
		{x: left, y: top},
		{x: right, y: top},
		{x: right, y: bottom},
		{x: left, y: bottom},
	];
};

const quadToPoints = (
	quad: DOMQuad,
	containerRect: DOMRect,
): SelectedOutline['points'] => {
	// `getBoxQuads`/the ponyfill returns the quad in viewport coordinates.
	// The overlay <svg> is unscaled (the canvas `scale()`/pan live on a sibling
	// container, not the svg), so 1 user unit == 1 px and we only need to move
	// the quad into the svg's local space by subtracting its viewport origin.
	// We deliberately do not pass `relativeTo` to the ponyfill: when the target
	// is not an ancestor of the element, the polyfill cannot resolve the
	// coordinate space and leaves the quad in viewport coordinates.
	return [
		{x: quad.p1.x - containerRect.left, y: quad.p1.y - containerRect.top},
		{x: quad.p2.x - containerRect.left, y: quad.p2.y - containerRect.top},
		{x: quad.p3.x - containerRect.left, y: quad.p3.y - containerRect.top},
		{x: quad.p4.x - containerRect.left, y: quad.p4.y - containerRect.top},
	];
};

const getElementOutlinePoints = (
	element: HTMLElement,
	containerRect: DOMRect,
): SelectedOutline['points'] | null => {
	const elementRect = element.getBoundingClientRect();

	if (elementRect.width === 0 && elementRect.height === 0) {
		return null;
	}

	const quads = getBoxQuadsPonyfill(element, {
		box: 'border',
	});
	const quad = quads?.[0];
	if (!quad) {
		return rectToPoints(elementRect, containerRect);
	}

	return quadToPoints(quad, containerRect);
};

const getSelectedSequenceKeys = (
	selectedItems: readonly TimelineSelection[],
): Set<string> => {
	return new Set(
		selectedItems.map((item) =>
			getTimelineSequenceSelectionKey(item.nodePathInfo),
		),
	);
};

const getSequencesWithSelectedOutlines = ({
	selectedItems,
	sequences,
	overrideIdsToNodePaths,
}: {
	readonly selectedItems: readonly TimelineSelection[];
	readonly sequences: readonly TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
}): TSequence[] => {
	const selectedSequenceKeys = getSelectedSequenceKeys(selectedItems);

	if (selectedSequenceKeys.size === 0) {
		return [];
	}

	return calculateTimeline({
		sequences: [...sequences],
		overrideIdsToNodePaths,
	})
		.filter((track) => {
			if (track.nodePathInfo === null) {
				return false;
			}

			return selectedSequenceKeys.has(
				getTimelineSequenceSelectionKey(track.nodePathInfo),
			);
		})
		.map((track) => track.sequence)
		.filter((sequence) => sequence.refForOutline !== null);
};

const measureOutlines = (
	container: SVGSVGElement,
	targets: readonly SelectedOutlineTarget[],
): SelectedOutline[] => {
	const containerRect = container.getBoundingClientRect();
	const outlines: SelectedOutline[] = [];

	for (const target of targets) {
		const element = target.ref.current;
		if (element === null) {
			continue;
		}

		const points = getElementOutlinePoints(element, containerRect);
		if (points === null) {
			continue;
		}

		outlines.push({key: target.key, points});
	}

	return outlines;
};

const outlinesAreEqual = (
	a: readonly SelectedOutline[],
	b: readonly SelectedOutline[],
): boolean => {
	if (a.length !== b.length) {
		return false;
	}

	for (let i = 0; i < a.length; i++) {
		if (a[i].key !== b[i].key) {
			return false;
		}

		for (let j = 0; j < a[i].points.length; j++) {
			if (
				Math.abs(a[i].points[j].x - b[i].points[j].x) > 0.01 ||
				Math.abs(a[i].points[j].y - b[i].points[j].y) > 0.01
			) {
				return false;
			}
		}
	}

	return true;
};

export const SelectedOutlineOverlay: React.FC = () => {
	const {selectedItems} = useTimelineSelection();
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const [outlines, setOutlines] = useState<readonly SelectedOutline[]>([]);
	const overlayRef = useRef<SVGSVGElement>(null);

	const selectedOutlineTargets = useMemo((): SelectedOutlineTarget[] => {
		if (!ENABLE_OUTLINES) {
			return [];
		}

		return getSequencesWithSelectedOutlines({
			selectedItems,
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		}).map((sequence) => {
			if (sequence.refForOutline === null) {
				throw new Error('Expected sequence to have a ref for outline');
			}

			return {
				key: sequence.id,
				ref: sequence.refForOutline,
			};
		});
	}, [overrideIdToNodePathMappings, selectedItems, sequences]);

	useEffect(() => {
		if (selectedOutlineTargets.length === 0) {
			setOutlines((prevOutlines) =>
				prevOutlines.length === 0 ? prevOutlines : [],
			);
			return;
		}

		let animationFrame: number | null = null;

		const updateOutlines = () => {
			if (overlayRef.current) {
				const nextOutlines = measureOutlines(
					overlayRef.current,
					selectedOutlineTargets,
				);
				setOutlines((prevOutlines) =>
					outlinesAreEqual(prevOutlines, nextOutlines)
						? prevOutlines
						: nextOutlines,
				);
			}

			animationFrame = requestAnimationFrame(updateOutlines);
		};

		updateOutlines();

		return () => {
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, [selectedOutlineTargets]);

	if (selectedOutlineTargets.length === 0) {
		return null;
	}

	return (
		<svg
			ref={overlayRef}
			style={outlineContainer}
			width="100%"
			height="100%"
			aria-hidden="true"
		>
			{outlines.map((outline) => (
				<polygon
					key={outline.key}
					points={outline.points.map(pointToString).join(' ')}
					fill="none"
					stroke={BLUE}
					strokeWidth={2}
					vectorEffect="non-scaling-stroke"
				/>
			))}
		</svg>
	);
};
