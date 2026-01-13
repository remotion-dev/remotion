import React, {useEffect, useMemo, useRef} from 'react';
import {draw, stopDrawing} from './draw';
import type {DraggedConfig} from './types';
import {AnimationDuration} from './AnimationDuration';

export const Canvas: React.FC<{
	readonly width: number;
	readonly height: number;
	readonly draggedConfig: DraggedConfig | null;
	readonly draggedDuration: number | null;
	readonly duration: number;
	readonly config: DraggedConfig;
	readonly fps: number;
}> = ({height, width, draggedConfig, draggedDuration, config, duration, fps}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const canvasStyle: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			height: '100%',
			backgroundColor: 'var(--background)',
		};
	}, []);

	const [durationType, setDurationType] = React.useState<'seconds' | 'frames'>(
		'seconds',
	);

	const durationLabel =
		durationType === 'seconds'
			? `${((draggedDuration ?? duration) / fps).toFixed(2)}sec`
			: `${draggedDuration ?? duration} frames`;

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		stopDrawing();
		draw({
			ref: canvasRef.current,
			duration: draggedDuration ?? duration,
			config,
			draggedConfig,
			fps,
			draggedDuration,
			height,
			width,
			labelText: durationLabel,
		});
	}, [
		draggedDuration,
		duration,
		config,
		draggedConfig,
		fps,
		width,
		height,
		durationLabel,
	]);

	return (
		<>
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				style={canvasStyle}
			/>
			<AnimationDuration
				setDurationType={setDurationType}
				durationLabel={durationLabel}
			/>
		</>
	);
};
