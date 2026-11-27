import type {RefObject} from 'react';
import {useEffect, useRef} from 'react';

export const useReleaseCanvas = (
	canvasOrRef: HTMLCanvasElement | RefObject<HTMLCanvasElement | null> | null,
): void => {
	const activeCanvas = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas =
			canvasOrRef && 'current' in canvasOrRef
				? canvasOrRef.current
				: canvasOrRef;
		if (!canvas) {
			return;
		}

		activeCanvas.current = canvas;
		return () => {
			activeCanvas.current = null;
			queueMicrotask(() => {
				if (!canvas.isConnected && activeCanvas.current !== canvas) {
					canvas.width = 0;
					canvas.height = 0;
				}
			});
		};
	}, [canvasOrRef]);
};
