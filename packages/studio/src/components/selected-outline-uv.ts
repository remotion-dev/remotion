import type {
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	GetEffectDragOverrides,
	PropStatuses,
	InteractivitySchemaField,
	SequencePropsSubscriptionKey,
	InteractivitySchema,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {
	clamp,
	mix,
	mixPoint,
	type OutlinePoint,
	type SelectedOutline,
} from './selected-outline-geometry';
import {
	getTimelineDisplayDecimalPlaces,
	roundToDecimalPlaces,
} from './Timeline/timeline-field-utils';

export type UvCoordinate = readonly [number, number];

type UvEllipseDimensions = {
	readonly width: number;
	readonly height: number;
};

export type UvCoordinateFieldSchema = Extract<
	InteractivitySchemaField,
	{type: 'uv-coordinate'}
>;

export type NumericUvEllipseFieldSchema = Extract<
	InteractivitySchemaField,
	{type: 'number' | 'rotation-degrees'}
>;

export type UvEllipseControlField = {
	readonly fieldKey: string;
	readonly fieldSchema: NumericUvEllipseFieldSchema;
	readonly fieldDefault: number | null | undefined;
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly value: number;
};

export type UvEllipseControls = {
	readonly width: UvEllipseControlField;
	readonly height: UvEllipseControlField;
	readonly rotation: UvEllipseControlField | null;
	readonly innerScale: UvEllipseControlField | null;
};

export type SelectedOutlineUvHandle = {
	readonly clientId: string;
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly effectIndex: number;
	readonly effectValues: Record<string, unknown>;
	readonly ellipseControls: UvEllipseControls | null;
	readonly fieldDefault: UvCoordinate | undefined;
	readonly fieldKey: string;
	readonly fieldSchema: UvCoordinateFieldSchema;
	readonly isSelected: boolean;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
	readonly sourceFrame: number;
	readonly value: UvCoordinate;
};

type UvConnectionHandle = Pick<
	SelectedOutlineUvHandle,
	'effectIndex' | 'fieldKey' | 'fieldSchema' | 'value'
> & {
	readonly effectValues?: Record<string, unknown>;
	readonly ellipseControls?: UvEllipseControls | null;
};

type UvHandleConnectionLine = {
	readonly key: string;
	readonly from: OutlinePoint;
	readonly to: OutlinePoint;
};

type UvHandleConnectionEllipse = {
	readonly key: string;
	readonly points: readonly OutlinePoint[];
};

export type UvEllipseResizeAxis = 'width' | 'height';

export type UvEllipseResizeControl = {
	readonly key: string;
	readonly axis: UvEllipseResizeAxis;
	readonly field: UvEllipseControlField;
	readonly position: OutlinePoint;
	readonly cursor: string;
};

export type UvEllipseRotationControl = {
	readonly key: string;
	readonly field: UvEllipseControlField;
	readonly position: OutlinePoint;
	readonly cursor: string;
};

export type UvEllipseStartControl = {
	readonly key: string;
	readonly field: UvEllipseControlField;
	readonly position: OutlinePoint;
	readonly cursor: string;
};

export type UvEllipseInteractiveControls = {
	readonly handle: SelectedOutlineUvHandle;
	readonly center: OutlinePoint;
	readonly width: number;
	readonly height: number;
	readonly rotation: number;
	readonly resize: readonly UvEllipseResizeControl[];
	readonly rotationControl: UvEllipseRotationControl | null;
	readonly startControl: UvEllipseStartControl | null;
};

type SelectedEffectFields = {
	readonly allFields: boolean;
	readonly fieldKeys: ReadonlySet<string>;
};

const parseUvCoordinate = (value: unknown): UvCoordinate | null => {
	if (
		Array.isArray(value) &&
		value.length === 2 &&
		value.every((item) => typeof item === 'number' && Number.isFinite(item))
	) {
		return [value[0], value[1]];
	}

	return null;
};

const parseFiniteNumber = (value: unknown): number | null => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	return null;
};

