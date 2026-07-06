import {
	KEYFRAME_EASING_PRESETS,
	LINEAR_KEYFRAME_EASING,
} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {InteractivitySchemaField} from 'remotion';
import {Easing, Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	BACKGROUND,
	BLUE,
	EASING_SELECTED_BACKGROUND,
	INPUT_BACKGROUND,
	WHITE_ALPHA_05,
	LIGHT_TEXT,
	WHITE,
	WHITE_ALPHA_12,
	WHITE_ALPHA_35,
	WHITE_ALPHA_72,
} from '../../helpers/colors';
import {Checkbox} from '../Checkbox';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {InputDragger} from '../NewComposition/InputDragger';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {formatTimelineFieldValueForDisplay} from './timeline-field-display-utils';
import type {TimelineSelection} from './TimelineSelection';
import type {
	SelectedEasingUpdate,
	TimelineEasingValue,
} from './update-selected-easing';
import {
	getSelectedEasingUpdates,
	makeEasingDragOverride,
	updateSelectedTimelineEasings,
} from './update-selected-easing';

type CubicBezierTuple = [number, number, number, number];
type BezierEasing = Extract<TimelineEasingValue, {type: 'bezier'}>;
type SpringEasing = Extract<TimelineEasingValue, {type: 'spring'}>;
type HandleIndex = 0 | 1;
type Coordinate = 'x' | 'y';
type EditorMode = 'bezier' | 'spring';
type SpringNumberKey =
	| 'damping'
	| 'durationRestThreshold'
	| 'mass'
	| 'stiffness';
type EasingGraphLabels = {
	readonly start: string;
	readonly end: string;
};
type EasingPreset = {
	readonly id: string;
	readonly label: string;
	readonly easing: TimelineEasingValue;
};

const SVG_WIDTH = 560;
const SVG_HEIGHT = 320;
const PLOT_LEFT = 42;
const PLOT_TOP = 0;
const PLOT_WIDTH = 500;
const PLOT_HEIGHT = SVG_HEIGHT;
const Y_MIN = -2;
const Y_MAX = 3;
const LINEAR_EASING: TimelineEasingValue = {type: 'linear'};
const LINEAR_BEZIER: CubicBezierTuple = [0.25, 0.25, 0.75, 0.75];
const DEFAULT_EASING_GRAPH_LABELS: EasingGraphLabels = {
	start: '0',
	end: '1',
};
const EASING_GRAPH_GUIDE_COLOR = WHITE_ALPHA_12;
const EASING_GRAPH_LABEL_FONT_SIZE = 13;
const EASING_GRAPH_LABEL_HEIGHT = 20;
const EASING_GRAPH_LABEL_HORIZONTAL_PADDING = 4;
const EASING_GRAPH_LABEL_MAX_WIDTH = PLOT_WIDTH / 2;
const PRESET_PREVIEW_WIDTH = 48;
const PRESET_PREVIEW_HEIGHT = 30;
const PRESET_PREVIEW_PADDING = 5;
const PRESET_PREVIEW_Y_MIN = -0.35;
const PRESET_PREVIEW_Y_MAX = 1.45;
const DEFAULT_DURATION_REST_THRESHOLD = 0.02;
const DEFAULT_SPRING_EASING: SpringEasing = {
	type: 'spring',
	allowTail: true,
	damping: 10,
	durationRestThreshold: DEFAULT_DURATION_REST_THRESHOLD,
	mass: 1,
	overshootClamping: false,
	stiffness: 100,
};
const EDITOR_EASING_PRESETS: readonly EasingPreset[] = [
	{
		id: 'linear',
		label: 'Linear',
		easing: LINEAR_KEYFRAME_EASING,
	},
	...KEYFRAME_EASING_PRESETS,
];

const SPRING_LIMITS: Record<
	SpringNumberKey,
	{
		readonly min: number;
		readonly max: number;
		readonly step: number;
	}
> = {
	damping: {min: 1, max: 200, step: 1},
	durationRestThreshold: {min: 0.001, max: 0.5, step: 0.001},
	mass: {min: 0.1, max: 20, step: 0.1},
	stiffness: {min: 1, max: 1000, step: 1},
};

const SPRING_DECIMAL_PLACES: Record<SpringNumberKey, number> = {
	damping: 0,
	durationRestThreshold: 3,
	mass: 2,
	stiffness: 0,
};

const SPRING_FALLBACKS: Record<SpringNumberKey, number> = {
	damping: DEFAULT_SPRING_EASING.damping,
	durationRestThreshold: DEFAULT_DURATION_REST_THRESHOLD,
	mass: DEFAULT_SPRING_EASING.mass,
	stiffness: DEFAULT_SPRING_EASING.stiffness,
};

const inlineContainer: React.CSSProperties = {
	width: '100%',
	minWidth: 0,
};

const segmentedControlWrapper: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'flex-start',
	marginTop: 8,
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
};

const presetButtonsWrapper: React.CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap',
	gap: 6,
	justifyContent: 'flex-start',
	marginBottom: 8,
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
};

const inspectorPresetButtonsWrapper: React.CSSProperties = {
	...presetButtonsWrapper,
	padding: `8px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px 0`,
};

const presetButtonBase: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: INPUT_BACKGROUND,
	border: `1px solid ${WHITE_ALPHA_05}`,
	borderRadius: 4,
	display: 'inline-flex',
	height: 34,
	justifyContent: 'center',
	padding: 0,
	width: 52,
};

