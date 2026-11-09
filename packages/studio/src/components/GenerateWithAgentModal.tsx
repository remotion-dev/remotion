import React from 'react';
import {formatFileLocation} from '../helpers/format-file-location';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import type {ModalState} from '../state/modals';
import {CodeChangeModal} from './CodeChangeModal';

type State = Extract<ModalState, {type: 'generate-with-agent'}>;

export const GenerateWithAgentModal: React.FC<{readonly state: State}> = ({
	state,
}) => {
	const location = formatFileLocation({
		location: state.location,
		root: window.remotion_cwd,
	});
	const source = state.location
		? resolvedStackToSymbolicated({...state.location, column: null})
		: null;
	return (
		<CodeChangeModal
			title="Generate with agent"
			description="Ask a coding agent to generate content in this composition."
			prompt={`Generate content in this composition${location ? ` at ${location}` : ''}.`}
			skillId="remotion-markup"
			sources={source ? [source] : []}
			sourceStatus={null}
		/>
	);
};
