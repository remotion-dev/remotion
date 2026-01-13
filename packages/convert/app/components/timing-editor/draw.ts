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
import type {TimingComponent, TimingConfig} from './types';

export let stopDrawing = () => {};

const sumTrajectories = (trajectories: number[][]): number[] => {
	if (trajectories.length === 0) return [];
	const maxLength = Math.max(...trajectories.map((t) => t.length));
	const result: number[] = [];

	for (let i = 0; i < maxLength; i++) {
		let sum = 0;
		for (const trajectory of trajectories) {
			// If trajectory is shorter, use its last value (or 0 if empty)
			const value = i < trajectory.length ? trajectory[i] : (trajectory[trajectory.length - 1] ?? 0);
			sum += value;
		}
		result.push(sum);
	}

	return result;
};

export const draw = ({
	ref,
	duration,
	fps,
	components,
	draggedState,
	height,
	width,
	labelText,
}: {
	ref: HTMLCanvasElement;
	duration: number;
	fps: number;
	components: TimingComponent[];
	draggedState: {componentId: string; config: TimingConfig} | null;
	width: number;
	height: number;
	labelText: string;
}) => {
	const context = ref.getContext('2d');

	if (!context) {
		return;
	}

	context.clearRect(0, 0, width, height);

	// Get configs, applying dragged state if any
	const currentConfigs = components.map((c) => {
		if (draggedState && draggedState.componentId === c.id) {
			return draggedState.config;
		}
		return c.config;
	});

	// Get committed configs (without dragged state)
	const committedConfigs = components.map((c) => c.config);

	// Calculate trajectories for current state (with dragged)
	const currentTrajectories = currentConfigs.map((config) =>
		getTrajectory(duration, fps, config),
	);

	// Calculate trajectories for committed state (without dragged)
	const committedTrajectories = committedConfigs.map((config) =>
		getTrajectory(duration, fps, config),
	);

	// Sum the trajectories
	const combinedTrajectory = sumTrajectories(currentTrajectories);
	const committedCombinedTrajectory = sumTrajectories(committedTrajectories);

	// Use combined trajectory for min/max calculation
	const max = Math.max(...combinedTrajectory);
	const min = Math.min(...combinedTrajectory);
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

	// If dragging, show committed trajectory as faded background
	if (draggedState) {
		toStop.push(
			drawTrajectory({
				springTrajectory: committedCombinedTrajectory,
				canvasHeight: height,
				canvasWidth: width,
				context,
				min,
				max,
				primary: false,
				animate: false,
				fps,
			}),
		);
	}

	// Draw the combined trajectory (animated if not dragging)
	toStop.push(
		drawTrajectory({
			springTrajectory: combinedTrajectory,
			canvasHeight: height,
			canvasWidth: width,
			context,
			min,
			max,
			primary: true,
			animate: !draggedState,
			fps,
		}),
	);

	stopDrawing = () => {
		toStop.forEach((stop) => stop());
	};
};