const getResizeCursor = (degrees: number): string => {
	const normalizedDegrees = ((degrees % 180) + 180) % 180;
	const snappedDegrees = Math.round(normalizedDegrees / 45) * 45;

	if (snappedDegrees === 0 || snappedDegrees === 180) {
		return 'ew-resize';
	}

	if (snappedDegrees === 45) {
		return 'nwse-resize';
	}

	if (snappedDegrees === 90) {
		return 'ns-resize';
	}

	return 'nesw-resize';
};

const getRotatedEllipseUv = ({
	center,
	dimensions,
	width,
	height,
	rotation,
	angle,
	radiusOffset = 0,
}: {
	readonly center: UvCoordinate;
	readonly dimensions?: UvEllipseDimensions | null;
	readonly width: number;
	readonly height: number;
	readonly rotation: number;
	readonly angle: number;
	readonly radiusOffset?: number;
}): UvCoordinate => {
	const rotationRadians = (rotation / 180) * Math.PI;
	const cosRotation = Math.cos(rotationRadians);
	const sinRotation = Math.sin(rotationRadians);

	if (
		dimensions !== null &&
		dimensions !== undefined &&
		dimensions.width > 0 &&
		dimensions.height > 0
	) {
		const radiusX =
			width * dimensions.width * 0.5 + radiusOffset * dimensions.width;
		const radiusY =
			height * dimensions.height * 0.5 + radiusOffset * dimensions.height;
		const pixelLocalX = Math.cos(angle) * radiusX;
		const pixelLocalY = Math.sin(angle) * radiusY;
		const rotatedX = pixelLocalX * cosRotation - pixelLocalY * sinRotation;
		const rotatedY = pixelLocalX * sinRotation + pixelLocalY * cosRotation;

		return [
			center[0] + rotatedX / dimensions.width,
			center[1] + rotatedY / dimensions.height,
		];
	}

	const radiusU = width / 2 + radiusOffset;
	const radiusV = height / 2 + radiusOffset;
	const localX = Math.cos(angle) * radiusU;
	const localY = Math.sin(angle) * radiusV;

	return [
		center[0] + localX * cosRotation - localY * sinRotation,
		center[1] + localX * sinRotation + localY * cosRotation,
	];
};

const getUvEllipseValues = (
	handle: UvConnectionHandle,
): {
	width: number;
	height: number;
	rotation: number;
	innerScale: number | null;
} | null => {
	const {visual} = handle.fieldSchema;
	if (visual?.type !== 'ellipse') {
		return null;
	}

	const ellipseMetadata = visual;

	const controls = handle.ellipseControls;
	const width =
		controls?.width.value ??
		parseFiniteNumber(handle.effectValues?.[ellipseMetadata.width]);
	const height =
		controls?.height.value ??
		parseFiniteNumber(handle.effectValues?.[ellipseMetadata.height]);
	const rotation = ellipseMetadata.rotation
		? (controls?.rotation?.value ??
			parseFiniteNumber(handle.effectValues?.[ellipseMetadata.rotation]))
		: 0;
	const innerScale = ellipseMetadata.innerScale
		? (controls?.innerScale?.value ??
			parseFiniteNumber(handle.effectValues?.[ellipseMetadata.innerScale]))
		: null;

	if (width === null || height === null || rotation === null) {
		return null;
	}

	return {width, height, rotation, innerScale};
};

export const tuplesEqual = (left: unknown, right: UvCoordinate): boolean => {
	if (!Array.isArray(left) || left.length !== 2) {
		return false;
	}

	return left[0] === right[0] && left[1] === right[1];
};

const getBilinearUvHandlePosition = (
	points: SelectedOutline['points'],
	uv: UvCoordinate,
): OutlinePoint => {
	const [tl, tr, br, bl] = points;
	const top = mixPoint(tl, tr, uv[0]);
	const bottom = mixPoint(bl, br, uv[0]);
	return mixPoint(top, bottom, uv[1]);
};

