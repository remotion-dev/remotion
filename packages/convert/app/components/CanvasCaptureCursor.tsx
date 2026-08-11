import {MacOSCursor} from '@remotion/mac-cursors';
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {CanvasCaptureCursorData} from '~/lib/canvas-capture-metadata';
import {
	findCanvasCaptureCursorAtTime,
	isCanvasCapturePointerDownAtTime,
} from '~/lib/canvas-capture-metadata';

export const CanvasCaptureCursor: React.FC<{
	readonly cursorData: CanvasCaptureCursorData;
	readonly cursorScale: number;
	readonly cursorPressedScale: number;
}> = ({cursorData, cursorScale, cursorPressedScale}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const timeInSeconds = frame / fps;
	const cursor = findCanvasCaptureCursorAtTime(
		cursorData.mouseMovements,
		timeInSeconds,
	);

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
				scale={
					cursorData.captureMetadata.density *
					cursorScale *
					(isCanvasCapturePointerDownAtTime(
						cursorData.pointerClicks,
						timeInSeconds,
					)
						? cursorPressedScale
						: 1)
				}
			/>
		</div>
	);
};
