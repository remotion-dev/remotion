import React, {useSyncExternalStore} from 'react';
import {Internals} from 'remotion';
import {BACKGROUND, WHITE} from '../helpers/colors';
import {PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR} from './Timeline/should-clear-selection-on-pointer-down';

const MODES = [
	{mode: 'translate', label: 'Move'},
	{mode: 'rotate', label: 'Rotate'},
	{mode: 'scale', label: 'Scale'},
] as const;

export const ThreeEditorToolbar: React.FC = () => {
	const editor = useSyncExternalStore(
		Internals.ThreeEditorStore.subscribe,
		Internals.ThreeEditorStore.getSnapshot,
	);
	if (
		editor.selectedSequenceId === null ||
		!editor.registeredSequenceIds.includes(editor.selectedSequenceId) ||
		editor.availableModes.length === 0
	) {
		return null;
	}

	return (
		<div
			{...{[PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR]: 'true'}}
			style={{
				position: 'absolute',
				right: 16,
				bottom: 16,
				display: 'flex',
				gap: 4,
				padding: 4,
				borderRadius: 6,
				background: BACKGROUND,
				zIndex: 20,
			}}
		>
			{MODES.filter(({mode}) => editor.availableModes.includes(mode)).map(
				({mode, label}) => (
					<button
						key={mode}
						type="button"
						aria-label={`${label} 3D group`}
						aria-pressed={editor.mode === mode}
						onClick={() => Internals.ThreeEditorStore.setMode(mode)}
						style={{
							border: 0,
							borderRadius: 4,
							padding: '6px 9px',
							background: editor.mode === mode ? '#2274e0' : 'transparent',
							color: WHITE,
							cursor: 'pointer',
						}}
					>
						{label}
					</button>
				),
			)}
		</div>
	);
};
