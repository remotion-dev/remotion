import React from 'react';
import {formatFileLocation} from '../helpers/format-file-location';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import type {ModalState} from '../state/modals';
import {CodeChangeModal} from './CodeChangeModal';

type State = Extract<ModalState, {type: 'wrap-refactor' | 'unwrap-refactor'}>;

export const WrapperRefactorModal: React.FC<{readonly state: State}> = ({
	state,
}) => {
	const location =
		formatFileLocation({location: state.location, root: window.remotion_cwd}) ??
		state.location.source;
	const target = state.displayName
		? `${state.displayName} (${location})`
		: location;
	const wrapperImportPath =
		state.type === 'wrap-refactor' && state.wrapper === 'HtmlInCanvasMotionBlur'
			? '@remotion/motion-blur'
			: 'remotion';
	const source = resolvedStackToSymbolicated({...state.location, column: null});
	return (
		<CodeChangeModal
			title={state.type === 'unwrap-refactor' ? 'Unwrap item' : 'Wrap item'}
			description={
				state.type === 'unwrap-refactor'
					? 'Studio could not automatically remove this wrapper. Remove it in code while keeping its children, or ask an agent to do it.'
					: `Studio could not automatically wrap this item in <${state.wrapper}>. Edit the code or ask an agent to do it.`
			}
			prompt={
				state.type === 'unwrap-refactor'
					? `Unwrap ${target}: remove the wrapper and keep its children.`
					: `Wrap ${target} in <${state.wrapper}> from '${wrapperImportPath}'.`
			}
			skillId="remotion-markup"
			sources={source ? [source] : []}
			sourceStatus={null}
		/>
	);
};
