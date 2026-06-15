import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	BLUE,
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_HOVERED,
	LIGHT_TEXT,
} from '../../helpers/colors';
import {InputDragger} from '../NewComposition/InputDragger';
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

type CubicBezier = [number, number, number, number];
type HandleIndex = 0 | 1;
type Coordinate = 'x' | 'y';

const SVG_WIDTH = 560;
const SVG_HEIGHT = 320;
const PLOT_LEFT = 42;
const PLOT_TOP = 0;
const PLOT_WIDTH = 500;
const PLOT_HEIGHT = SVG_HEIGHT;
const Y_MIN = -2;
const Y_MAX = 3;
const LINEAR_BEZIER: CubicBezier = [0.25, 0.25, 0.75, 0.75];

const inlineContainer: React.CSSProperties = {
	width: '100%',
	minWidth: 0,
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
	color: 'rgba(255, 255, 255, 0.72)',
	paddingLeft: 6,
};

const coordinateInputWrapper: React.CSSProperties = {
	height: 34,
	display: 'flex',
	alignItems: 'center',
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

const sanitizeBezier = (bezier: CubicBezier): CubicBezier => [
	clamp(bezier[0], 0, 1),
	clamp(bezier[1], Y_MIN, Y_MAX),
	clamp(bezier[2], 0, 1),
	clamp(bezier[3], Y_MIN, Y_MAX),
];

const easingToBezier = (easing: TimelineEasingValue): CubicBezier => {
	return easing === 'linear' ? LINEAR_BEZIER : sanitizeBezier(easing);
};

const roundCoordinate = (value: number) => Math.round(value * 10000) / 10000;

const serializeBezier = (bezier: CubicBezier): TimelineEasingValue => {
	const rounded = sanitizeBezier(bezier).map(roundCoordinate) as CubicBezier;
	if (rounded[0] === rounded[1] && rounded[2] === rounded[3]) {
		return 'linear';
	}

	return rounded;
};

const formatNumber = (value: number | string) => {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) {
		return String(value);
	}

	return String(roundCoordinate(numericValue));
};

