import type {Size} from '@remotion/player';
import type {Guide} from '../state/editor-guides';
import {MINIMUM_VISIBLE_CANVAS_SIZE} from '../state/editor-rulers';
import {
	BACKGROUND,
	BACKGROUND__TRANSPARENT,
	RULER_COLOR,
	SELECTED_GUIDE,
} from './colors';

type Orientation = 'horizontal' | 'vertical';

const drawLabel = ({
	orientation,
	context,
	label,
	originDistance,
	color,
}: {
	orientation: Orientation;
	context: CanvasRenderingContext2D;
	label: string;
	originDistance: number;
	color: string;
}) => {
	context.fillStyle = color;
	if (orientation === 'horizontal') {
		context.fillText(label, originDistance + 4, 16);
	} else {
		context.rotate(-Math.PI / 2);
		context.fillText(label, -originDistance + 4, 16);
		context.rotate(Math.PI / 2);
	}
};

const drawGradient = ({
	orientation,
	context,
	originDistance,
	canvasHeight,
	canvasWidth,
}: {
	orientation: Orientation;
	context: CanvasRenderingContext2D;
	originDistance: number;
	canvasHeight: number;
	canvasWidth: number;
}) => {
	const size = 250;
	const startX = orientation === 'horizontal' ? originDistance - size / 2 : 0;
	const startY = orientation === 'horizontal' ? 0 : originDistance - size / 2;
	const endX =
		orientation === 'horizontal' ? originDistance + size / 2 : canvasWidth;
	const endY =
		orientation === 'horizontal' ? canvasHeight : originDistance + size / 2;
	const grd = context.createLinearGradient(startX, startY, endX, endY);
	grd.addColorStop(0, BACKGROUND__TRANSPARENT);
	grd.addColorStop(0.25, BACKGROUND);
	grd.addColorStop(0.75, BACKGROUND);
	grd.addColorStop(1, BACKGROUND__TRANSPARENT);

	context.fillStyle = grd;
	context.fillRect(startX, startY, endX - startX, endY - startY);
};

const drawGuide = ({
	selectedGuide,
	scale,
	startMarking,
	context,
	canvasHeight,
	canvasWidth,
	orientation,
	originOffset,
}: {
	selectedGuide: Guide;
	scale: number;
	startMarking: number;
	context: CanvasRenderingContext2D;
	canvasHeight: number;
	canvasWidth: number;
	orientation: Orientation;
	originOffset: number;
}) => {
	const originDistance =
		rulerValueToPosition({
			value: selectedGuide.position,
			startMarking,
			scale,
		}) +
		originOffset -
		startMarking * scale;
	drawGradient({
		canvasHeight,
		context,
		orientation,
		originDistance,
		canvasWidth,
	});
	context.strokeStyle = SELECTED_GUIDE;
	context.lineWidth = 1;
	context.beginPath();
	if (
		orientation === 'horizontal' &&
		selectedGuide.orientation === 'horizontal'
	) {
		return;
	}

	if (orientation === 'vertical' && selectedGuide.orientation === 'vertical') {
		return;
	}

	if (
		orientation === 'vertical' &&
		selectedGuide.orientation === 'horizontal'
	) {
		context.moveTo(0, originDistance);
		context.lineTo(canvasWidth, originDistance);
		drawLabel({
			context,
			label: selectedGuide.position.toString(),
			originDistance,
			orientation,
			color: SELECTED_GUIDE,
		});
	} else if (
		orientation === 'horizontal' &&
		selectedGuide.orientation === 'vertical'
	) {
		context.moveTo(originDistance, 0);
		context.lineTo(originDistance, canvasHeight);
		drawLabel({
			context,
			label: selectedGuide.position.toString(),
			originDistance,
			orientation,
			color: SELECTED_GUIDE,
		});
	}

	context.stroke();
};

export const drawMarkingOnRulerCanvas = ({
	scale,
	points,
	startMarking,
	originOffset,
	markingGaps,
	orientation,
	rulerCanvasRef,
	selectedGuide,
	canvasHeight,
	canvasWidth,
}: {
	scale: number;
	points: Array<{position: number; value: number}>;
	startMarking: number;
	originOffset: number;
	markingGaps: number;
	orientation: 'horizontal' | 'vertical';
	rulerCanvasRef: React.RefObject<HTMLCanvasElement | null>;
	selectedGuide: Guide | null;
	canvasWidth: number;
	canvasHeight: number;
}) => {
	const canvas = rulerCanvasRef.current;
	if (!canvas) return;

	const context = canvas.getContext('2d');
	if (!context) return;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	context.scale(window.devicePixelRatio, window.devicePixelRatio);

	context.clearRect(0, 0, canvasWidth, canvasHeight);

	context.strokeStyle = RULER_COLOR;
	context.lineWidth = 1;
	context.beginPath();
	points.forEach((point) => {
		context.strokeStyle = RULER_COLOR;
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
			const markingOffsetXY = i * markingGaps * scale;

			if (orientation === 'horizontal') {
				context.moveTo(originDistance + markingOffsetXY / 5, 0);
				context.lineTo(originDistance + markingOffsetXY / 5, 4);
			} else {
				context.moveTo(0, originDistance + markingOffsetXY / 5);
				context.lineTo(4, originDistance + markingOffsetXY / 5);
			}
		}

		context.stroke();
		context.font = '10px Arial, Helvetica, sans-serif';
		context.textAlign = 'left';
		context.fillStyle = RULER_COLOR;

		drawLabel({
			orientation,
			context,
			label: point.value.toString(),
			originDistance,
			color: RULER_COLOR,
		});
	});

	if (selectedGuide && orientation !== selectedGuide.orientation) {
		drawGuide({
			canvasHeight,
			canvasWidth,
			context,
			orientation,
			originOffset,
			scale,
			selectedGuide,
			startMarking,
		});
	}
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
	const startMarking = startPoint * rulerMarkingGaps;

	for (let i = startPoint; i <= endPoint; i++) {
		points.push({
			value: i * rulerMarkingGaps,
			position: rulerValueToPosition({
				scale,
				startMarking,
				value: i * rulerMarkingGaps,
			}),
		});
	}

	return {
		points,
		startMarking,
	};
};

const rulerValueToPosition = ({
	value,
	startMarking,
	scale,
}: {
	value: number;
	startMarking: number;
	scale: number;
}) => {
	return (value + startMarking) * scale;
};

export const getRulerScaleRange = ({
	canvasLength,
	scale,
	canvasSize,
}: {
	canvasLength: number;
	scale: number;
	canvasSize: Size;
}) => {
	const scaleRangeBeyondCanvas =
		(canvasSize.width ||
			MINIMUM_VISIBLE_CANVAS_SIZE - MINIMUM_VISIBLE_CANVAS_SIZE) / scale;
	return {
		start: -scaleRangeBeyondCanvas,
		end: scaleRangeBeyondCanvas + canvasLength,
	};
};
