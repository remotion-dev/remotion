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
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';
import {Row, Spacing} from '../layout';
import {ModalButton} from '../ModalButton';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {DismissableModal} from '../NewComposition/DismissableModal';
import {InputDragger} from '../NewComposition/InputDragger';
import type {TimelineSelection} from './TimelineSelection';
import type {TimelineEasingValue} from './update-selected-easing';
import {updateSelectedTimelineEasings} from './update-selected-easing';

type CubicBezier = [number, number, number, number];
type HandleIndex = 0 | 1;
type Coordinate = 'x' | 'y';

const SVG_WIDTH = 560;
const SVG_HEIGHT = 320;
const PLOT_LEFT = 42;
const PLOT_TOP = 8;
const PLOT_WIDTH = 500;
const PLOT_HEIGHT = 304;
const Y_MIN = -2;
const Y_MAX = 3;
const LINEAR_BEZIER: CubicBezier = [0.25, 0.25, 0.75, 0.75];

const container: React.CSSProperties = {
	width: 600,
};

const coordinatesGrid: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
	gap: 10,
	marginTop: 12,
	padding: '0 16px 16px',
};

const coordinateRow: React.CSSProperties = {
	gap: 4,
};

const coordinateLabel: React.CSSProperties = {
	fontSize: 13,
	color: 'rgba(255, 255, 255, 0.72)',
	paddingLeft: 6,
};

const numberInputStyle: React.CSSProperties = {
	backgroundColor: INPUT_BACKGROUND,
	borderRadius: 4,
};

const svgStyle: React.CSSProperties = {
	display: 'block',
	width: '100%',
};

