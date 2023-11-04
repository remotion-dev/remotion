import {MINIMUM_VISIBLE_CANVAS_SIZE} from '../state/editor-rulers';

export const drawMarkingOnRulerCanvas = ({
	scale,
	points,
	startMarking,
	originOffset,
	markingGaps,
	orientation,
	rulerCanvasRef,
}: {
	scale: number;
	points: Array<{position: number; value: number}>;
	startMarking: number;
	originOffset: number;
	markingGaps: number;
	orientation: 'horizontal' | 'vertical';
	rulerCanvasRef: React.RefObject<HTMLCanvasElement>;
}) => {
	const canvas = rulerCanvasRef.current;
	if (!canvas) return;

	const context = canvas.getContext('2d');
	if (!context) return;

	const canvasWidth = canvas.clientWidth * window.devicePixelRatio;
	const canvasHeight = canvas.clientHeight * window.devicePixelRatio;
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	context.scale(window.devicePixelRatio, window.devicePixelRatio);

	context.clearRect(0, 0, canvasWidth, canvasHeight);

	context.strokeStyle = '#dbe3e8';
	context.lineWidth = 1;
	context.beginPath();
	points.forEach((point) => {
		context.strokeStyle = '#dbe3e8';
		context.lineWidth = 1;
		const originDistance = point.position + originOffset - startMarking * scale;
		context.beginPath();
		if (orientation === 'horizontal') {
			context.moveTo(originDistance, 0);
			context.lineTo(originDistance, canvasHeight);
		} else {
			context.moveTo(0, originDistance);
			context.lineTo(canvasWidth, originDistance);
		}

		for (let i = 1; i < 5; i++) {
			if (orientation === 'horizontal') {
				context.moveTo(originDistance + (i * markingGaps * scale) / 5, 0);
				context.lineTo(originDistance + (i * markingGaps * scale) / 5, 4);
			} else {
				context.moveTo(0, originDistance + (i * markingGaps * scale) / 5);
				context.lineTo(4, originDistance + (i * markingGaps * scale) / 5);
			}
		}

		context.stroke();
		context.font = '10px Arial, Helvetica, sans-serif';
		context.textAlign = 'left';
		context.fillStyle = '#dbe3e8';

		if (orientation === 'horizontal') {
			context.fillText(
				point.value.toString().split('').join(String.fromCharCode(8202)),
				originDistance + 4,
				16,
			);
		} else {
			context.rotate(-Math.PI / 2);
			context.fillText(
				point.value.toString().split('').join(String.fromCharCode(8202)),
				-originDistance + 4,
				16,
			);
			context.rotate(Math.PI / 2);
		}
	});
};

export const getRulerPoints = ({
	rulerScaleRange,
	rulerMarkingGaps,
	scale,
}: {
	rulerScaleRange: {start: number; end: number};
	rulerMarkingGaps: number;
	scale: number;
}) => {
	const points = [];
	const startPoint = Math.ceil(rulerScaleRange.start / rulerMarkingGaps);
	const endPoint = Math.floor(rulerScaleRange.end / rulerMarkingGaps);
	for (let i = startPoint; i <= endPoint; i++) {
		points.push({
			value: i * rulerMarkingGaps,
			position: (i * rulerMarkingGaps + startPoint * rulerMarkingGaps) * scale,
		});
	}

	return {
		points,
		startMarking: startPoint * rulerMarkingGaps,
	};
};

export const getRulerScaleRange = ({
	canvasLength,
	containerRef,
	scale,
}: {
	canvasLength: number;
	containerRef: React.RefObject<HTMLDivElement>;
	scale: number;
}) => {
	const scaleRangeBeyondCanvas =
		(containerRef.current?.getBoundingClientRect()?.width ||
			MINIMUM_VISIBLE_CANVAS_SIZE - MINIMUM_VISIBLE_CANVAS_SIZE) / scale;
	return {
		start: -scaleRangeBeyondCanvas,
		end: scaleRangeBeyondCanvas + canvasLength,
	};
};