type ProjectiveTransform = {
	readonly a: number;
	readonly b: number;
	readonly c: number;
	readonly d: number;
	readonly e: number;
	readonly f: number;
	readonly g: number;
	readonly h: number;
};

const projectiveEpsilon = 0.000001;

const getProjectiveTransform = (
	points: SelectedOutline['points'],
): ProjectiveTransform | null => {
	const [tl, tr, br, bl] = points;
	const dx1 = tr.x - br.x;
	const dx2 = bl.x - br.x;
	const dx3 = tl.x - tr.x + br.x - bl.x;
	const dy1 = tr.y - br.y;
	const dy2 = bl.y - br.y;
	const dy3 = tl.y - tr.y + br.y - bl.y;

	let g = 0;
	let h = 0;
	if (Math.abs(dx3) > projectiveEpsilon || Math.abs(dy3) > projectiveEpsilon) {
		const determinant = dx1 * dy2 - dx2 * dy1;
		if (Math.abs(determinant) < projectiveEpsilon) {
			return null;
		}

		g = (dx3 * dy2 - dx2 * dy3) / determinant;
		h = (dx1 * dy3 - dx3 * dy1) / determinant;
	}

	return {
		a: tr.x - tl.x + g * tr.x,
		b: bl.x - tl.x + h * bl.x,
		c: tl.x,
		d: tr.y - tl.y + g * tr.y,
		e: bl.y - tl.y + h * bl.y,
		f: tl.y,
		g,
		h,
	};
};

const applyProjectiveTransform = (
	transform: ProjectiveTransform,
	uv: UvCoordinate,
): OutlinePoint => {
	const denominator = transform.g * uv[0] + transform.h * uv[1] + 1;
	return {
		x: (transform.a * uv[0] + transform.b * uv[1] + transform.c) / denominator,
		y: (transform.d * uv[0] + transform.e * uv[1] + transform.f) / denominator,
	};
};

export const getUvHandlePosition = (
	points: SelectedOutline['points'],
	uv: UvCoordinate,
): OutlinePoint => {
	const transform = getProjectiveTransform(points);
	return transform === null
		? getBilinearUvHandlePosition(points, uv)
		: applyProjectiveTransform(transform, uv);
};

export const getUvHandleConnectionLines = ({
	handles,
	points,
}: {
	readonly handles: readonly UvConnectionHandle[];
	readonly points: SelectedOutline['points'];
}): UvHandleConnectionLine[] => {
	const handlesByField = new Map(
		handles.map((handle) => [
			`${handle.effectIndex}\u0000${handle.fieldKey}`,
			handle,
		]),
	);
	const seenPairs = new Set<string>();
	const lines: UvHandleConnectionLine[] = [];

	for (const handle of handles) {
		const {visual} = handle.fieldSchema;
		if (visual?.type !== 'line' || visual.to === handle.fieldKey) {
			continue;
		}

		const target = handlesByField.get(
			`${handle.effectIndex}\u0000${visual.to}`,
		);
		if (target === undefined) {
			continue;
		}

		const pairKey = [
			handle.effectIndex,
			...[handle.fieldKey, visual.to].sort(),
		].join('\u0000');
		if (seenPairs.has(pairKey)) {
			continue;
		}

		seenPairs.add(pairKey);
		lines.push({
			key: `${handle.effectIndex}-${handle.fieldKey}-${visual.to}`,
			from: getUvHandlePosition(points, handle.value),
			to: getUvHandlePosition(points, target.value),
		});
	}

	return lines;
};

