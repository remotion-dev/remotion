import React, {useEffect, useMemo, useRef} from 'react';
import {AnimationDuration} from './AnimationDuration';
import {draw, stopDrawing} from './draw';
import type {TimingComponent, TimingConfig} from './types';

export const Canvas: React.FC<{
	readonly width: number;
	readonly height: number;
	readonly components: TimingComponent[];
	readonly draggedState: {componentId: string; config: TimingConfig} | null;
	readonly draggedDuration: number | null;
	readonly duration: number;
	readonly fps: number;
	readonly replayKey: number;
}> = ({
	height,
	width,
	components,
	draggedState,
	duration,
	fps,
	replayKey,
}) => {
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
			? `${(duration / fps).toFixed(2)}sec`
			: `${Math.round(duration)} frames`;

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		stopDrawing();
		draw({
			ref: canvasRef.current,
			duration,
			components,
			draggedState,
			fps,
			height,
			width,
			labelText: durationLabel,
		});
	}, [
		duration,
		components,
		draggedState,
		fps,
		width,
		height,
		durationLabel,
		replayKey,
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
