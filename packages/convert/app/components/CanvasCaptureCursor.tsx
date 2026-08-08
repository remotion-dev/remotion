import {MacOSCursor} from '@remotion/mac-cursors';
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {
	CanvasCaptureCursorData,
	CanvasCaptureMouseMovement,
} from '~/lib/canvas-capture-metadata';

const findCursorAtTime = (
	mouseMovements: readonly CanvasCaptureMouseMovement[],
	timeInSeconds: number,
) => {
	let low = 0;
	let high = mouseMovements.length - 1;
	let latest: CanvasCaptureMouseMovement | null = null;

	while (low <= high) {
		const middle = Math.floor((low + high) / 2);
		const movement = mouseMovements[middle];
		if (movement.timeInSeconds <= timeInSeconds) {
			latest = movement;
			low = middle + 1;
		} else {
			high = middle - 1;
		}
	}

	return latest;
};

export const CanvasCaptureCursor: React.FC<{
	readonly cursorData: CanvasCaptureCursorData;
	readonly cursorScale: number;
}> = ({cursorData, cursorScale}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cursor = findCursorAtTime(cursorData.mouseMovements, frame / fps);

	if (!cursor || cursor.canvasX === null || cursor.canvasY === null) {
		return null;
	}

	return (
		<div
			style={{
				position: 'absolute',
				left: cursor.canvasX,
				top: cursor.canvasY,
				pointerEvents: 'none',
				width: 32,
				height: 32,
			}}
		>
			<MacOSCursor
				cursor={cursor.cursor}
				scale={cursorData.captureMetadata.density * cursorScale}
			/>
		</div>
	);
};
