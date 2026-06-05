import React, {useCallback, useContext} from 'react';
import {BLUE} from '../helpers/colors';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {ControlButton} from './ControlButton';

export const OutlineToggle: React.FC = () => {
	const {editorShowOutlines, setEditorShowOutlines} = useContext(
		EditorShowOutlinesContext,
	);

	const onClick = useCallback(() => {
		setEditorShowOutlines((current) => !current);
	}, [setEditorShowOutlines]);

	const color = editorShowOutlines ? BLUE : 'white';
	const accessibilityLabel = editorShowOutlines
		? 'Hide outlines'
		: 'Show outlines';

	return (
		<ControlButton
			title={accessibilityLabel}
			aria-label={accessibilityLabel}
			onClick={onClick}
		>
			<svg
				style={{width: 18, height: 18}}
				viewBox="0 0 512 512"
				fill={color}
				aria-hidden="true"
				focusable="false"
			>
				<path d="M384 0l128 0 0 128-32 0 0 256 32 0 0 128-128 0 0-32-256 0 0 32-128 0 0-128 32 0 0-256-32 0 0-128 128 0 0 32 256 0 0-32zM96 128l0 256 32 0 0 32 256 0 0-32 32 0 0-256-32 0 0-32-256 0 0 32-32 0z" />
			</svg>
		</ControlButton>
	);
};
