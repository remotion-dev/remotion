import React, {useCallback, useContext} from 'react';
import {BLUE} from '../helpers/colors';
import {EditorShowGuidesContext} from '../state/editor-guides';
import {EditorShowRulersContext} from '../state/editor-rulers';
import {ControlButton} from './ControlButton';

export const RulersAndGuidesToggle: React.FC<{
	readonly showGuides: boolean;
}> = ({showGuides}) => {
	const {editorShowGuides, setEditorShowGuides} = useContext(
		EditorShowGuidesContext,
	);
	const {editorShowRulers, setEditorShowRulers} = useContext(
		EditorShowRulersContext,
	);
	const rulersOrGuidesAreVisible =
		editorShowRulers || (showGuides && editorShowGuides);

	const onClick = useCallback(() => {
		setEditorShowRulers(() => !rulersOrGuidesAreVisible);
		if (showGuides) {
			setEditorShowGuides(() => !rulersOrGuidesAreVisible);
		}
	}, [
		rulersOrGuidesAreVisible,
		setEditorShowGuides,
		setEditorShowRulers,
		showGuides,
	]);

	const accessibilityLabel = showGuides
		? rulersOrGuidesAreVisible
			? 'Hide rulers and guides'
			: 'Show rulers and guides'
		: editorShowRulers
			? 'Hide rulers'
			: 'Show rulers';

	return (
		<ControlButton
			title={accessibilityLabel}
			aria-label={accessibilityLabel}
			aria-pressed={rulersOrGuidesAreVisible}
			onClick={onClick}
		>
			{(color) => (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 576 512"
					style={{width: 18, height: 18}}
					aria-hidden="true"
					focusable="false"
				>
					<path
						fill={rulersOrGuidesAreVisible ? BLUE : color}
						d="M525.9 154.2L186.5 493.6c-6.2 6.2-16.4 6.2-22.6 0L50.7 380.5c-6.2-6.2-6.2-16.4 0-22.6l33.9-33.9 56.6 56.6c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-56.6-56.6 39.6-39.6 33.9 33.9c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-33.9-33.9 39.6-39.6 56.6 56.6c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-56.6-56.6 39.6-39.6 33.9 33.9c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-33.9-33.9 39.6-39.6 56.6 56.6c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-56.6-56.6 33.9-33.9c6.2-6.2 16.4-6.2 22.6 0L525.9 131.5c6.2 6.2 6.2 16.4 0 22.6zM73.3 289.9L28.1 335.2c-18.7 18.7-18.7 49.1 0 67.9L141.2 516.2c18.7 18.7 49.1 18.7 67.9 0L548.5 176.8c18.7-18.7 18.7-49.1 0-67.9L435.4-4.2C416.6-23 386.2-23 367.5-4.2 77.1 286.2 140.3 223 73.3 289.9z"
					/>
				</svg>
			)}
		</ControlButton>
	);
};
