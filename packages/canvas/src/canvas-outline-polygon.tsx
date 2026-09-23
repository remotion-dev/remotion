import React, {forwardRef, memo, useCallback, useMemo} from 'react';
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
	readonly onHoverChange: (key: string | null) => void;
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
			const points = useMemo(
				() => outline.points.map((point) => `${point.x},${point.y}`).join(' '),
				[outline.points],
			);
			const onPointerEnter = useCallback(() => {
				if (!dragging) {
					onHoverChange(outline.key);
				}
			}, [dragging, onHoverChange, outline.key]);
			const onPointerLeave = useCallback(() => {
				if (!dragging) {
					onHoverChange(null);
				}
			}, [dragging, onHoverChange]);

			return (
				<polygon
					{...props}
					ref={ref}
					data-remotion-canvas-outline-key={outline.key}
					data-remotion-directly-selected-outline={
						directlySelected ? 'true' : undefined
					}
					points={points}
					fill={fill}
					stroke={stroke}
					strokeOpacity={visible ? 1 : 0}
					strokeWidth={2}
					vectorEffect="non-scaling-stroke"
					pointerEvents={interactive ? 'all' : 'none'}
					onPointerEnter={onPointerEnter}
					onPointerLeave={onPointerLeave}
				/>
			);
		},
	),
);
