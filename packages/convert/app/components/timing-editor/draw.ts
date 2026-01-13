import {measureText} from '@remotion/layout-utils';
import {getTrajectory} from './get-trajectory';
import {
	AXIS_LABEL_WIDTH,
	LINE_WIDTH,
	PADDING_BOTTOM,
	PADDING_LEFT,
	PADDING_RIGHT,
	PADDING_TOP,
	drawTrajectory,
} from './draw-trajectory';
import type {TimingConfig} from './types';

export let stopDrawing = () => {};

export const draw = ({
	ref,
	duration,
	fps,
	config,
	draggedConfig,
	draggedDuration,
	height,
	width,
	labelText,
}: {
	ref: HTMLCanvasElement;
	duration: number;
	fps: number;
	config: TimingConfig;
	draggedConfig: TimingConfig | null;
	draggedDuration: number | null;
	width: number;
	height: number;
	labelText: string;
}) => {
	const context = ref.getContext('2d');

	if (!context) {
		return;
	}

	context.clearRect(0, 0, width, height);
	const trajectory = getTrajectory(duration, fps, config);
	const draggedTrajectory = draggedConfig
		? getTrajectory(draggedDuration ?? duration, fps, draggedConfig)
		: [];

	const activeTrajectory = draggedConfig ? draggedTrajectory : trajectory;
	const max = Math.max(...activeTrajectory);
	const min = Math.min(...activeTrajectory);
	const range = max - min;

	context.strokeStyle = 'rgba(0, 0, 0, 0.1)';
	context.lineWidth = LINE_WIDTH * window.devicePixelRatio;
	context.lineCap = 'round';

	const getYForValue = (value: number) => {
		const normalizedValue = range === 0 ? 0.5 : (value - min) / range;
		return (
			(height - PADDING_TOP - PADDING_BOTTOM) * (1 - normalizedValue) +
			PADDING_TOP
		);
	};

	const lineEndX =
		width -
		PADDING_RIGHT -
		measureText({
			fontFamily: 'GTPlanar',
			fontSize: 15,
			text: labelText,
			fontWeight: 'medium',
			letterSpacing: undefined,
		}).width -
		23 -
		16;

	const formatAxisLabel = (value: number) => {
		return value.toFixed(2);
	};

	const drawAxisLine = (value: number) => {
		const y = getYForValue(value);

		// Draw the line
		context.beginPath();
		context.moveTo(PADDING_LEFT, y);
		context.lineTo(lineEndX, y);
		context.stroke();
		context.closePath();

		// Draw the label
		context.fillStyle = 'rgba(0, 0, 0, 0.5)';
		context.font = '12px GTPlanar';
		context.textAlign = 'right';
		context.textBaseline = 'middle';
		context.fillText(
			formatAxisLabel(value),
			PADDING_LEFT - AXIS_LABEL_WIDTH + 30,
			y,
		);
	};

	// Draw max line with label
	drawAxisLine(max);

	// Draw min line with label (only if different from max)
	if (min !== max) {
		drawAxisLine(min);
	}

	// Draw 0 line if it's within range but not already drawn as min or max
	if (min < 0 && max > 0) {
		const zeroY = getYForValue(0);
		context.beginPath();
		context.moveTo(PADDING_LEFT, zeroY);
		context.lineTo(lineEndX, zeroY);
		context.stroke();
		context.closePath();
	}

	const toStop: (() => void)[] = [];

	const stopPrimary = drawTrajectory({
		springTrajectory: trajectory,
		canvasHeight: height,
		canvasWidth: width,
		context,
		min,
		max,
		primary: !draggedConfig,
		animate: !draggedConfig,
		fps,
	});
	toStop.push(stopPrimary);

	if (draggedConfig) {
		toStop.push(
			drawTrajectory({
				springTrajectory: draggedTrajectory,
				canvasHeight: height,
				canvasWidth: width,
				context,
				min,
				max,
				primary: true,
				animate: false,
				fps,
			}),
		);
	}

	stopDrawing = () => {
		toStop.forEach((stop) => stop());
	};
};
