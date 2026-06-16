import type {EventSourceEvent} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import {cmdOrCtrlCharacter} from '../error-overlay/remotion-overlay/ShortcutHint';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {RedoIcon} from '../icons/redo';
import {UndoIcon} from '../icons/undo';
import {callApi} from './call-api';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';

const iconStyle: React.CSSProperties = {
	width: 16,
	height: 16,
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
		callApi('/api/undo', {})
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
		callApi('/api/redo', {})
			.catch(() => {
				// Ignore errors
			})
			.finally(() => {
				redoInFlight.current = false;
			});
	}, []);

	useEffect(() => {
		const undo = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'z',
			commandCtrlKey: true,
			callback: (e) => {
				if (e.shiftKey) {
					return;
				}

				if (undoFile) {
					onUndo();
				}
			},
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const redo = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'y',
			commandCtrlKey: true,
			callback: () => {
				if (redoFile) {
					onRedo();
				}
			},
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			undo.unregister();
			redo.unregister();
		};
	}, [keybindings, onRedo, onUndo, redoFile, undoFile]);

	const undoTooltip = areKeyboardShortcutsDisabled()
		? 'Undo'
		: `Undo (${cmdOrCtrlCharacter}+Z)`;

	const redoTooltip = areKeyboardShortcutsDisabled()
		? 'Redo'
		: `Redo (${cmdOrCtrlCharacter}+Y)`;

	const renderUndo: RenderInlineAction = useCallback(
		(color) => {
			return (
				<UndoIcon style={{...iconStyle, color, opacity: undoFile ? 1 : 0.5}} />
			);
		},
		[undoFile],
	);

	const renderRedo: RenderInlineAction = useCallback(
		(color) => {
			return (
				<RedoIcon style={{...iconStyle, color, opacity: redoFile ? 1 : 0.5}} />
			);
		},
		[redoFile],
	);

	const canUndo = undoFile !== null;
	const canRedo = redoFile !== null;

	if (!canUndo && !canRedo) {
		return null;
	}

	return (
		<>
			<InlineAction
				onClick={onUndo}
				renderAction={renderUndo}
				title={undoTooltip}
				disabled={!canUndo}
			/>
			<InlineAction
				onClick={onRedo}
				renderAction={renderRedo}
				title={redoTooltip}
				disabled={!canRedo}
			/>
		</>
	);
};
