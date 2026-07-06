import React, {useCallback, useContext} from 'react';
import {BLUE, WHITE} from '../helpers/colors';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {ControlButton} from './ControlButton';

export const OutlineToggle: React.FC = () => {
	const {editorShowOutlines, setEditorShowOutlines} = useContext(
		EditorShowOutlinesContext,
	);

	const onClick = useCallback(() => {
		setEditorShowOutlines((current) => !current);
	}, [setEditorShowOutlines]);

	const color = editorShowOutlines ? BLUE : WHITE;
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
				<path d="M32 119.4C12.9 108.4 0 87.7 0 64 0 28.7 28.7 0 64 0 87.7 0 108.4 12.9 119.4 32l273.1 0c11.1-19.1 31.7-32 55.4-32 35.3 0 64 28.7 64 64 0 23.7-12.9 44.4-32 55.4l0 273.1c19.1 11.1 32 31.7 32 55.4 0 35.3-28.7 64-64 64-23.7 0-44.4-12.9-55.4-32l-273.1 0c-11.1 19.1-31.7 32-55.4 32-35.3 0-64-28.7-64-64 0-23.7 12.9-44.4 32-55.4l0-273.1zm64 0l0 273.1c9.7 5.6 17.8 13.7 23.4 23.4l273.1 0c5.6-9.7 13.7-17.8 23.4-23.4l0-273.1c-9.7-5.6-17.8-13.7-23.4-23.4L119.4 96c-5.6 9.7-13.7 17.8-23.4 23.4z" />
			</svg>
		</ControlButton>
	);
};
