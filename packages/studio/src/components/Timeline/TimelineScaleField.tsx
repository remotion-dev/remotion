import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import type {
	CanUpdateSequencePropStatusStatic,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {CURRENT_COLOR_LOWERCASE, LIGHT_COLOR} from '../../helpers/colors';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {ScaleLockContext} from '../../state/scale-lock';
import {InputDragger} from '../NewComposition/InputDragger';
import {formatTimelineFieldValueForDisplay} from './timeline-field-display-utils';
import {normalizeTimelineNumber} from './timeline-field-utils';
import {timelineLayerIconContainer} from './TimelineLayerEye';

const leftDraggerStyle: React.CSSProperties = {
	paddingLeft: 0,
};

const rightDraggerStyle: React.CSSProperties = {
	paddingRight: 0,
};

const containerStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 4,
};

const toggleStyle: React.CSSProperties = {
	...timelineLayerIconContainer,
	border: 'none',
	color: LIGHT_COLOR,
	cursor: 'default',
	marginRight: 0,
	padding: 0,
};

const linkIconStyle: React.CSSProperties = {
	width: 14,
	height: 14,
	pointerEvents: 'none',
};

const gapStyle: React.CSSProperties = {
	marginLeft: -6,
	marginRight: -6,
};

const clamp = (value: number, min: number, max: number): number => {
	return Math.min(max, Math.max(min, value));
};

export const getLinkedScale = ({
	axis,
	newValue,
	baseX,
	baseY,
	min,
	max,
}: {
	readonly axis: 'x' | 'y';
	readonly newValue: number;
	readonly baseX: number;
	readonly baseY: number;
	readonly min: number;
	readonly max: number;
}): [number, number] => {
	const drivingBase = axis === 'x' ? baseX : baseY;
	const linkedBase = axis === 'x' ? baseY : baseX;

	if (drivingBase === 0 || linkedBase === 0) {
		const clamped = normalizeTimelineNumber(clamp(newValue, min, max));
		return [clamped, clamped];
	}

	let factor = newValue / drivingBase;
	let driving = newValue;
	let linked = linkedBase * factor;
	const clampedLinked = clamp(linked, min, max);

	if (clampedLinked !== linked) {
		factor = clampedLinked / linkedBase;
		linked = clampedLinked;
		driving = drivingBase * factor;
	}

	const clampedDriving = clamp(driving, min, max);
	const normalizedDriving = normalizeTimelineNumber(clampedDriving);
	const normalizedLinked = normalizeTimelineNumber(linked);

	return axis === 'x'
		? [normalizedDriving, normalizedLinked]
		: [normalizedLinked, normalizedDriving];
};

const valuesEqual = (left: unknown, right: unknown): boolean => {
	return JSON.stringify(left) === JSON.stringify(right);
};

const LinkToggle: React.FC<{
	readonly linked: boolean;
	readonly onToggle: () => void;
}> = ({linked, onToggle}) => {
	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			if (e.button !== 0) {
				return;
			}

			e.stopPropagation();
			onToggle();
		},
		[onToggle],
	);

	return (
		<button
			type="button"
			style={toggleStyle}
			onPointerDown={onPointerDown}
			title={linked ? 'Unlink scale axes' : 'Link scale axes'}
			aria-label={linked ? 'Unlink scale axes' : 'Link scale axes'}
		>
			{linked ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 640 640"
					style={linkIconStyle}
				>
					<path
						fill={CURRENT_COLOR_LOWERCASE}
						d="M32 320C32 214 118 128 224 128L288 128L288 192L224 192C153.3 192 96 249.3 96 320C96 390.7 153.3 448 224 448L288 448L288 512L224 512C118 512 32 426 32 320zM608 320C608 426 522 512 416 512L352 512L352 448L416 448C486.7 448 544 390.7 544 320C544 249.3 486.7 192 416 192L352 192L352 128L416 128C522 128 608 214 608 320zM224 288L448 288L448 352L192 352L192 288L224 288z"
					/>
				</svg>
			) : null}
		</button>
	);
};

