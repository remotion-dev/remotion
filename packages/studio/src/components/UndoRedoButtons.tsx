import type {EventSourceEvent} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import {cmdOrCtrlCharacter} from '../error-overlay/remotion-overlay/ShortcutHint';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {WHITE_ALPHA_80} from '../helpers/colors';
import {isMac} from '../helpers/is-mac';
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

		const redoWithShiftZ = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'z',
			commandCtrlKey: true,
			callback: (e) => {
				if (!e.shiftKey) {
					return;
				}

				if (redoFile) {
					onRedo();
				}
			},
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const redoWithY = isMac
			? null
			: keybindings.registerKeybinding({
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
			redoWithShiftZ.unregister();
			redoWithY?.unregister();
		};
	}, [keybindings, onRedo, onUndo, redoFile, undoFile]);

	const undoTooltip = areKeyboardShortcutsDisabled()
		? 'Undo'
		: `Undo (${cmdOrCtrlCharacter}+Z)`;

	const redoTooltip = areKeyboardShortcutsDisabled()
		? 'Redo'
		: isMac
			? `Redo (${cmdOrCtrlCharacter}+Shift+Z)`
			: `Redo (${cmdOrCtrlCharacter}+Y)`;

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