export const getUvHandleConnectionEllipses = ({
	handles,
	dimensions,
	points,
}: {
	readonly handles: readonly UvConnectionHandle[];
	readonly dimensions?: UvEllipseDimensions | null;
	readonly points: SelectedOutline['points'];
}): UvHandleConnectionEllipse[] => {
	const ellipses: UvHandleConnectionEllipse[] = [];

	for (const handle of handles) {
		const {visual} = handle.fieldSchema;
		if (visual?.type === 'ellipse') {
			const ellipseMetadata = visual;
			const ellipseValues = getUvEllipseValues(handle);
			if (ellipseValues === null) {
				continue;
			}

			const rotatedEllipsePoints: OutlinePoint[] = [];
			for (let i = 0; i <= 64; i++) {
				const angle = (i / 64) * Math.PI * 2;
				const uv = getRotatedEllipseUv({
					center: handle.value,
					dimensions,
					width: ellipseValues.width,
					height: ellipseValues.height,
					rotation: ellipseValues.rotation,
					angle,
				});
				rotatedEllipsePoints.push(getUvHandlePosition(points, uv));
			}

			ellipses.push({
				key: [
					handle.effectIndex,
					handle.fieldKey,
					ellipseMetadata.width,
					ellipseMetadata.height,
					ellipseMetadata.rotation ?? 'rotation',
				].join('-'),
				points: rotatedEllipsePoints,
			});

			if (
				ellipseMetadata.innerScale !== undefined &&
				ellipseValues.innerScale !== null
			) {
				const startEllipsePoints: OutlinePoint[] = [];
				for (let i = 0; i <= 64; i++) {
					const angle = (i / 64) * Math.PI * 2;
					const uv = getRotatedEllipseUv({
						center: handle.value,
						dimensions,
						width: ellipseValues.width * ellipseValues.innerScale,
						height: ellipseValues.height * ellipseValues.innerScale,
						rotation: ellipseValues.rotation,
						angle,
					});
					startEllipsePoints.push(getUvHandlePosition(points, uv));
				}

				ellipses.push({
					key: [
						handle.effectIndex,
						handle.fieldKey,
						ellipseMetadata.width,
						ellipseMetadata.height,
						ellipseMetadata.rotation ?? 'rotation',
						ellipseMetadata.innerScale,
					].join('-'),
					points: startEllipsePoints,
				});
			}

			continue;
		}
	}

	return ellipses;
};

export const getUvEllipseInteractiveControls = ({
	handles,
	dimensions,
	points,
}: {
	readonly handles: readonly SelectedOutlineUvHandle[];
	readonly dimensions?: UvEllipseDimensions | null;
	readonly points: SelectedOutline['points'];
}): UvEllipseInteractiveControls[] => {
	const controls: UvEllipseInteractiveControls[] = [];

	for (const handle of handles) {
		if (
			handle.fieldSchema.visual?.type !== 'ellipse' ||
			handle.ellipseControls === null ||
			handle.ellipseControls === undefined
		) {
			continue;
		}

		const ellipseValues = getUvEllipseValues(handle);
		if (ellipseValues === null) {
			continue;
		}

		const center = getUvHandlePosition(points, handle.value);
		const {rotation} = ellipseValues;
		const widthPoint = getUvHandlePosition(
			points,
			getRotatedEllipseUv({
				center: handle.value,
				dimensions,
				width: ellipseValues.width,
				height: 0,
				rotation,
				angle: 0,
			}),
		);
		const heightPoint = getUvHandlePosition(
			points,
			getRotatedEllipseUv({
				center: handle.value,
				dimensions,
				width: 0,
				height: ellipseValues.height,
				rotation,
				angle: Math.PI / 2,
			}),
		);
		const rotationPoint =
			handle.ellipseControls.rotation === null
				? null
				: getUvHandlePosition(
						points,
						getRotatedEllipseUv({
							center: handle.value,
							dimensions,
							width: 0,
							height: Math.max(ellipseValues.height, 0.001),
							rotation,
							angle: Math.PI / 2,
							radiusOffset: 0.08,
						}),
					);
		const startPoint =
			handle.ellipseControls.innerScale === null ||
			ellipseValues.innerScale === null
				? null
				: getUvHandlePosition(
						points,
						getRotatedEllipseUv({
							center: handle.value,
							dimensions,
							width: ellipseValues.width * ellipseValues.innerScale,
							height: 0,
							rotation,
							angle: 0,
						}),
					);

		controls.push({
			handle,
			center,
			width: ellipseValues.width,
			height: ellipseValues.height,
			rotation,
			resize: [
				{
					key: `${handle.effectIndex}-${handle.fieldKey}-width`,
					axis: 'width',
					field: handle.ellipseControls.width,
					position: widthPoint,
					cursor: getResizeCursor(rotation),
				},
				{
					key: `${handle.effectIndex}-${handle.fieldKey}-height`,
					axis: 'height',
					field: handle.ellipseControls.height,
					position: heightPoint,
					cursor: getResizeCursor(rotation + 90),
				},
			],
			rotationControl:
				handle.ellipseControls.rotation === null || rotationPoint === null
					? null
					: {
							key: `${handle.effectIndex}-${handle.fieldKey}-rotation`,
							field: handle.ellipseControls.rotation,
							position: rotationPoint,
							cursor: getResizeCursor(rotation + 90),
						},
			startControl:
				handle.ellipseControls.innerScale === null || startPoint === null
					? null
					: {
							key: `${handle.effectIndex}-${handle.fieldKey}-start`,
							field: handle.ellipseControls.innerScale,
							position: startPoint,
							cursor: getResizeCursor(rotation),
						},
		});
	}

	return controls;
};

