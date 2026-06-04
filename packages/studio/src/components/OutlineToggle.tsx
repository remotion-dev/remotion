import React, {useCallback, useContext} from 'react';
import {BLUE} from '../helpers/colors';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {ControlButton} from './ControlButton';

const size = 3;

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
				viewBox="0 0 20 20"
				style={{width: 18, height: 18}}
				aria-hidden="true"
				focusable="false"
			>
				<path d="M5 5H15V15H5Z" fill="none" stroke={color} strokeWidth={1.8} />
				<rect x={3.5} y={3.5} width={size} height={size} fill={color} />
				<rect x={13.5} y={3.5} width={size} height={size} fill={color} />
				<rect x={13.5} y={13.5} width={size} height={size} fill={color} />
				<rect x={3.5} y={13.5} width={size} height={size} fill={color} />
			</svg>
		</ControlButton>
	);
};