const areEasingsEqual = (
	first: TimelineEasingValue,
	second: TimelineEasingValue,
) => {
	if (first === second) {
		return true;
	}

	if (first === 'linear' || second === 'linear') {
		return false;
	}

	return first.every((value, index) => value === second[index]);
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

const xToSvg = (value: number) => PLOT_LEFT + value * PLOT_WIDTH;
const yToSvg = (value: number) =>
	PLOT_TOP + ((Y_MAX - value) / (Y_MAX - Y_MIN)) * PLOT_HEIGHT;

const pointFromBezier = (bezier: CubicBezier, handle: HandleIndex) => {
	const x = handle === 0 ? bezier[0] : bezier[2];
	const y = handle === 0 ? bezier[1] : bezier[3];
	return {x: xToSvg(x), y: yToSvg(y)};
};

export type EasingEditorState = {
	initialEasing: TimelineEasingValue;
	selections: TimelineSelection[];
};

export const EasingEditor: React.FC<{
	readonly state: EasingEditorState;
}> = ({state}) => {
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
	const [bezier, setBezier] = useState(() =>
		easingToBezier(state.initialEasing),
	);
	const bezierRef = useRef(bezier);
	const liveOverrideVersionRef = useRef(0);
	const pendingOverrideTargetsRef = useRef<SelectedEasingUpdate[]>([]);
	const [activeHandle, setActiveHandle] = useState<HandleIndex | null>(null);

	useEffect(() => {
		const nextBezier = easingToBezier(state.initialEasing);
		bezierRef.current = nextBezier;
		setBezier(nextBezier);
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
		(nextBezier: CubicBezier) => {
			const sanitized = sanitizeBezier(nextBezier);
			bezierRef.current = sanitized;
			setBezier(sanitized);
			return applyLiveEasing(serializeBezier(sanitized));
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
			const next = [...bezierRef.current] as CubicBezier;
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

			const next = [...bezierRef.current] as CubicBezier;
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
	const path = useMemo(() => {
		return `M ${startPoint.x} ${startPoint.y} C ${firstHandle.x} ${firstHandle.y}, ${secondHandle.x} ${secondHandle.y}, ${endPoint.x} ${endPoint.y}`;
	}, [endPoint, firstHandle, secondHandle, startPoint]);

	const yZero = yToSvg(0);
	const yOne = yToSvg(1);
	const yZeroLabel = clamp(yZero + 3, 10, SVG_HEIGHT - 4);
	const yOneLabel = clamp(yOne + 3, 10, SVG_HEIGHT - 4);
	const disabled = previewServerState.type !== 'connected';
	const coordinatesGrid = useMemo(
		(): React.CSSProperties => ({
			...coordinatesGridBase,
			gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
			padding: '0 12px 12px',
		}),
		[],
	);

	return (
		<div style={inlineContainer}>
			<svg
				ref={svgRef}
				width={SVG_WIDTH}
				height={SVG_HEIGHT}
				viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
				style={svgStyle}
				aria-label="Bezier curve editor"
			>
				<line
					x1={PLOT_LEFT}
					y1={yZero}
					x2={PLOT_LEFT + PLOT_WIDTH}
					y2={yZero}
					stroke={INPUT_BORDER_COLOR_HOVERED}
					strokeWidth={1}
				/>
				<line
					x1={PLOT_LEFT}
					y1={yOne}
					x2={PLOT_LEFT + PLOT_WIDTH}
					y2={yOne}
					stroke={INPUT_BORDER_COLOR_HOVERED}
					strokeWidth={1}
				/>

				<line
					x1={startPoint.x}
					y1={startPoint.y}
					x2={firstHandle.x}
					y2={firstHandle.y}
					stroke="rgba(255, 255, 255, 0.35)"
					strokeWidth={1}
				/>
				<line
					x1={endPoint.x}
					y1={endPoint.y}
					x2={secondHandle.x}
					y2={secondHandle.y}
					stroke="rgba(255, 255, 255, 0.35)"
					strokeWidth={1}
				/>
				<path d={path} fill="none" stroke={BLUE} strokeWidth={3} />
				<circle cx={startPoint.x} cy={startPoint.y} r={4} fill="white" />
				<circle cx={endPoint.x} cy={endPoint.y} r={4} fill="white" />
				<circle
					cx={firstHandle.x}
					cy={firstHandle.y}
					r={6}
					fill="white"
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
					fill="white"
					stroke={BLUE}
					strokeWidth={2}
					vectorEffect="non-scaling-stroke"
					pointerEvents={disabled ? 'none' : 'all'}
					cursor={activeHandle === 1 ? 'grabbing' : 'default'}
					onPointerDown={(event) => onHandlePointerDown(1, event)}
				/>
				<text x={PLOT_LEFT - 22} y={yZeroLabel} fill={LIGHT_TEXT} fontSize={9}>
					0
				</text>
				<text x={PLOT_LEFT - 22} y={yOneLabel} fill={LIGHT_TEXT} fontSize={9}>
					1
				</text>
			</svg>
			<div style={coordinatesGrid}>
				<div style={coordinateRow}>
					<div style={coordinateLabel}>X1</div>
					<div style={coordinateInputWrapper}>
						<InputDragger
							type="number"
							value={bezier[0]}
							status="ok"
							onValueChange={(value) => setCoordinate(0, 'x', value, false)}
							onValueChangeEnd={(value) => setCoordinate(0, 'x', value, true)}
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
							onValueChangeEnd={(value) => setCoordinate(0, 'y', value, true)}
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
							onValueChangeEnd={(value) => setCoordinate(1, 'x', value, true)}
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
							onValueChangeEnd={(value) => setCoordinate(1, 'y', value, true)}
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
		</div>
	);
};