const vectorBetween = (from: OutlinePoint, to: OutlinePoint): OutlinePoint => {
	return {x: to.x - from.x, y: to.y - from.y};
};

const getBilinearUvCoordinateForPoint = (
	points: SelectedOutline['points'],
	point: OutlinePoint,
): UvCoordinate => {
	const [tl, tr, br, bl] = points;
	let u = 0.5;
	let v = 0.5;

	for (let i = 0; i < 8; i++) {
		const current = getBilinearUvHandlePosition(points, [u, v]);
		const errorX = current.x - point.x;
		const errorY = current.y - point.y;
		if (Math.abs(errorX) + Math.abs(errorY) < 0.001) {
			break;
		}

		const du = {
			x: mix(tr.x - tl.x, br.x - bl.x, v),
			y: mix(tr.y - tl.y, br.y - bl.y, v),
		};
		const dv = vectorBetween(mixPoint(tl, tr, u), mixPoint(bl, br, u));
		const determinant = du.x * dv.y - du.y * dv.x;
		if (Math.abs(determinant) < 0.000001) {
			break;
		}

		u -= (errorX * dv.y - errorY * dv.x) / determinant;
		v -= (du.x * errorY - du.y * errorX) / determinant;
	}

	return [u, v];
};

export const getUvCoordinateForPoint = (
	points: SelectedOutline['points'],
	point: OutlinePoint,
): UvCoordinate => {
	const transform = getProjectiveTransform(points);
	if (transform === null) {
		return getBilinearUvCoordinateForPoint(points, point);
	}

	const determinant =
		transform.a * (transform.e - transform.f * transform.h) -
		transform.b * (transform.d - transform.f * transform.g) +
		transform.c * (transform.d * transform.h - transform.e * transform.g);
	if (Math.abs(determinant) < projectiveEpsilon) {
		return getBilinearUvCoordinateForPoint(points, point);
	}

	const inverseA = transform.e - transform.f * transform.h;
	const inverseB = transform.c * transform.h - transform.b;
	const inverseC = transform.b * transform.f - transform.c * transform.e;
	const inverseD = transform.f * transform.g - transform.d;
	const inverseE = transform.a - transform.c * transform.g;
	const inverseF = transform.c * transform.d - transform.a * transform.f;
	const inverseG = transform.d * transform.h - transform.e * transform.g;
	const inverseH = transform.b * transform.g - transform.a * transform.h;
	const inverseI = transform.a * transform.e - transform.b * transform.d;

	const denominator = inverseG * point.x + inverseH * point.y + inverseI;
	if (Math.abs(denominator) < projectiveEpsilon) {
		return getBilinearUvCoordinateForPoint(points, point);
	}

	return [
		(inverseA * point.x + inverseB * point.y + inverseC) / denominator,
		(inverseD * point.x + inverseE * point.y + inverseF) / denominator,
	];
};

