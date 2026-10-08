import {PlayerInternals} from '@remotion/player';
import React, {
	forwardRef,
	memo,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import type {CanvasOutline} from './outline-geometry';

export type CanvasOutlinePolygonProps = Omit<
	React.SVGProps<SVGPolygonElement>,
	| 'ref'
	| 'children'
	| 'points'
	| 'fill'
	| 'stroke'
	| 'strokeOpacity'
	| 'strokeWidth'
	| 'vectorEffect'
	| 'pointerEvents'
	| 'onPointerEnter'
	| 'onPointerLeave'
> & {
	readonly outline: CanvasOutline;
	readonly directlySelected: boolean;
	readonly dragging: boolean;
	readonly visible: boolean;
	readonly interactive: boolean;
	readonly fill: string;
	readonly stroke: string;
	readonly onHoverChange: (key: string | null, element?: SVGElement) => void;
};

/** Shared outline geometry and hover behavior, with editing handlers supplied by the host. */
export const CanvasOutlinePolygon = memo(
	forwardRef<SVGPolygonElement, CanvasOutlinePolygonProps>(
		(
			{
				outline,
				directlySelected,
				dragging,
				visible,
				interactive,
				fill,
				stroke,
				onHoverChange,
				...props
			},
			ref,
		) => {
			const polygonRef = useRef<SVGPolygonElement>(null);
			useImperativeHandle(
				ref,
				() => polygonRef.current as SVGPolygonElement,
				[],
			);
			const points = useMemo(
				() => outline.points.map((point) => `${point.x},${point.y}`).join(' '),
				[outline.points],
			);
			const matrixTransform = useMemo(
				() =>
					outline.path === null
						? null
						: `matrix(${outline.path.matrix.a} ${outline.path.matrix.b} ${outline.path.matrix.c} ${outline.path.matrix.d} ${outline.path.matrix.e} ${outline.path.matrix.f})`,
				[outline.path],
			);
			useLayoutEffect(() => {
				const element = polygonRef.current;
				if (element === null) {
					return;
				}

				const stopObserving = PlayerInternals.observeHover({
					element,
					initialPointerEvent: null,
					onPointerMove: null,
					onHoverChange: (hovered) => {
						if (!dragging) {
							onHoverChange(hovered ? outline.key : null, element);
						}
					},
				});
				return () => {
					stopObserving();
					onHoverChange(null, element);
				};
			}, [dragging, onHoverChange, outline.key]);

			return (
				<g>
					<polygon
						{...props}
						ref={polygonRef}
						data-remotion-canvas-outline-key={outline.key}
						data-remotion-directly-selected-outline={
							directlySelected ? 'true' : undefined
						}
						points={points}
						fill={fill}
						stroke={matrixTransform === null ? stroke : 'transparent'}
						strokeOpacity={visible ? 1 : 0}
						strokeWidth={2}
						vectorEffect="non-scaling-stroke"
						pointerEvents={interactive ? 'all' : 'none'}
					/>
					{matrixTransform === null ? null : (
						<path
							d={outline.path?.d ?? ''}
							transform={matrixTransform}
							fill="none"
							stroke={stroke}
							strokeOpacity={visible ? 1 : 0}
							strokeWidth={2}
							vectorEffect="non-scaling-stroke"
							pointerEvents="none"
						/>
					)}
				</g>
			);
		},
	),
);