const presetPreviewSvgStyle: React.CSSProperties = {
	display: 'block',
	height: PRESET_PREVIEW_HEIGHT,
	width: PRESET_PREVIEW_WIDTH,
};

const coordinatesGridBase: React.CSSProperties = {
	display: 'grid',
	gap: 10,
	marginTop: 12,
};

const coordinateRow: React.CSSProperties = {
	gap: 4,
};

const coordinateLabel: React.CSSProperties = {
	fontSize: 13,
	color: WHITE_ALPHA_72,
	paddingLeft: 6,
};

const coordinateInputWrapper: React.CSSProperties = {
	height: 34,
	display: 'flex',
	alignItems: 'center',
};

const checkboxWrapper: React.CSSProperties = {
	...coordinateInputWrapper,
	paddingLeft: 6,
};

const numberInputStyle: React.CSSProperties = {
	backgroundColor: INPUT_BACKGROUND,
	borderRadius: 4,
	width: '100%',
};

const svgStyle: React.CSSProperties = {
	aspectRatio: `${SVG_WIDTH} / ${SVG_HEIGHT}`,
	display: 'block',
	height: 'auto',
	overflow: 'visible',
	width: '100%',
};

const clamp = (value: number, min: number, max: number) => {
	return Math.min(max, Math.max(min, value));
};

const sanitizeBezier = (bezier: CubicBezierTuple): CubicBezierTuple => [
	clamp(bezier[0], 0, 1),
	clamp(bezier[1], Y_MIN, Y_MAX),
	clamp(bezier[2], 0, 1),
	clamp(bezier[3], Y_MIN, Y_MAX),
];

const isSpringEasing = (
	easing: TimelineEasingValue,
): easing is SpringEasing => {
	return easing.type === 'spring';
};

const isBezierEasing = (
	easing: TimelineEasingValue,
): easing is BezierEasing => {
	return easing.type === 'bezier';
};

const easingToBezier = (easing: TimelineEasingValue): CubicBezierTuple => {
	return isBezierEasing(easing)
		? sanitizeBezier([easing.x1, easing.y1, easing.x2, easing.y2])
		: LINEAR_BEZIER;
};

const easingToSpring = (easing: TimelineEasingValue): SpringEasing => {
	return isSpringEasing(easing)
		? sanitizeSpring(easing)
		: DEFAULT_SPRING_EASING;
};

const easingToMode = (easing: TimelineEasingValue): EditorMode => {
	return isSpringEasing(easing) ? 'spring' : 'bezier';
};

const roundToDecimalPlaces = (value: number, decimalPlaces: number) => {
	const factor = 10 ** decimalPlaces;
	const rounded = Math.round(value * factor) / factor;
	return Object.is(rounded, -0) ? 0 : rounded;
};

const roundCoordinate = (value: number) => roundToDecimalPlaces(value, 4);

const serializeBezier = (bezier: CubicBezierTuple): TimelineEasingValue => {
	const rounded = sanitizeBezier(bezier).map(
		roundCoordinate,
	) as CubicBezierTuple;
	if (rounded[0] === rounded[1] && rounded[2] === rounded[3]) {
		return LINEAR_EASING;
	}

	return {
		type: 'bezier',
		x1: rounded[0],
		y1: rounded[1],
		x2: rounded[2],
		y2: rounded[3],
	};
};

const sanitizeSpringValue = (
	value: number,
	key: SpringNumberKey,
	fallback: number,
) => {
	const limits = SPRING_LIMITS[key];
	if (!Number.isFinite(value)) {
		return fallback;
	}

	return roundToDecimalPlaces(
		clamp(value, limits.min, limits.max),
		SPRING_DECIMAL_PLACES[key],
	);
};

const sanitizeSpring = (spring: SpringEasing): SpringEasing => ({
	type: 'spring',
	allowTail: spring.allowTail,
	damping: sanitizeSpringValue(
		spring.damping,
		'damping',
		DEFAULT_SPRING_EASING.damping,
	),
	durationRestThreshold:
		spring.durationRestThreshold === null
			? null
			: sanitizeSpringValue(
					spring.durationRestThreshold,
					'durationRestThreshold',
					DEFAULT_DURATION_REST_THRESHOLD,
				),
	mass: sanitizeSpringValue(spring.mass, 'mass', DEFAULT_SPRING_EASING.mass),
	overshootClamping: spring.overshootClamping,
	stiffness: sanitizeSpringValue(
		spring.stiffness,
		'stiffness',
		DEFAULT_SPRING_EASING.stiffness,
	),
});

const serializeSpring = (spring: SpringEasing): TimelineEasingValue => {
	return sanitizeSpring(spring);
};

const formatNumber = (value: number | string) => {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) {
		return String(value);
	}

	return String(roundCoordinate(numericValue));
};

const formatNumberWithDecimalPlaces =
	(decimalPlaces: number) => (value: number | string) => {
		const numericValue = Number(value);
		if (!Number.isFinite(numericValue)) {
			return String(value);
		}

		return String(roundToDecimalPlaces(numericValue, decimalPlaces));
	};

const springFormatters: Record<
	SpringNumberKey,
	(value: number | string) => string
> = {
	damping: formatNumberWithDecimalPlaces(SPRING_DECIMAL_PLACES.damping),
	durationRestThreshold: formatNumberWithDecimalPlaces(
		SPRING_DECIMAL_PLACES.durationRestThreshold,
	),
	mass: formatNumberWithDecimalPlaces(SPRING_DECIMAL_PLACES.mass),
	stiffness: formatNumberWithDecimalPlaces(SPRING_DECIMAL_PLACES.stiffness),
};

