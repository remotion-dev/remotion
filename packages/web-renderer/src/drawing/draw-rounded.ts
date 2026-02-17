import type {BorderRadiusCorners} from './border-radius';

export const drawRoundedRectPath = ({
	ctx,
	x,
	y,
	width,
	height,
	borderRadius,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	x: number;
	y: number;
	width: number;
	height: number;
	borderRadius: BorderRadiusCorners;
}) => {
	ctx.beginPath();

	// Start from top-left corner, after the radius
	ctx.moveTo(x + borderRadius.topLeft.horizontal, y);

	// Top edge
	ctx.lineTo(x + width - borderRadius.topRight.horizontal, y);

	// Top-right corner
	if (
		borderRadius.topRight.horizontal > 0 ||
		borderRadius.topRight.vertical > 0
	) {
		ctx.ellipse(
			x + width - borderRadius.topRight.horizontal,
			y + borderRadius.topRight.vertical,
			borderRadius.topRight.horizontal,
			borderRadius.topRight.vertical,
			0,
			-Math.PI / 2,
			0,
		);
	}

	// Right edge
	ctx.lineTo(x + width, y + height - borderRadius.bottomRight.vertical);

	// Bottom-right corner
	if (
		borderRadius.bottomRight.horizontal > 0 ||
		borderRadius.bottomRight.vertical > 0
	) {
		ctx.ellipse(
			x + width - borderRadius.bottomRight.horizontal,
			y + height - borderRadius.bottomRight.vertical,
			borderRadius.bottomRight.horizontal,
			borderRadius.bottomRight.vertical,
			0,
			0,
			Math.PI / 2,
		);
	}

	// Bottom edge
	ctx.lineTo(x + borderRadius.bottomLeft.horizontal, y + height);

	// Bottom-left corner
	if (
		borderRadius.bottomLeft.horizontal > 0 ||
		borderRadius.bottomLeft.vertical > 0
	) {
		ctx.ellipse(
			x + borderRadius.bottomLeft.horizontal,
			y + height - borderRadius.bottomLeft.vertical,
			borderRadius.bottomLeft.horizontal,
			borderRadius.bottomLeft.vertical,
			0,
			Math.PI / 2,
			Math.PI,
		);
	}

	// Left edge
	ctx.lineTo(x, y + borderRadius.topLeft.vertical);

	// Top-left corner
	if (
		borderRadius.topLeft.horizontal > 0 ||
		borderRadius.topLeft.vertical > 0
	) {
		ctx.ellipse(
			x + borderRadius.topLeft.horizontal,
			y + borderRadius.topLeft.vertical,
			borderRadius.topLeft.horizontal,
			borderRadius.topLeft.vertical,
			0,
			Math.PI,
			(Math.PI * 3) / 2,
		);
	}

	ctx.closePath();
};