export function constrainUv(
	value: UvCoordinate,
	schema: UvCoordinateFieldSchema,
): UvCoordinate {
	const min = schema.min ?? -Infinity;
	const max = schema.max ?? Infinity;
	return [clamp(value[0], min, max), clamp(value[1], min, max)];
}

export function roundUvCoordinate(
	value: UvCoordinate,
	schema: UvCoordinateFieldSchema,
): UvCoordinate {
	const decimalPlaces = getTimelineDisplayDecimalPlaces({
		defaultDecimalPlaces: 3,
		step: schema.step,
	});

	return [
		roundToDecimalPlaces(value[0], decimalPlaces),
		roundToDecimalPlaces(value[1], decimalPlaces),
	];
}

export const roundNumericUvEllipseValue = (
	value: number,
	schema: NumericUvEllipseFieldSchema,
): number => {
	const min = schema.min ?? -Infinity;
	const max = schema.max ?? Infinity;
	const decimalPlaces = getTimelineDisplayDecimalPlaces({
		defaultDecimalPlaces: schema.type === 'rotation-degrees' ? 1 : 3,
		step: schema.step,
	});

	return roundToDecimalPlaces(clamp(value, min, max), decimalPlaces);
};

const getNumericUvEllipseControlField = ({
	activeSchema,
	effectStatus,
	effectValues,
	fieldKey,
}: {
	readonly activeSchema: InteractivitySchema;
	readonly effectStatus: Extract<
		ReturnType<typeof Internals.getEffectPropStatusesCtx>,
		{type: 'can-update-effect'}
	>;
	readonly effectValues: Record<string, unknown>;
	readonly fieldKey: string;
}): UvEllipseControlField | null => {
	const fieldSchema = activeSchema[fieldKey];
	if (
		fieldSchema?.type !== 'number' &&
		fieldSchema?.type !== 'rotation-degrees'
	) {
		return null;
	}

	const propStatus = effectStatus.props[fieldKey];
	if (propStatus?.status !== 'static' && propStatus?.status !== 'keyframed') {
		return null;
	}

	const value = parseFiniteNumber(effectValues[fieldKey]);
	if (value === null) {
		return null;
	}

	return {
		fieldKey,
		fieldSchema,
		fieldDefault: fieldSchema.default,
		propStatus,
		value,
	};
};

const getUvEllipseControls = ({
	activeSchema,
	effectStatus,
	effectValues,
	fieldSchema,
}: {
	readonly activeSchema: InteractivitySchema;
	readonly effectStatus: Extract<
		ReturnType<typeof Internals.getEffectPropStatusesCtx>,
		{type: 'can-update-effect'}
	>;
	readonly effectValues: Record<string, unknown>;
	readonly fieldSchema: UvCoordinateFieldSchema;
}): UvEllipseControls | null => {
	const {visual} = fieldSchema;
	if (visual?.type !== 'ellipse') {
		return null;
	}

	const width = getNumericUvEllipseControlField({
		activeSchema,
		effectStatus,
		effectValues,
		fieldKey: visual.width,
	});
	const height = getNumericUvEllipseControlField({
		activeSchema,
		effectStatus,
		effectValues,
		fieldKey: visual.height,
	});
	const rotation =
		visual.rotation === undefined
			? null
			: getNumericUvEllipseControlField({
					activeSchema,
					effectStatus,
					effectValues,
					fieldKey: visual.rotation,
				});
	const innerScale =
		visual.innerScale === undefined
			? null
			: getNumericUvEllipseControlField({
					activeSchema,
					effectStatus,
					effectValues,
					fieldKey: visual.innerScale,
				});

	if (width === null || height === null) {
		return null;
	}

	return {width, height, rotation, innerScale};
};

