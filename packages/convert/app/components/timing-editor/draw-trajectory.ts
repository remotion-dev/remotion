import {interpolate} from 'remotion';

export const LINE_WIDTH = 5;
export const AXIS_LABEL_WIDTH = 40;
export const PADDING_LEFT = 25 + AXIS_LABEL_WIDTH;
export const PADDING_RIGHT = 20;
export const PADDING_TOP = 20;
export const PADDING_BOTTOM = 20;

const getX = ({i, segmentWidth}: {i: number; segmentWidth: number}) => {
	return segmentWidth * i + PADDING_LEFT;
};

const getY = ({
	canvasHeight,
	i,
	min,
	max,
	springTrajectory,
}: {
	canvasHeight: number;
	i: number;
	min: number;
	max: number;
	springTrajectory: number[];
}) => {
	const range = max - min;
	const normalizedValue =
		range === 0 ? 0.5 : (springTrajectory[i] - min) / range;
	return (
		(canvasHeight - PADDING_TOP - PADDING_BOTTOM) * (1 - normalizedValue) +
		PADDING_TOP
	);
};

export const drawTrajectory = ({
	context,
	canvasHeight,
	canvasWidth,
	springTrajectory,
	primary,
	min,
	max,
	animate,
	fps,
}: {
	primary: boolean;
	context: CanvasRenderingContext2D;
	canvasWidth: number;
	canvasHeight: number;
	springTrajectory: number[];
	min: number;
	max: number;
	animate: boolean;
	fps: number;
}) => {
	const intervalBetweenDraw = 1000 / fps;
	const segmentWidth =
		(canvasWidth - PADDING_LEFT - PADDING_RIGHT) /
		(springTrajectory.length - 1);

	let lastX = getX({i: 0, segmentWidth});
	let lastY = getY({i: 0, canvasHeight, min, max, springTrajectory});
	let lastDraw = Date.now();

	let stopped = false;

	const executeDraw = async () => {
		for (let i = 0; i < springTrajectory.length; i++) {
			const timeSinceLastDraw = Date.now() - lastDraw;
			if (animate) {
				await new Promise((resolve) => {
					setTimeout(resolve, intervalBetweenDraw - timeSinceLastDraw);
				});
			}

			if (stopped) {
				break;
			}

			context.beginPath();
			context.moveTo(lastX, lastY);
			context.lineWidth = LINE_WIDTH;
			context.lineCap = 'round';
			const x = getX({i, segmentWidth});
			const y = getY({canvasHeight, i, min, max, springTrajectory});

			lastX = x;
			lastY = y;

			context.strokeStyle = primary ? '#0b84f3' : '#eee';
			context.lineTo(x, y);
			context.stroke();
			context.closePath();
			lastDraw = Date.now();

			if (animate) {
				const scaleEl = document.getElementById('spring-scale');
				const translateEl = document.getElementById('spring-translate');
				const opacityEl = document.getElementById('spring-opacity');

				if (scaleEl) {
					scaleEl.style.transform = `scale(${springTrajectory[i]})`;
				}

				if (translateEl) {
					translateEl.style.transform = `translateY(${interpolate(
						springTrajectory[i],
						[0, 1],
						[300, 0],
					)}px)`;
				}

				if (opacityEl) {
					opacityEl.style.opacity = springTrajectory[i].toString();
				}
			}
		}
	};

	executeDraw();

	return () => {
		stopped = true;
	};
};
