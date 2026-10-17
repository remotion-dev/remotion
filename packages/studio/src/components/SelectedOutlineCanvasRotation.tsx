import React, {useContext} from 'react';
import {Internals} from 'remotion';
import {TRANSPARENT} from '../helpers/colors';
import {isMac} from '../helpers/is-mac';
import {EditorSnappingContext} from '../state/editor-snapping';
import {canvasRotationCursor} from './canvas-rotation-cursor';
import type {SelectedOutline} from './selected-outline-geometry';
import {getRotationCursor} from './selected-outline-measurement';
import type {
	SelectedOutlineLayoutTarget,
	SelectedOutlineTarget,
} from './selected-outline-types';
import {startSelectedOutlineCanvasRotation} from './start-selected-outline-canvas-rotation';

const canvas2DRotationCursor = getRotationCursor(0);

export const SelectedOutlineCanvasRotation: React.FC<{
	readonly getLatestTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly layoutTarget: SelectedOutlineLayoutTarget;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly outline: SelectedOutline;
	readonly transform3DMode: boolean;
}> = ({
	getLatestTargetByKey,
	layoutTarget,
	onDraggingChange,
	outline,
	transform3DMode,
}) => {
	const dragOverridesRef = useContext(
		Internals.VisualModeDragOverridesRefContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {editorSnapping} = useContext(EditorSnappingContext);
	const [commandKeyPressed, setCommandKeyPressed] = React.useState(false);
	const cursor = transform3DMode
		? canvasRotationCursor
		: canvas2DRotationCursor;

	React.useEffect(() => {
		const commandKey = isMac ? 'Meta' : 'Control';
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === commandKey) {
				setCommandKeyPressed(true);
			}
		};

		const onKeyUp = (event: KeyboardEvent) => {
			if (event.key === commandKey) {
				setCommandKeyPressed(false);
			}
		};

		const onBlur = () => {
			setCommandKeyPressed(false);
		};

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		window.addEventListener('blur', onBlur);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			window.removeEventListener('blur', onBlur);
		};
	}, []);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGPathElement>) => {
			if (event.button !== 0) {
				return;
			}

			const target = getLatestTargetByKey(layoutTarget.key);
			const rotationDrag = target?.rotationDrag ?? null;
			if (rotationDrag === null || !target?.selectedForRotation) {
				return;
			}

			startSelectedOutlineCanvasRotation({
				event,
				outline,
				rotationDrag,
				editorSnapping,
				getDragOverrides: dragOverridesRef.current.getDragOverrides,
				setDragOverrides,
				clearDragOverrides,
				setPropStatuses,
				onDraggingChange,
			});
		},
		[
			clearDragOverrides,
			editorSnapping,
			dragOverridesRef,
			getLatestTargetByKey,
			layoutTarget.key,
			onDraggingChange,
			outline,
			setDragOverrides,
			setPropStatuses,
		],
	);
	return (
		<polygon
			points={outline.points.map((point) => `${point.x},${point.y}`).join(' ')}
			fill={TRANSPARENT}
			pointerEvents={commandKeyPressed ? 'none' : 'all'}
			cursor={commandKeyPressed ? 'default' : cursor}
			onPointerDown={onPointerDown}
			data-remotion-studio-canvas-rotation
		/>
	);
};
