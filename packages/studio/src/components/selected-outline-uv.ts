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

export type UvCoordinateFieldSchema = Extract<
	InteractivitySchemaField,
	{type: 'uv-coordinate'}
>;

export type SelectedOutlineUvHandle = {
	readonly clientId: string;
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly effectIndex: number;
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
>;

type UvHandleConnectionLine = {
	readonly key: string;
	readonly from: OutlinePoint;
	readonly to: OutlinePoint;
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
		const targetFieldKey = handle.fieldSchema.lineTo;
		if (targetFieldKey === undefined || targetFieldKey === handle.fieldKey) {
			continue;
		}

		const target = handlesByField.get(
			`${handle.effectIndex}\u0000${targetFieldKey}`,
		);
		if (target === undefined) {
			continue;
		}

		const pairKey = [
			handle.effectIndex,
			...[handle.fieldKey, targetFieldKey].sort(),
		].join('\u0000');
		if (seenPairs.has(pairKey)) {
			continue;
		}

		seenPairs.add(pairKey);
		lines.push({
			key: `${handle.effectIndex}-${handle.fieldKey}-${targetFieldKey}`,
			from: getUvHandlePosition(points, handle.value),
			to: getUvHandlePosition(points, target.value),
		});
	}

	return lines;
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

			const dragOverrideValue = dragOverrides[fieldKey];
			const effectiveValue = Internals.getEffectiveVisualModeValue({
				propStatus,
				dragOverrideValue,
				defaultValue: fieldSchema.default,
				frame: sourceFrame,
				shouldResortToDefaultValueIfUndefined: true,
			});
			const value = parseUvCoordinate(effectiveValue);
			if (value === null) {
				continue;
			}

			handles.push({
				clientId,
				propStatus,
				effectIndex,
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
