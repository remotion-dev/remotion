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

export type ShapeAttribute = {
	name: string;
	value: string | number | boolean;
};

export type ShapeDragData = {
	type: 'remotion-shape';
	version: 1;
	shape: ShapeName;
	attributes: ShapeAttribute[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isShapeName = (value: unknown): value is ShapeName => {
	return typeof value === 'string' && shapeNames.includes(value as ShapeName);
};

export const isShapeAttributeName = (value: unknown): value is string => {
	return (
		typeof value === 'string' &&
		value !== 'style' &&
		/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
	);
};

export const isShapeAttribute = (value: unknown): value is ShapeAttribute => {
	if (!isRecord(value)) {
		return false;
	}

	if (!isShapeAttributeName(value.name)) {
		return false;
	}

	return (
		typeof value.value === 'string' ||
		typeof value.value === 'boolean' ||
		(typeof value.value === 'number' && Number.isFinite(value.value))
	);
};

export const areShapeAttributes = (
	value: unknown,
): value is ShapeAttribute[] => {
	if (!Array.isArray(value)) {
		return false;
	}

	const seen = new Set<string>();
	for (const attribute of value) {
		if (!isShapeAttribute(attribute) || seen.has(attribute.name)) {
			return false;
		}

		seen.add(attribute.name);
	}

	return true;
};

export const makeShapeDragData = ({
	attributes,
	shape,
}: {
	attributes: ShapeAttribute[];
	shape: ShapeName;
}): ShapeDragData => {
	return {
		type: 'remotion-shape',
		version: 1,
		shape,
		attributes,
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

		if (!areShapeAttributes(parsed.attributes)) {
			return null;
		}

		return {
			type: 'remotion-shape',
			version: 1,
			shape: parsed.shape,
			attributes: parsed.attributes,
		};
	} catch {
		return null;
	}
};
