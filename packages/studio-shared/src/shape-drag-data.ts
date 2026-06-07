export const SHAPE_DRAG_MIME_TYPE = 'application/vnd.remotion.shape+json';

export const shapeNames = [
	'Arrow',
	'Circle',
	'Ellipse',
	'Heart',
	'Pie',
	'Polygon',
	'Rect',
	'Star',
	'Triangle',
] as const;

export type ShapeName = (typeof shapeNames)[number];

export type ShapeDragData = {
	type: 'remotion-shape';
	version: 1;
	shape: ShapeName;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isShapeName = (value: unknown): value is ShapeName => {
	return typeof value === 'string' && shapeNames.includes(value as ShapeName);
};

export const makeShapeDragData = (shape: ShapeName): ShapeDragData => {
	return {
		type: 'remotion-shape',
		version: 1,
		shape,
	};
};

export const parseShapeDragData = (value: string): ShapeDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed)) {
			return null;
		}

		if (parsed.type !== 'remotion-shape' || parsed.version !== 1) {
			return null;
		}

		if (!isShapeName(parsed.shape)) {
			return null;
		}

		return {
			type: 'remotion-shape',
			version: 1,
			shape: parsed.shape,
		};
	} catch {
		return null;
	}
};
