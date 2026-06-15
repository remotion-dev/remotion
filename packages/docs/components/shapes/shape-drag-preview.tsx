import type {ComponentDragData} from '@remotion/studio-shared';
import React from 'react';
import {getShapeDragInfo} from './shape-drag-info';

export const ShapeDragPreview = React.forwardRef<
	SVGSVGElement,
	{
		readonly dragData: ComponentDragData;
		readonly size: number;
	}
>(({dragData, size}, ref) => {
	const shapeInfo = getShapeDragInfo(dragData.component);
	if (shapeInfo === null) {
		return null;
	}

	const padding = Math.max(shapeInfo.width, shapeInfo.height) * 0.08;

	return (
		<svg
			ref={ref}
			width={size}
			height={size}
			viewBox={`${-padding} ${-padding} ${shapeInfo.width + padding * 2} ${
				shapeInfo.height + padding * 2
			}`}
			style={{display: 'block'}}
		>
			<path d={shapeInfo.path} fill={shapeInfo.fill} />
		</svg>
	);
});

ShapeDragPreview.displayName = 'ShapeDragPreview';