export const getSelectedUvHandles = ({
	propStatuses,
	clientId,
	getEffectDragOverrides,
	nodePath,
	selectedEffects,
	sequence,
	sourceFrame,
}: {
	readonly propStatuses: PropStatuses;
	readonly clientId: string | null;
	readonly getEffectDragOverrides: GetEffectDragOverrides;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly selectedEffects: Map<number, SelectedEffectFields> | undefined;
	readonly sequence: TSequence;
	readonly sourceFrame: number;
}): SelectedOutlineUvHandle[] => {
	if (clientId === null || selectedEffects === undefined) {
		return [];
	}

	const handles: SelectedOutlineUvHandle[] = [];

	for (const [effectIndex, selectedFields] of selectedEffects) {
		const effect = sequence.effects[effectIndex];
		if (!effect) {
			continue;
		}

		const effectStatus = Internals.getEffectPropStatusesCtx({
			propStatuses,
			nodePath,
			effectIndex,
		});
		if (effectStatus.type !== 'can-update-effect') {
			continue;
		}

		const shouldShowUvHandles =
			selectedFields.allFields || selectedFields.fieldKeys.size > 0;
		if (!shouldShowUvHandles) {
			continue;
		}

		const dragOverrides = getEffectDragOverrides(nodePath, effectIndex);
		const activeSchema = Internals.flattenActiveSchema(effect.schema, (key) => {
			const propStatus = effectStatus.props[key];
			if (
				propStatus?.status !== 'static' &&
				propStatus?.status !== 'keyframed'
			) {
				return undefined;
			}

			return Internals.getEffectiveVisualModeValue({
				propStatus,
				dragOverrideValue: dragOverrides[key],
				defaultValue: undefined,
				frame: sourceFrame,
				shouldResortToDefaultValueIfUndefined: false,
			});
		});
		const effectValues: Record<string, unknown> = {};
		for (const [fieldKey, fieldSchema] of Object.entries(activeSchema)) {
			if (fieldSchema.type === 'hidden') {
				continue;
			}

			const propStatus = effectStatus.props[fieldKey];
			if (
				propStatus?.status !== 'static' &&
				propStatus?.status !== 'keyframed'
			) {
				continue;
			}

			effectValues[fieldKey] = Internals.getEffectiveVisualModeValue({
				propStatus,
				dragOverrideValue: dragOverrides[fieldKey],
				defaultValue: fieldSchema.default,
				frame: sourceFrame,
				shouldResortToDefaultValueIfUndefined: true,
			});
		}

		for (const [fieldKey, fieldSchema] of Object.entries(activeSchema)) {
			if (fieldSchema.type !== 'uv-coordinate') {
				continue;
			}

			const propStatus = effectStatus.props[fieldKey];
			if (
				propStatus?.status !== 'static' &&
				propStatus?.status !== 'keyframed'
			) {
				continue;
			}

			const effectiveValue = effectValues[fieldKey];
			const value = parseUvCoordinate(effectiveValue);
			if (value === null) {
				continue;
			}

			handles.push({
				clientId,
				propStatus,
				effectIndex,
				effectValues,
				ellipseControls: getUvEllipseControls({
					activeSchema,
					effectStatus,
					effectValues,
					fieldSchema,
				}),
				fieldDefault: fieldSchema.default,
				fieldKey,
				fieldSchema,
				isSelected: selectedFields.fieldKeys.has(fieldKey),
				nodePath,
				schema: effect.schema,
				sourceFrame,
				value,
			});
		}
	}

	return handles;
};
