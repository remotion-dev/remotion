import {receiveCanvasCapture} from '@remotion/studio-shared/canvas-capture-handoff';
import {useEffect, useState} from 'react';
import type {Source} from './convert-state';

export const useCanvasCapture = (
	setSrc: React.Dispatch<React.SetStateAction<Source | null>>,
) => {
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		const controller = new AbortController();
		receiveCanvasCapture({
			handoffWindow: window,
			signal: controller.signal,
			onCapture: (file) => {
				setSrc({type: 'file', file});
			},
		}).catch((err) => {
			if (!controller.signal.aborted) {
				setError(err instanceof Error ? err.message : String(err));
			}
		});

		return () => controller.abort();
	}, [setSrc]);
	return error;
};