const areEasingsEqual = (
	first: TimelineEasingValue,
	second: TimelineEasingValue,
) => {
	if (first === second) {
		return true;
	}

	if (first.type !== second.type) {
		return false;
	}

	switch (first.type) {
		case 'linear':
			return true;
		case 'spring':
			return (
				second.type === 'spring' &&
				first.allowTail === second.allowTail &&
				first.damping === second.damping &&
				first.durationRestThreshold === second.durationRestThreshold &&
				first.mass === second.mass &&
				first.overshootClamping === second.overshootClamping &&
				first.stiffness === second.stiffness
			);
		case 'bezier':
			return (
				second.type === 'bezier' &&
				first.x1 === second.x1 &&
				first.y1 === second.y1 &&
				first.x2 === second.x2 &&
				first.y2 === second.y2
			);
		default:
			throw new Error(
				`Unsupported easing: ${JSON.stringify(first satisfies never)}`,
			);
	}
};

const getEasingUpdateTargetKey = (update: SelectedEasingUpdate) => {
	const nodePathKey = Internals.makeSequencePropsSubscriptionKey(
		update.nodePath,
	);
	if (update.type === 'sequence') {
		return `sequence:${nodePathKey}:${update.fieldKey}:${update.segmentIndex}`;
	}

	return `effect:${nodePathKey}:${update.effectIndex}:${update.fieldKey}:${update.segmentIndex}`;
};

const getBuiltInVisualStyleFieldSchema = (
	fieldKey: string,
): InteractivitySchemaField | undefined => {
	const transformSchema = Internals.transformSchema as Record<
		string,
		InteractivitySchemaField
	>;
	const directField = transformSchema[fieldKey];
	if (directField) {
		return directField;
	}

	return transformSchema[
		fieldKey.startsWith('style.') ? fieldKey : `style.${fieldKey}`
	];
};

const getEasingGraphFieldSchema = (
	update: SelectedEasingUpdate,
): InteractivitySchemaField | undefined => {
	return (
		update.schema[update.fieldKey] ??
		getBuiltInVisualStyleFieldSchema(update.fieldKey)
	);
};

const formatEasingGraphLabel = (
	value: unknown,
	update: SelectedEasingUpdate,
): string =>
	formatTimelineFieldValueForDisplay({
		fieldSchema: getEasingGraphFieldSchema(update),
		value,
	});

const getEasingGraphLabelsFromUpdate = (
	update: SelectedEasingUpdate,
): EasingGraphLabels | null => {
	const startKeyframe = update.propStatus.keyframes[update.segmentIndex];
	const endKeyframe = update.propStatus.keyframes[update.segmentIndex + 1];

	if (!startKeyframe || !endKeyframe) {
		return null;
	}

	return {
		start: formatEasingGraphLabel(startKeyframe.value, update),
		end: formatEasingGraphLabel(endKeyframe.value, update),
	};
};

const areEasingGraphLabelsEqual = (
	first: EasingGraphLabels,
	second: EasingGraphLabels,
) => first.start === second.start && first.end === second.end;

const getEasingGraphLabels = (
	updates: readonly SelectedEasingUpdate[],
): EasingGraphLabels => {
	const firstLabels =
		updates.length === 0 ? null : getEasingGraphLabelsFromUpdate(updates[0]);

	if (firstLabels === null) {
		return DEFAULT_EASING_GRAPH_LABELS;
	}

	return updates.every((update) => {
		const labels = getEasingGraphLabelsFromUpdate(update);
		return labels !== null && areEasingGraphLabelsEqual(labels, firstLabels);
	})
		? firstLabels
		: DEFAULT_EASING_GRAPH_LABELS;
};

const xToSvg = (value: number) => PLOT_LEFT + value * PLOT_WIDTH;
const yToSvg = (value: number) =>
	PLOT_TOP + ((Y_MAX - value) / (Y_MAX - Y_MIN)) * PLOT_HEIGHT;
const presetPreviewXToSvg = (value: number) =>
	PRESET_PREVIEW_PADDING +
	value * (PRESET_PREVIEW_WIDTH - PRESET_PREVIEW_PADDING * 2);
const presetPreviewYToSvg = (value: number) =>
	PRESET_PREVIEW_PADDING +
	((PRESET_PREVIEW_Y_MAX - value) /
		(PRESET_PREVIEW_Y_MAX - PRESET_PREVIEW_Y_MIN)) *
		(PRESET_PREVIEW_HEIGHT - PRESET_PREVIEW_PADDING * 2);

const getEasingFunction = (easing: TimelineEasingValue) => {
	switch (easing.type) {
		case 'linear':
			return Easing.linear;
		case 'bezier':
			return Easing.bezier(easing.x1, easing.y1, easing.x2, easing.y2);
		case 'spring':
			return Easing.spring({
				allowTail: easing.allowTail ?? undefined,
				damping: easing.damping,
				durationRestThreshold: easing.durationRestThreshold ?? undefined,
				mass: easing.mass,
				overshootClamping: easing.overshootClamping,
				stiffness: easing.stiffness,
			});
		default:
			throw new Error(
				`Unsupported easing: ${JSON.stringify(easing satisfies never)}`,
			);
	}
};

const getPresetPreviewPath = (easing: TimelineEasingValue) => {
	const easingFunction = getEasingFunction(easing);
	const samples = 36;
	const points: string[] = [];

	for (let i = 0; i <= samples; i++) {
		const progress = i / samples;
		const x = presetPreviewXToSvg(progress);
		const y = presetPreviewYToSvg(
			clamp(
				easingFunction(progress),
				PRESET_PREVIEW_Y_MIN,
				PRESET_PREVIEW_Y_MAX,
			),
		);
		points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
	}

	return points.join(' ');
};

