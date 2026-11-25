import React from 'react';
import {formatFileLocation} from '../helpers/format-file-location';
import type {ModalState} from '../state/modals';
import {CodeChangeModal} from './CodeChangeModal';
import {getCreateEffectResult} from './effect-picker-search';

export const CreateEffectModal: React.FC<{
	readonly state: Extract<ModalState, {type: 'create-effect'}>;
}> = ({state}) => {
	const location = formatFileLocation({
		location: state.location,
		root: window.remotion_cwd,
	});
	const {name, label, description} = getCreateEffectResult(state.query);
	const instruction = state.query
		? `implement "${state.query}" as ${name ? `${name}()` : 'a custom effect'}`
		: 'create a custom effect';
	const layer = state.displayName
		? `the "${state.displayName}" layer`
		: 'the selected layer';

	return (
		<CodeChangeModal
			title={label}
			description={description}
			prompt={`Use createEffect() from remotion to ${instruction} and apply it to ${layer}${location ? ` at ${location}` : ''}.`}
			skillId="remotion-markup"
			sources={[]}
			sourceStatus={null}
		/>
	);
};
