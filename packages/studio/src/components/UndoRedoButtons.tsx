import type {EventSourceEvent} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {WHITE_ALPHA_80} from '../helpers/colors';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {useKeyboardShortcutLabel} from '../helpers/use-keyboard-shortcut-label';
import {RedoIcon} from '../icons/redo';
import {UndoIcon} from '../icons/undo';
import {callApi} from './call-api';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';

const iconStyle: React.CSSProperties = {
	width: 14,
	height: 14,
};

export const UndoRedoButtons: React.FC = () => {
	const [undoFile, setUndoFile] = useState<string | null>(null);
	const [redoFile, setRedoFile] = useState<string | null>(null);
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const keybindings = useKeybinding();
	const undoInFlight = useRef(false);
	const redoInFlight = useRef(false);

	useEffect(() => {
		const unsub = subscribeToEvent(
			'undo-redo-stack-changed',
			(event: EventSourceEvent) => {
				if (event.type !== 'undo-redo-stack-changed') {
					return;
				}

				setUndoFile(event.undoFile);
				setRedoFile(event.redoFile);
			},
		);

		return () => unsub();
	}, [subscribeToEvent]);

	const onUndo = useCallback(() => {
		if (undoInFlight.current) {
			return;
		}

		undoInFlight.current = true;
		const browserStudioOperations = getBrowserStudioOperations();
		const promise = browserStudioOperations
			? browserStudioOperations.undo()
			: callApi('/api/undo', {});
		promise
			.catch(() => {
				// Ignore errors
			})
			.finally(() => {
				undoInFlight.current = false;
			});
	}, []);

	const onRedo = useCallback(() => {
		if (redoInFlight.current) {
			return;
		}

		redoInFlight.current = true;
		const browserStudioOperations = getBrowserStudioOperations();
		const promise = browserStudioOperations
			? browserStudioOperations.redo()
			: callApi('/api/redo', {});
		promise
			.catch(() => {
				// Ignore errors
			})
			.finally(() => {
				redoInFlight.current = false;
			});
	}, []);

	useEffect(() => {
		// Visual controls such as the color picker commit edits while their popup
		// remains open. Keep undo and redo available in that higher z-index context.
		const undo = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'undo',
			callback: () => {
				if (undoFile) {
					onUndo();
				}
			},
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: true,
		});

		const redo = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'redo',
			callback: () => {
				if (redoFile) {
					onRedo();
				}
			},
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: true,
		});

		return () => {
			undo.unregister();
			redo.unregister();
		};
	}, [keybindings, onRedo, onUndo, redoFile, undoFile]);

	const undoShortcut = useKeyboardShortcutLabel('undo');
	const redoShortcut = useKeyboardShortcutLabel('redo');
	const undoTooltip =
		areKeyboardShortcutsDisabled() || undoShortcut === ''
			? 'Undo'
			: `Undo (${undoShortcut})`;

	const redoTooltip =
		areKeyboardShortcutsDisabled() || redoShortcut === ''
			? 'Redo'
			: `Redo (${redoShortcut})`;

	const renderUndo: RenderInlineAction = useCallback((color) => {
		return <UndoIcon style={iconStyle} color={color} />;
	}, []);

	const renderRedo: RenderInlineAction = useCallback((color) => {
		return <RedoIcon style={iconStyle} color={color} />;
	}, []);

	const canUndo = undoFile !== null;
	const canRedo = redoFile !== null;

	if (!canUndo && !canRedo) {
		return null;
	}

	return (
		<>
			<InlineAction
				variant={null}
				onClick={onUndo}
				renderAction={renderUndo}
				title={undoTooltip}
				disabled={!canUndo}
				unhoveredColor={WHITE_ALPHA_80}
			/>
			<InlineAction
				variant={null}
				onClick={onRedo}
				renderAction={renderRedo}
				title={redoTooltip}
				disabled={!canRedo}
				unhoveredColor={WHITE_ALPHA_80}
			/>
		</>
	);
};