export const TimelineScaleField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
	readonly scaleLockNodePath: SequencePropsSubscriptionKey;
}> = ({
	field,
	propStatus,
	effectiveValue,
	onSave,
	onDragValueChange,
	onDragEnd,
	scaleLockNodePath,
}) => {
	const [dragX, setDragX] = useState<number | null>(null);
	const [dragY, setDragY] = useState<number | null>(null);
	const dragStartRef = useRef<readonly [number, number] | null>(null);
	const {getScaleLockState, setScaleLockState} = useContext(ScaleLockContext);

	const [codeX, codeY, codeZ] = useMemo(
		() => NoReactInternals.parseScaleValue(effectiveValue),
		[effectiveValue],
	);

	const defaultLinked = codeX === codeY;
	const linked = getScaleLockState({
		nodePath: scaleLockNodePath,
		fieldKey: field.key,
		defaultValue: defaultLinked,
	});

	const configuredStep =
		field.fieldSchema.type === 'scale' ? field.fieldSchema.step : undefined;
	const step = configuredStep ?? 0.01;
	const min =
		field.fieldSchema.type === 'scale'
			? (field.fieldSchema.min ?? -Infinity)
			: -Infinity;
	const max =
		field.fieldSchema.type === 'scale'
			? (field.fieldSchema.max ?? Infinity)
			: Infinity;

	const formatter = useCallback(
		(v: number | string) => {
			return formatTimelineFieldValueForDisplay({
				fieldSchema: field.fieldSchema,
				value: v,
			});
		},
		[field.fieldSchema],
	);

	const getDragStart = useCallback((): readonly [number, number] => {
		if (dragStartRef.current === null) {
			dragStartRef.current = [dragX ?? codeX, dragY ?? codeY];
		}

		return dragStartRef.current;
	}, [codeX, codeY, dragX, dragY]);

	const serialize = useCallback(
		(x: number, y: number) => {
			return NoReactInternals.serializeScaleValue([x, y, codeZ]);
		},
		[codeZ],
	);

	const onXChange = useCallback(
		(newVal: number) => {
			if (linked) {
				const [baseX, baseY] = getDragStart();
				const [newX, newY] = getLinkedScale({
					axis: 'x',
					newValue: newVal,
					baseX,
					baseY,
					min,
					max,
				});
				setDragX(newX);
				setDragY(newY);
				onDragValueChange(serialize(newX, newY));
				return;
			}

			setDragX(newVal);
			const currentY = dragY ?? codeY;
			onDragValueChange(serialize(newVal, currentY));
		},
		[
			codeY,
			dragY,
			getDragStart,
			linked,
			max,
			min,
			onDragValueChange,
			serialize,
		],
	);

	const onXChangeEnd = useCallback(
		(newVal: number) => {
			const [newX, newY] = linked
				? getLinkedScale({
						axis: 'x',
						newValue: newVal,
						baseX: dragStartRef.current?.[0] ?? codeX,
						baseY: dragStartRef.current?.[1] ?? codeY,
						min,
						max,
					})
				: [newVal, dragY ?? codeY];
			const newScale = serialize(newX, newY);

			const clearDragState = () => {
				dragStartRef.current = null;
				setDragX(null);
				setDragY(null);
				onDragEnd();
			};

			if (!valuesEqual(newScale, propStatus.codeValue)) {
				onSave(newScale).finally(clearDragState);
			} else {
				clearDragState();
			}
		},
		[
			codeX,
			codeY,
			dragY,
			linked,
			max,
			min,
			onDragEnd,
			onSave,
			propStatus,
			serialize,
		],
	);

	const onXTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (Number.isNaN(parsed)) {
				return;
			}

			const [newX, newY] = linked
				? getLinkedScale({
						axis: 'x',
						newValue: parsed,
						baseX: codeX,
						baseY: codeY,
						min,
						max,
					})
				: [parsed, dragY ?? codeY];
			const newScale = serialize(newX, newY);
			if (!valuesEqual(newScale, propStatus.codeValue)) {
				setDragX(newX);
				setDragY(newY);
				onSave(newScale).finally(() => {
					dragStartRef.current = null;
					setDragX(null);
					setDragY(null);
				});
			}
		},
		[codeX, codeY, dragY, linked, max, min, onSave, propStatus, serialize],
	);

	const onYChange = useCallback(
		(newVal: number) => {
			if (linked) {
				const [baseX, baseY] = getDragStart();
				const [newX, newY] = getLinkedScale({
					axis: 'y',
					newValue: newVal,
					baseX,
					baseY,
					min,
					max,
				});
				setDragX(newX);
				setDragY(newY);
				onDragValueChange(serialize(newX, newY));
				return;
			}

			setDragY(newVal);
			const currentX = dragX ?? codeX;
			onDragValueChange(serialize(currentX, newVal));
		},
		[
			codeX,
			dragX,
			getDragStart,
			linked,
			max,
			min,
			onDragValueChange,
			serialize,
		],
	);

	const onYChangeEnd = useCallback(
		(newVal: number) => {
			const [newX, newY] = linked
				? getLinkedScale({
						axis: 'y',
						newValue: newVal,
						baseX: dragStartRef.current?.[0] ?? codeX,
						baseY: dragStartRef.current?.[1] ?? codeY,
						min,
						max,
					})
				: [dragX ?? codeX, newVal];
			const newScale = serialize(newX, newY);

			const clearDragState = () => {
				dragStartRef.current = null;
				setDragX(null);
				setDragY(null);
				onDragEnd();
			};

			if (!valuesEqual(newScale, propStatus.codeValue)) {
				onSave(newScale).finally(clearDragState);
			} else {
				clearDragState();
			}
		},
		[
			codeX,
			codeY,
			dragX,
			linked,
			max,
			min,
			onDragEnd,
			onSave,
			propStatus,
			serialize,
		],
	);

	const onYTextChange = useCallback(
		(newVal: string) => {
			const parsed = Number(newVal);
			if (Number.isNaN(parsed)) {
				return;
			}

			const [newX, newY] = linked
				? getLinkedScale({
						axis: 'y',
						newValue: parsed,
						baseX: codeX,
						baseY: codeY,
						min,
						max,
					})
				: [dragX ?? codeX, parsed];
			const newScale = serialize(newX, newY);
			if (!valuesEqual(newScale, propStatus.codeValue)) {
				setDragX(newX);
				setDragY(newY);
				onSave(newScale).finally(() => {
					dragStartRef.current = null;
					setDragX(null);
					setDragY(null);
				});
			}
		},
		[codeX, codeY, dragX, linked, max, min, onSave, propStatus, serialize],
	);

	const onToggleLink = useCallback(() => {
		setScaleLockState({
			nodePath: scaleLockNodePath,
			fieldKey: field.key,
			linked: !linked,
		});
	}, [field.key, linked, scaleLockNodePath, setScaleLockState]);

	return (
		<span style={containerStyle}>
			<InputDragger
				type="number"
				value={dragX ?? codeX}
				style={leftDraggerStyle}
				status="ok"
				small
				onValueChange={onXChange}
				onValueChangeEnd={onXChangeEnd}
				onTextChange={onXTextChange}
				min={min}
				max={max}
				step={step}
				formatter={formatter}
				rightAlign={false}
			/>
			<div style={gapStyle} />
			<InputDragger
				type="number"
				value={dragY ?? codeY}
				style={rightDraggerStyle}
				status="ok"
				small
				onValueChange={onYChange}
				onValueChangeEnd={onYChangeEnd}
				onTextChange={onYTextChange}
				min={min}
				max={max}
				step={step}
				formatter={formatter}
				rightAlign={false}
			/>
			<LinkToggle linked={linked} onToggle={onToggleLink} />
		</span>
	);
};
