// Shared drawing primitives keep the homepage and Remotion output identical.
export const roundedRect = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
	fill: string | null,
	stroke: string | null = null,
	lineWidth = 1,
) => {
	// quadraticCurveTo also works in browsers predating Canvas roundRect().
	const r = Math.min(radius, width / 2, height / 2);
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + width - r, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + r);
	ctx.lineTo(x + width, y + height - r);
	ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
	ctx.lineTo(x + r, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
	if (fill !== null) {
		ctx.fillStyle = fill;
		ctx.fill();
	}

	if (stroke !== null) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	}
};

export const text = (
	ctx: CanvasRenderingContext2D,
	content: string,
	x: number,
	y: number,
	size: number,
	color: string,
	options: {
		fontFamily: string | null;
		weight: number | null;
		align: CanvasTextAlign | null;
	} | null = null,
) => {
	ctx.font = `${options?.weight ?? 400} ${size}px ${options?.fontFamily ?? 'Arial, Helvetica, sans-serif'}`;
	ctx.textBaseline = 'top';
	ctx.textAlign = options?.align ?? 'left';
	ctx.fillStyle = color;
	ctx.fillText(content, x, y);
};

// Match a CSS flex row's align-items: center. Canvas's "top" baseline refers
// to the em square, not the CSS line box, so using it to position row labels
// independently of their icons produces font-dependent vertical offsets.
export const textInRow = (
	ctx: CanvasRenderingContext2D,
	content: string,
	{
		x,
		top,
		height,
		size,
		color,
		fontFamily,
		weight,
		align,
		fontStyle,
	}: {
		x: number;
		top: number;
		height: number;
		size: number;
		color: string;
		fontFamily: string | null;
		weight: number | null;
		align: CanvasTextAlign | null;
		fontStyle: 'normal' | 'italic' | null;
	},
	clipWidth: number | null = null,
) => {
	ctx.font = `${fontStyle ?? 'normal'} ${weight ?? 400} ${size}px ${fontFamily ?? 'Arial, Helvetica, sans-serif'}`;
	ctx.textBaseline = 'alphabetic';
	ctx.textAlign = align ?? 'left';
	ctx.fillStyle = color;
	if (clipWidth !== null) {
		if (clipWidth <= 0) return;
		ctx.save();
		ctx.beginPath();
		ctx.rect(x, top, clipWidth, height);
		ctx.clip();
		// Fade only the label; the clip background, outline and icon stay solid.
		const fade = ctx.createLinearGradient(
			x + Math.max(0, clipWidth - 10),
			0,
			x + clipWidth,
			0,
		);
		// Canvas interpolates RGB as well as alpha, so use the label's RGB at
		// both ends instead of `transparent`, which means transparent black.
		const normalizedColor = ctx.fillStyle;
		const transparentColor = normalizedColor.startsWith('#')
			? `${normalizedColor.slice(0, 7)}00`
			: normalizedColor.replace(/,\s*[\d.]+\)$/, ', 0)');
		fade.addColorStop(0, color);
		fade.addColorStop(1, transparentColor);
		ctx.fillStyle = fade;
	}

	// A stable sample also keeps fallback baselines identical for labels with
	// and without descenders, such as "Endcard" and "Logo".
	const metrics = ctx.measureText('Hg');
	const ascent =
		metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
	const descent =
		metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
	ctx.fillText(content, x, top + height / 2 + (ascent - descent) / 2);
	if (clipWidth !== null) {
		ctx.restore();
	}
};
