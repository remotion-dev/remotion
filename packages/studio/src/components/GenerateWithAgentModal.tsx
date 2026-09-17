import React from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {formatFileLocation} from '../helpers/format-file-location';
import type {ModalState} from '../state/modals';
import {AgentPrompt} from './AgentPrompt';
import {getMaxModalHeight, getMaxModalWidth} from './ModalContainer';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	display: 'flex',
	flexDirection: 'column',
	maxHeight: getMaxModalHeight(800),
	minWidth: 0,
	overflow: 'hidden',
	width: getMaxModalWidth(560),
};
const container: React.CSSProperties = {padding: 16};
const text: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	marginBottom: 16,
};

type State = Extract<ModalState, {type: 'generate-with-agent'}>;

export const GenerateWithAgentModal: React.FC<{readonly state: State}> = ({
	state,
}) => {
	const location = formatFileLocation({
		location: state.location,
		root: window.remotion_cwd,
	});

	return (
		<DismissableModal panelStyle={panelStyle}>
			<ModalHeader title="Generate with agent" />
			<div style={container}>
				<div style={text}>
					Ask a coding agent to generate content in this composition.
				</div>
				<AgentPrompt
					availableText="Start your prompt with:"
					promptDetails={location ? ` ${location}` : ''}
					skillId="remotion-markup"
				/>
			</div>
		</DismissableModal>
	);
};