const pointFromBezier = (bezier: CubicBezierTuple, handle: HandleIndex) => {
	const x = handle === 0 ? bezier[0] : bezier[2];
	const y = handle === 0 ? bezier[1] : bezier[3];
	return {x: xToSvg(x), y: yToSvg(y)};
};

const getEasingGraphLabelWidth = (label: string) => {
	return clamp(
		label.length * 7.8 + EASING_GRAPH_LABEL_HORIZONTAL_PADDING * 2,
		24,
		EASING_GRAPH_LABEL_MAX_WIDTH,
	);
};

const getEasingGraphLabelStyle = (
	textAlign: 'left' | 'right',
): React.CSSProperties => ({
	alignItems: 'center',
	backgroundColor: BACKGROUND,
	color: LIGHT_TEXT,
	display: 'flex',
	fontSize: EASING_GRAPH_LABEL_FONT_SIZE,
	height: '100%',
	justifyContent: textAlign === 'left' ? 'flex-start' : 'flex-end',
	lineHeight: `${EASING_GRAPH_LABEL_HEIGHT}px`,
	overflow: 'hidden',
	padding: `0 ${EASING_GRAPH_LABEL_HORIZONTAL_PADDING}px`,
	textAlign,
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

const EasingGraphScaffold: React.FC<{
	readonly labels: EasingGraphLabels;
}> = ({labels}) => {
	const yZero = yToSvg(0);
	const yOne = yToSvg(1);
	const bottomLabelWidth = getEasingGraphLabelWidth(labels.start);
	const topLabelWidth = getEasingGraphLabelWidth(labels.end);

	return (
		<>
			<line
				x1={PLOT_LEFT}
				y1={yZero}
				x2={PLOT_LEFT + PLOT_WIDTH}
				y2={yZero}
				stroke={EASING_GRAPH_GUIDE_COLOR}
				strokeWidth={1}
			/>
			<line
				x1={PLOT_LEFT}
				y1={yOne}
				x2={PLOT_LEFT + PLOT_WIDTH}
				y2={yOne}
				stroke={EASING_GRAPH_GUIDE_COLOR}
				strokeWidth={1}
			/>
			<foreignObject
				x={PLOT_LEFT - EASING_GRAPH_LABEL_HORIZONTAL_PADDING}
				y={yOne - EASING_GRAPH_LABEL_HEIGHT / 2}
				width={topLabelWidth}
				height={EASING_GRAPH_LABEL_HEIGHT}
			>
				<div style={getEasingGraphLabelStyle('left')} title={labels.end}>
					{labels.end}
				</div>
			</foreignObject>
			<foreignObject
				x={
					PLOT_LEFT +
					PLOT_WIDTH -
					bottomLabelWidth +
					EASING_GRAPH_LABEL_HORIZONTAL_PADDING
				}
				y={yZero - EASING_GRAPH_LABEL_HEIGHT / 2}
				width={bottomLabelWidth}
				height={EASING_GRAPH_LABEL_HEIGHT}
			>
				<div style={getEasingGraphLabelStyle('right')} title={labels.start}>
					{labels.start}
				</div>
			</foreignObject>
		</>
	);
};

const EasingPresetButton: React.FC<{
	readonly currentEasing: TimelineEasingValue;
	readonly disabled: boolean;
	readonly onClick: (easing: TimelineEasingValue) => void;
	readonly preset: EasingPreset;
}> = ({currentEasing, disabled, onClick, preset}) => {
	const selected = areEasingsEqual(currentEasing, preset.easing);
	const path = useMemo(
		() => getPresetPreviewPath(preset.easing),
		[preset.easing],
	);
	const style = useMemo(
		(): React.CSSProperties => ({
			...presetButtonBase,
			backgroundColor: selected ? EASING_SELECTED_BACKGROUND : INPUT_BACKGROUND,
			borderColor: selected ? BLUE : WHITE_ALPHA_05,
			cursor: disabled ? 'not-allowed' : 'pointer',
			opacity: disabled ? 0.45 : 1,
		}),
		[disabled, selected],
	);
	const handleClick = useCallback(() => {
		onClick(preset.easing);
	}, [onClick, preset.easing]);

	return (
		<button
			type="button"
			style={style}
			title={preset.label}
			aria-label={`Apply ${preset.label} easing`}
			disabled={disabled}
			onClick={handleClick}
		>
			<svg
				width={PRESET_PREVIEW_WIDTH}
				height={PRESET_PREVIEW_HEIGHT}
				viewBox={`0 0 ${PRESET_PREVIEW_WIDTH} ${PRESET_PREVIEW_HEIGHT}`}
				style={presetPreviewSvgStyle}
				aria-hidden="true"
				focusable={false}
			>
				<path
					d={path}
					fill="none"
					stroke={WHITE}
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</button>
	);
};

export type EasingEditorState = {
	initialEasing: TimelineEasingValue;
	selections: TimelineSelection[];
};

export const EasingEditor: React.FC<{
	readonly state: EasingEditorState;
	readonly renderHeader?: (
		modeItems: SegmentedControlItem[],
	) => React.ReactNode;
}> = ({state, renderHeader}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {
		setDragOverrides,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
		setPropStatuses,
	} = useContext(Internals.VisualModeSettersContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const svgRef = useRef<SVGSVGElement>(null);
	const [mode, setMode] = useState(() => easingToMode(state.initialEasing));
	const [bezier, setBezier] = useState(() =>
		easingToBezier(state.initialEasing),
	);
	const [spring, setSpring] = useState(() =>
		easingToSpring(state.initialEasing),
	);
	const bezierRef = useRef(bezier);
	const springRef = useRef(spring);
	const liveOverrideVersionRef = useRef(0);
	const pendingOverrideTargetsRef = useRef<SelectedEasingUpdate[]>([]);
	const [activeHandle, setActiveHandle] = useState<HandleIndex | null>(null);

	useEffect(() => {
		const nextBezier = easingToBezier(state.initialEasing);
		const nextSpring = easingToSpring(state.initialEasing);
		bezierRef.current = nextBezier;
		springRef.current = nextSpring;
		setMode(easingToMode(state.initialEasing));
		setBezier(nextBezier);
		setSpring(nextSpring);
	}, [state.initialEasing]);

	const getCurrentEasingUpdates = useCallback(() => {
		return getSelectedEasingUpdates({
			selections: state.selections,
			sequences: sequencesRef.current,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
			propStatuses: propStatusesRef.current,
		});
	}, [
		overrideIdToNodePathMappings,
		propStatusesRef,
		sequencesRef,
		state.selections,
	]);

	const clearEasingDragOverrides = useCallback(
		(updates: readonly SelectedEasingUpdate[]) => {
			const sequenceTargets = new Set<string>();
			const effectTargets = new Set<string>();

			for (const update of updates) {
				const key = Internals.makeSequencePropsSubscriptionKey(update.nodePath);
				if (update.type === 'sequence') {
					if (!sequenceTargets.has(key)) {
						sequenceTargets.add(key);
						clearDragOverrides(update.nodePath);
					}

					continue;
				}

				const effectKey = `${key}.${update.effectIndex}`;
				if (!effectTargets.has(effectKey)) {
					effectTargets.add(effectKey);
					clearEffectDragOverrides(update.nodePath, update.effectIndex);
				}
			}
		},
		[clearDragOverrides, clearEffectDragOverrides],
	);

	const applyLiveEasing = useCallback(
		(easing: TimelineEasingValue) => {
			const updates = getCurrentEasingUpdates();
			liveOverrideVersionRef.current++;
			const version = liveOverrideVersionRef.current;
			const nextTargetKeys = new Set(updates.map(getEasingUpdateTargetKey));
			const staleTargets = pendingOverrideTargetsRef.current.filter(
				(update) => !nextTargetKeys.has(getEasingUpdateTargetKey(update)),
			);

			clearEasingDragOverrides(staleTargets);
			pendingOverrideTargetsRef.current = updates;

			for (const update of updates) {
				const dragOverrideValue = makeEasingDragOverride({
					status: update.propStatus,
					segmentIndex: update.segmentIndex,
					easing,
				});

				if (update.type === 'sequence') {
					setDragOverrides(update.nodePath, update.fieldKey, dragOverrideValue);
				} else {
					setEffectDragOverrides(
						update.nodePath,
						update.effectIndex,
						update.fieldKey,
						dragOverrideValue,
					);
				}
			}

			return version;
		},
		[
			clearEasingDragOverrides,
			getCurrentEasingUpdates,
			setDragOverrides,
			setEffectDragOverrides,
		],
	);

	const clearPendingEasingDragOverrides = useCallback(
		(version: number) => {
			if (version !== liveOverrideVersionRef.current) {
				return;
			}

			clearEasingDragOverrides(pendingOverrideTargetsRef.current);
			pendingOverrideTargetsRef.current = [];
		},
		[clearEasingDragOverrides],
	);

	const commitEasing = useCallback(
		(easing: TimelineEasingValue, version: number) => {
			const updates = getCurrentEasingUpdates();
			const hasChange = updates.some(
				(update) => !areEasingsEqual(update.currentEasing, easing),
			);

			if (
				previewServerState.type !== 'connected' ||
				updates.length === 0 ||
				!hasChange
			) {
				clearPendingEasingDragOverrides(version);
				return;
			}

			const promise = updateSelectedTimelineEasings({
				selections: state.selections,
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				propStatuses: propStatusesRef.current,
				setPropStatuses,
				clientId: previewServerState.clientId,
				easing,
			});

			if (promise === null) {
				clearPendingEasingDragOverrides(version);
				return;
			}

			promise
				.catch(() => undefined)
				.finally(() => {
					clearPendingEasingDragOverrides(version);
				});
		},
		[
			clearPendingEasingDragOverrides,
			getCurrentEasingUpdates,
			overrideIdToNodePathMappings,
			previewServerState,
			propStatusesRef,
			sequencesRef,
			setPropStatuses,
			state.selections,
		],
	);

	const setBezierAndPreview = useCallback(
		(nextBezier: CubicBezierTuple) => {
			const sanitized = sanitizeBezier(nextBezier);
			bezierRef.current = sanitized;
			setBezier(sanitized);
			return applyLiveEasing(serializeBezier(sanitized));
		},
		[applyLiveEasing],
	);

	const setSpringAndPreview = useCallback(
		(nextSpring: SpringEasing) => {
			const sanitized = sanitizeSpring(nextSpring);
			springRef.current = sanitized;
			setSpring(sanitized);
			return applyLiveEasing(serializeSpring(sanitized));
		},
		[applyLiveEasing],
	);

	const setCoordinate = useCallback(
		(
			handle: HandleIndex,
			coordinate: Coordinate,
			value: number,
			commit: boolean,
		) => {
			const next = [...bezierRef.current] as CubicBezierTuple;
			const index =
				handle === 0
					? coordinate === 'x'
						? 0
						: 1
					: coordinate === 'x'
						? 2
						: 3;
			next[index] =
				coordinate === 'x' ? clamp(value, 0, 1) : clamp(value, Y_MIN, Y_MAX);
			const version = setBezierAndPreview(next);

			if (commit) {
				commitEasing(serializeBezier(next), version);
			}
		},
		[commitEasing, setBezierAndPreview],
	);

	const setSpringNumber = useCallback(
		(key: SpringNumberKey, value: number, commit: boolean) => {
			const next = {
				...springRef.current,
				[key]: sanitizeSpringValue(value, key, SPRING_FALLBACKS[key]),
			};
			const version = setSpringAndPreview(next);

			if (commit) {
				commitEasing(serializeSpring(next), version);
			}
		},
		[commitEasing, setSpringAndPreview],
	);

	const setOvershootClamping = useCallback(() => {
		const next = {
			...springRef.current,
			overshootClamping: !springRef.current.overshootClamping,
		};
		const version = setSpringAndPreview(next);
		commitEasing(serializeSpring(next), version);
	}, [commitEasing, setSpringAndPreview]);

	const setAllowTail = useCallback(() => {
		const next = {
			...springRef.current,
			allowTail: !(springRef.current.allowTail ?? false),
		};
		const version = setSpringAndPreview(next);
		commitEasing(serializeSpring(next), version);
	}, [commitEasing, setSpringAndPreview]);

	const switchMode = useCallback(
		(nextMode: EditorMode) => {
			setMode(nextMode);
			if (mode === nextMode || previewServerState.type !== 'connected') {
				return;
			}

			const easing =
				nextMode === 'spring'
					? serializeSpring(springRef.current)
					: serializeBezier(bezierRef.current);
			const version = applyLiveEasing(easing);
			commitEasing(easing, version);
		},
		[applyLiveEasing, commitEasing, mode, previewServerState.type],
	);

	const applyPreset = useCallback(
		(easing: TimelineEasingValue) => {
			if (previewServerState.type !== 'connected') {
				return;
			}

			if (isSpringEasing(easing)) {
				const nextSpring = sanitizeSpring(easing);
				setMode('spring');
				const springVersion = setSpringAndPreview(nextSpring);
				commitEasing(serializeSpring(nextSpring), springVersion);
				return;
			}

			const nextBezier = easingToBezier(easing);
			setMode('bezier');
			const bezierVersion = setBezierAndPreview(nextBezier);
			commitEasing(serializeBezier(nextBezier), bezierVersion);
		},
		[
			commitEasing,
			previewServerState.type,
			setBezierAndPreview,
			setSpringAndPreview,
		],
	);

	const getValueFromPointer = useCallback(
		(event: {clientX: number; clientY: number}) => {
			const svg = svgRef.current;
			if (!svg) {
				return null;
			}

			const rect = svg.getBoundingClientRect();
			const svgX = ((event.clientX - rect.left) / rect.width) * SVG_WIDTH;
			const svgY = ((event.clientY - rect.top) / rect.height) * SVG_HEIGHT;
			const x = clamp((svgX - PLOT_LEFT) / PLOT_WIDTH, 0, 1);
			const y = clamp(
				Y_MAX - ((svgY - PLOT_TOP) / PLOT_HEIGHT) * (Y_MAX - Y_MIN),
				Y_MIN,
				Y_MAX,
			);

			return {x, y};
		},
		[],
	);

	const updateHandleFromPointer = useCallback(
		(handle: HandleIndex, event: {clientX: number; clientY: number}) => {
			const value = getValueFromPointer(event);
			if (!value) {
				return;
			}

			const next = [...bezierRef.current] as CubicBezierTuple;
			if (handle === 0) {
				next[0] = value.x;
				next[1] = value.y;
			} else {
				next[2] = value.x;
				next[3] = value.y;
			}

			setBezierAndPreview(next);
		},
		[getValueFromPointer, setBezierAndPreview],
	);

	useEffect(() => {
		if (activeHandle === null) {
			return;
		}

		const onPointerMove = (event: PointerEvent) => {
			updateHandleFromPointer(activeHandle, event);
		};

		const onPointerUp = () => {
			commitEasing(
				serializeBezier(bezierRef.current),
				liveOverrideVersionRef.current,
			);
			setActiveHandle(null);
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp, {once: true});

		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		};
	}, [activeHandle, commitEasing, updateHandleFromPointer]);

	const onHandlePointerDown = useCallback(
		(handle: HandleIndex, event: React.PointerEvent<SVGCircleElement>) => {
			if (previewServerState.type !== 'connected') {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			setActiveHandle(handle);
			updateHandleFromPointer(handle, event);
		},
		[previewServerState.type, updateHandleFromPointer],
	);

	useEffect(() => {
		return () => {
			clearEasingDragOverrides(pendingOverrideTargetsRef.current);
		};
	}, [clearEasingDragOverrides]);

	const startPoint = useMemo(() => ({x: xToSvg(0), y: yToSvg(0)}), []);
	const endPoint = useMemo(() => ({x: xToSvg(1), y: yToSvg(1)}), []);
	const firstHandle = useMemo(() => pointFromBezier(bezier, 0), [bezier]);
	const secondHandle = useMemo(() => pointFromBezier(bezier, 1), [bezier]);
	const bezierPath = useMemo(() => {
		return `M ${startPoint.x} ${startPoint.y} C ${firstHandle.x} ${firstHandle.y}, ${secondHandle.x} ${secondHandle.y}, ${endPoint.x} ${endPoint.y}`;
	}, [endPoint, firstHandle, secondHandle, startPoint]);
	const springPath = useMemo(() => {
		const easing = Easing.spring({
			allowTail: spring.allowTail ?? undefined,
			damping: spring.damping,
			durationRestThreshold: spring.durationRestThreshold ?? undefined,
			mass: spring.mass,
			overshootClamping: spring.overshootClamping,
			stiffness: spring.stiffness,
		});
		const samples = 80;
		const points: string[] = [];
		for (let i = 0; i <= samples; i++) {
			const t = i / samples;
			const x = xToSvg(t);
			const y = yToSvg(clamp(easing(t), Y_MIN, Y_MAX));
			points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
		}

		return points.join(' ');
	}, [spring]);

	const disabled = previewServerState.type !== 'connected';
	const graphLabels = getEasingGraphLabels(getCurrentEasingUpdates());
	const currentEasing = useMemo(
		() =>
			mode === 'spring' ? serializeSpring(spring) : serializeBezier(bezier),
		[bezier, mode, spring],
	);
	const modeItems = useMemo((): SegmentedControlItem[] => {
		return [
			{
				key: 'bezier',
				label: 'Bezier',
				onClick: () => switchMode('bezier'),
				selected: mode === 'bezier',
			},
			{
				key: 'spring',
				label: 'Spring',
				onClick: () => switchMode('spring'),
				selected: mode === 'spring',
			},
		];
	}, [mode, switchMode]);
	const coordinatesGrid = useMemo(
		(): React.CSSProperties => ({
			...coordinatesGridBase,
			gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
			padding: '0 12px 12px',
		}),
		[],
	);
	const modeSwitcher = (
		<div style={segmentedControlWrapper}>
			<SegmentedControl items={modeItems} needsWrapping={false} />
		</div>
	);

	return (
		<div style={inlineContainer}>
			{renderHeader ? renderHeader(modeItems) : null}
			<div
				style={
					renderHeader ? inspectorPresetButtonsWrapper : presetButtonsWrapper
				}
			>
				{EDITOR_EASING_PRESETS.map((preset) => (
					<EasingPresetButton
						key={preset.id}
						currentEasing={currentEasing}
						disabled={disabled}
						onClick={applyPreset}
						preset={preset}
					/>
				))}
			</div>
			{mode === 'bezier' ? (
				<>
					<svg
						ref={svgRef}
						width={SVG_WIDTH}
						height={SVG_HEIGHT}
						viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
						style={svgStyle}
						aria-label="Bezier curve editor"
					>
						<EasingGraphScaffold labels={graphLabels} />
						<line
							x1={startPoint.x}
							y1={startPoint.y}
							x2={firstHandle.x}
							y2={firstHandle.y}
							stroke={WHITE_ALPHA_35}
							strokeWidth={1}
						/>
						<line
							x1={endPoint.x}
							y1={endPoint.y}
							x2={secondHandle.x}
							y2={secondHandle.y}
							stroke={WHITE_ALPHA_35}
							strokeWidth={1}
						/>
						<path d={bezierPath} fill="none" stroke={BLUE} strokeWidth={3} />
						<circle cx={startPoint.x} cy={startPoint.y} r={4} fill={WHITE} />
						<circle cx={endPoint.x} cy={endPoint.y} r={4} fill={WHITE} />
						<circle
							cx={firstHandle.x}
							cy={firstHandle.y}
							r={6}
							fill={WHITE}
							stroke={BLUE}
							strokeWidth={2}
							vectorEffect="non-scaling-stroke"
							pointerEvents={disabled ? 'none' : 'all'}
							cursor={activeHandle === 0 ? 'grabbing' : 'default'}
							onPointerDown={(event) => onHandlePointerDown(0, event)}
						/>
						<circle
							cx={secondHandle.x}
							cy={secondHandle.y}
							r={6}
							fill={WHITE}
							stroke={BLUE}
							strokeWidth={2}
							vectorEffect="non-scaling-stroke"
							pointerEvents={disabled ? 'none' : 'all'}
							cursor={activeHandle === 1 ? 'grabbing' : 'default'}
							onPointerDown={(event) => onHandlePointerDown(1, event)}
						/>
					</svg>
					{modeSwitcher}
					<div style={coordinatesGrid}>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>X1</div>
							<div style={coordinateInputWrapper}>
								<InputDragger
									type="number"
									value={bezier[0]}
									status="ok"
									onValueChange={(value) => setCoordinate(0, 'x', value, false)}
									onValueChangeEnd={(value) =>
										setCoordinate(0, 'x', value, true)
									}
									onTextChange={() => undefined}
									min={0}
									max={1}
									step={0.01}
									formatter={formatNumber}
									rightAlign={false}
									style={numberInputStyle}
									snapToStep={false}
									disabled={disabled}
								/>
							</div>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>Y1</div>
							<div style={coordinateInputWrapper}>
								<InputDragger
									type="number"
									value={bezier[1]}
									status="ok"
									onValueChange={(value) => setCoordinate(0, 'y', value, false)}
									onValueChangeEnd={(value) =>
										setCoordinate(0, 'y', value, true)
									}
									onTextChange={() => undefined}
									min={Y_MIN}
									max={Y_MAX}
									step={0.01}
									formatter={formatNumber}
									rightAlign={false}
									style={numberInputStyle}
									snapToStep={false}
									disabled={disabled}
								/>
							</div>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>X2</div>
							<div style={coordinateInputWrapper}>
								<InputDragger
									type="number"
									value={bezier[2]}
									status="ok"
									onValueChange={(value) => setCoordinate(1, 'x', value, false)}
									onValueChangeEnd={(value) =>
										setCoordinate(1, 'x', value, true)
									}
									onTextChange={() => undefined}
									min={0}
									max={1}
									step={0.01}
									formatter={formatNumber}
									rightAlign={false}
									style={numberInputStyle}
									snapToStep={false}
									disabled={disabled}
								/>
							</div>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>Y2</div>
							<div style={coordinateInputWrapper}>
								<InputDragger
									type="number"
									value={bezier[3]}
									status="ok"
									onValueChange={(value) => setCoordinate(1, 'y', value, false)}
									onValueChangeEnd={(value) =>
										setCoordinate(1, 'y', value, true)
									}
									onTextChange={() => undefined}
									min={Y_MIN}
									max={Y_MAX}
									step={0.01}
									formatter={formatNumber}
									rightAlign={false}
									style={numberInputStyle}
									snapToStep={false}
									disabled={disabled}
								/>
							</div>
						</div>
					</div>
				</>
			) : (
				<>
					<svg
						width={SVG_WIDTH}
						height={SVG_HEIGHT}
						viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
						style={svgStyle}
						aria-label="Spring easing curve"
					>
						<EasingGraphScaffold labels={graphLabels} />
						<path d={springPath} fill="none" stroke={BLUE} strokeWidth={3} />
						<circle cx={xToSvg(0)} cy={yToSvg(0)} r={4} fill={WHITE} />
						<circle cx={xToSvg(1)} cy={yToSvg(1)} r={4} fill={WHITE} />
					</svg>
					{modeSwitcher}
					<div style={coordinatesGrid}>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>Damping</div>
							<div style={coordinateInputWrapper}>
								<InputDragger
									type="number"
									value={spring.damping}
									status="ok"
									onValueChange={(value) =>
										setSpringNumber('damping', value, false)
									}
									onValueChangeEnd={(value) =>
										setSpringNumber('damping', value, true)
									}
									onTextChange={() => undefined}
									min={SPRING_LIMITS.damping.min}
									max={SPRING_LIMITS.damping.max}
									step={SPRING_LIMITS.damping.step}
									formatter={springFormatters.damping}
									rightAlign={false}
									style={numberInputStyle}
									snapToStep={false}
									dragDecimalPlaces={SPRING_DECIMAL_PLACES.damping}
									disabled={disabled}
								/>
							</div>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>Mass</div>
							<div style={coordinateInputWrapper}>
								<InputDragger
									type="number"
									value={spring.mass}
									status="ok"
									onValueChange={(value) =>
										setSpringNumber('mass', value, false)
									}
									onValueChangeEnd={(value) =>
										setSpringNumber('mass', value, true)
									}
									onTextChange={() => undefined}
									min={SPRING_LIMITS.mass.min}
									max={SPRING_LIMITS.mass.max}
									step={SPRING_LIMITS.mass.step}
									formatter={springFormatters.mass}
									rightAlign={false}
									style={numberInputStyle}
									snapToStep={false}
									dragDecimalPlaces={SPRING_DECIMAL_PLACES.mass}
									disabled={disabled}
								/>
							</div>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>Stiffness</div>
							<div style={coordinateInputWrapper}>
								<InputDragger
									type="number"
									value={spring.stiffness}
									status="ok"
									onValueChange={(value) =>
										setSpringNumber('stiffness', value, false)
									}
									onValueChangeEnd={(value) =>
										setSpringNumber('stiffness', value, true)
									}
									onTextChange={() => undefined}
									min={SPRING_LIMITS.stiffness.min}
									max={SPRING_LIMITS.stiffness.max}
									step={SPRING_LIMITS.stiffness.step}
									formatter={springFormatters.stiffness}
									rightAlign={false}
									style={numberInputStyle}
									snapToStep={false}
									dragDecimalPlaces={SPRING_DECIMAL_PLACES.stiffness}
									disabled={disabled}
								/>
							</div>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>Rest threshold</div>
							<div style={coordinateInputWrapper}>
								<InputDragger
									type="number"
									value={
										spring.durationRestThreshold ??
										DEFAULT_DURATION_REST_THRESHOLD
									}
									status="ok"
									onValueChange={(value) =>
										setSpringNumber('durationRestThreshold', value, false)
									}
									onValueChangeEnd={(value) =>
										setSpringNumber('durationRestThreshold', value, true)
									}
									onTextChange={() => undefined}
									min={SPRING_LIMITS.durationRestThreshold.min}
									max={SPRING_LIMITS.durationRestThreshold.max}
									step={SPRING_LIMITS.durationRestThreshold.step}
									formatter={springFormatters.durationRestThreshold}
									rightAlign={false}
									style={numberInputStyle}
									snapToStep={false}
									dragDecimalPlaces={
										SPRING_DECIMAL_PLACES.durationRestThreshold
									}
									disabled={disabled}
								/>
							</div>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>Clamp overshoot</div>
							<div style={checkboxWrapper}>
								<Checkbox
									checked={spring.overshootClamping}
									onChange={setOvershootClamping}
									name="spring-overshoot-clamping"
									disabled={disabled}
									variant="small"
								/>
							</div>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>Allow tail</div>
							<div style={checkboxWrapper}>
								<Checkbox
									checked={spring.allowTail ?? false}
									onChange={setAllowTail}
									name="spring-allow-tail"
									disabled={disabled}
									variant="small"
								/>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