const hiddenSubmit: React.CSSProperties = {
	display: 'none',
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

const xToSvg = (value: number) => PLOT_LEFT + value * PLOT_WIDTH;
const yToSvg = (value: number) =>
	PLOT_TOP + ((Y_MAX - value) / (Y_MAX - Y_MIN)) * PLOT_HEIGHT;

const pointFromBezier = (bezier: CubicBezier, handle: HandleIndex) => {
	const x = handle === 0 ? bezier[0] : bezier[2];
	const y = handle === 0 ? bezier[1] : bezier[3];
	return {x: xToSvg(x), y: yToSvg(y)};
};

const startPoint = {x: xToSvg(0), y: yToSvg(0)};
const endPoint = {x: xToSvg(1), y: yToSvg(1)};

export type EasingEditorModalState = {
	type: 'easing-editor';
	initialEasing: TimelineEasingValue;
	selections: TimelineSelection[];
};

export const EasingEditorModal: React.FC<{
	readonly state: EasingEditorModalState;
}> = ({state}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const svgRef = useRef<SVGSVGElement>(null);
	const [bezier, setBezier] = useState(() =>
		easingToBezier(state.initialEasing),
	);
	const [saving, setSaving] = useState(false);
	const [activeHandle, setActiveHandle] = useState<HandleIndex | null>(null);

	const close = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const setCoordinate = useCallback(
		(handle: HandleIndex, coordinate: Coordinate, value: number) => {
			setBezier((previous) => {
				const next = [...previous] as CubicBezier;
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
				return next;
			});
		},
		[],
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

			setBezier((previous) => {
				const next = [...previous] as CubicBezier;
				if (handle === 0) {
					next[0] = value.x;
					next[1] = value.y;
				} else {
					next[2] = value.x;
					next[3] = value.y;
				}

				return next;
			});
		},
		[getValueFromPointer],
	);

	useEffect(() => {
		if (activeHandle === null) {
			return;
		}

		const onPointerMove = (event: PointerEvent) => {
			updateHandleFromPointer(activeHandle, event);
		};

		const onPointerUp = () => {
			setActiveHandle(null);
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp, {once: true});

		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		};
	}, [activeHandle, updateHandleFromPointer]);

	const onHandlePointerDown = useCallback(
		(handle: HandleIndex, event: React.PointerEvent<SVGCircleElement>) => {
			event.preventDefault();
			event.stopPropagation();
			setActiveHandle(handle);
			updateHandleFromPointer(handle, event);
		},
		[updateHandleFromPointer],
	);

	const onSave = useCallback(() => {
		if (previewServerState.type !== 'connected' || saving) {
			return;
		}

		setSaving(true);
		const promise = updateSelectedTimelineEasings({
			selections: state.selections,
			sequences: sequencesRef.current,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
			propStatuses: propStatusesRef.current,
			setPropStatuses,
			clientId: previewServerState.clientId,
			easing: serializeBezier(bezier),
		});

		if (promise === null) {
			setSaving(false);
			return;
		}

		promise.catch(() => undefined);
		close();
	}, [
		bezier,
		close,
		overrideIdToNodePathMappings,
		previewServerState,
		propStatusesRef,
		saving,
		sequencesRef,
		setPropStatuses,
		state.selections,
	]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
		(event) => {
			event.preventDefault();
			onSave();
		},
		[onSave],
	);

	const path = useMemo(() => {
		const curveFirstHandle = pointFromBezier(bezier, 0);
		const curveSecondHandle = pointFromBezier(bezier, 1);
		return `M ${startPoint.x} ${startPoint.y} C ${curveFirstHandle.x} ${curveFirstHandle.y}, ${curveSecondHandle.x} ${curveSecondHandle.y}, ${endPoint.x} ${endPoint.y}`;
	}, [bezier]);

	const firstHandle = pointFromBezier(bezier, 0);
	const secondHandle = pointFromBezier(bezier, 1);
	const yZero = yToSvg(0);
	const yOne = yToSvg(1);
	const saveDisabled = saving || previewServerState.type !== 'connected';

	return (
		<DismissableModal>
			<ModalHeader title="Edit easing" />
			<form onSubmit={onSubmit}>
				<div style={container}>
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
							pointerEvents="all"
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
							pointerEvents="all"
							cursor={activeHandle === 1 ? 'grabbing' : 'default'}
							onPointerDown={(event) => onHandlePointerDown(1, event)}
						/>
						<text
							x={PLOT_LEFT - 22}
							y={yZero + 3}
							fill={LIGHT_TEXT}
							fontSize={9}
						>
							0
						</text>
						<text
							x={PLOT_LEFT - 22}
							y={yOne + 3}
							fill={LIGHT_TEXT}
							fontSize={9}
						>
							1
						</text>
					</svg>
					<div style={coordinatesGrid}>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>X1</div>
							<InputDragger
								type="number"
								value={bezier[0]}
								status="ok"
								onValueChange={(value) => setCoordinate(0, 'x', value)}
								onValueChangeEnd={(value) => setCoordinate(0, 'x', value)}
								onTextChange={() => undefined}
								min={0}
								max={1}
								step={0.01}
								formatter={formatNumber}
								rightAlign={false}
								style={numberInputStyle}
								snapToStep={false}
							/>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>Y1</div>
							<InputDragger
								type="number"
								value={bezier[1]}
								status="ok"
								onValueChange={(value) => setCoordinate(0, 'y', value)}
								onValueChangeEnd={(value) => setCoordinate(0, 'y', value)}
								onTextChange={() => undefined}
								min={Y_MIN}
								max={Y_MAX}
								step={0.01}
								formatter={formatNumber}
								rightAlign={false}
								style={numberInputStyle}
								snapToStep={false}
							/>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>X2</div>
							<InputDragger
								type="number"
								value={bezier[2]}
								status="ok"
								onValueChange={(value) => setCoordinate(1, 'x', value)}
								onValueChangeEnd={(value) => setCoordinate(1, 'x', value)}
								onTextChange={() => undefined}
								min={0}
								max={1}
								step={0.01}
								formatter={formatNumber}
								rightAlign={false}
								style={numberInputStyle}
								snapToStep={false}
							/>
						</div>
						<div style={coordinateRow}>
							<div style={coordinateLabel}>Y2</div>
							<InputDragger
								type="number"
								value={bezier[3]}
								status="ok"
								onValueChange={(value) => setCoordinate(1, 'y', value)}
								onValueChangeEnd={(value) => setCoordinate(1, 'y', value)}
								onTextChange={() => undefined}
								min={Y_MIN}
								max={Y_MAX}
								step={0.01}
								formatter={formatNumber}
								rightAlign={false}
								style={numberInputStyle}
								snapToStep={false}
							/>
						</div>
					</div>
				</div>
				<ModalFooterContainer>
					<Row justify="flex-end" align="center">
						<Button onClick={close}>Discard</Button>
						<Spacing x={1} />
						<ModalButton onClick={onSave} disabled={saveDisabled}>
							Save
						</ModalButton>
					</Row>
				</ModalFooterContainer>
				<button
					type="submit"
					style={hiddenSubmit}
					disabled={saveDisabled}
					aria-hidden
					tabIndex={-1}
				/>
			</form>
		</DismissableModal>
	);
};
