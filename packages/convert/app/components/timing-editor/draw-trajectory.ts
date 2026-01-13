import {interpolate, interpolateColors} from 'remotion';

const gradient = ['#42e9f5', '#4290f5'] as const;

export const LINE_WIDTH = 5;
export const PADDING_LEFT = 25;
export const PADDING_RIGHT = 20;
export const PADDING_TOP = 20;
export const PADDING_BOTTOM = 20;

const getX = ({i, segmentWidth}: {i: number; segmentWidth: number}) => {
	return segmentWidth * i + PADDING_LEFT;
};

const getY = ({
	canvasHeight,
	i,
	max,
	springTrajectory,
}: {
	canvasHeight: number;
	i: number;
	max: number;
	springTrajectory: number[];
}) => {
	return (
		(canvasHeight - PADDING_TOP - PADDING_BOTTOM) *
			(1 - springTrajectory[i] / max) +
		PADDING_TOP
	);
};

export const drawTrajectory = ({
	context,
	canvasHeight,
	canvasWidth,
	springTrajectory,
	primary,
	max,
	animate,
	fps,
}: {
	primary: boolean;
	context: CanvasRenderingContext2D;
	canvasWidth: number;
	canvasHeight: number;
	springTrajectory: number[];
	max: number;
	animate: boolean;
	fps: number;
}) => {
	const intervalBetweenDraw = 1000 / fps;
	const segmentWidth =
		(canvasWidth - PADDING_LEFT - PADDING_RIGHT) / (springTrajectory.length - 1);

	let lastX = getX({i: 0, segmentWidth});
	let lastY = getY({i: 0, canvasHeight, max, springTrajectory});
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
			const color = interpolateColors(
				i,
				[0, springTrajectory.length - 1],
				gradient,
			);
			const x = getX({i, segmentWidth});
			const y = getY({canvasHeight, i, max, springTrajectory});

			lastX = x;
			lastY = y;

			context.strokeStyle = primary ? color : '#333';
			context.lineTo(x, y);
			context.stroke();
			context.closePath();
			lastDraw = Date.now();

			if (animate) {
				const scaleEl = document.getElementById('spring-scale');
				const translateEl = document.getElementById('spring-translate');
				const rotateEl = document.getElementById('spring-rotate');

				if (scaleEl) {
					scaleEl.style.transform = `scale(${springTrajectory[i]})`;
				}

				if (translateEl) {
					translateEl.style.transform = `translateY(${interpolate(
						springTrajectory[i],
						[0, 1],
						[100, 0],
					)}px)`;
				}

				if (rotateEl) {
					rotateEl.style.transform = `rotate(${interpolate(
						springTrajectory[i],
						[0, 1],
						[Math.PI * 2, 0],
					)}rad)`;
				}
			}
		}
	};

	executeDraw();

	return () => {
		stopped = true;
	};
};
