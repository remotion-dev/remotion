import type {CompositionOrFolder} from '@remotion/studio-shared';
import React from 'react';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import type {ModalState} from '../state/modals';
import {CodeChangeModal} from './CodeChangeModal';

type State = Extract<ModalState, {type: 'reorder-composition'}>;

const describeItem = (item: CompositionOrFolder): string => {
	return item.type === 'composition'
		? `composition "${item.compositionId}"`
		: `folder "${[item.parentName, item.folderName].filter(Boolean).join('/')}"`;
};

export const ReorderCompositionModal: React.FC<{readonly state: State}> = ({
	state,
}) => {
	const target =
		state.destination.type === 'root'
			? 'to the root of the composition list'
			: state.destination.type === 'folder'
				? `into ${describeItem({type: 'folder', folderName: state.destination.folderName, parentName: state.destination.parentName})}`
				: `${state.destination.type} ${describeItem(state.destination.target)}`;
	const files = [...new Set([state.sourceFile, state.destinationFile])].filter(
		(file): file is string => file !== null,
	);
	const sources = state.sourceLocations.flatMap((location) => {
		const source = resolvedStackToSymbolicated(location);
		return source ? [source] : [];
	});

	return (
		<CodeChangeModal
			title="Reorder compositions"
			description={`Studio could not automatically move ${describeItem(state.item)} ${target}. Reorder the registrations in code, or ask an agent to do it.`}
			prompt={`Move ${describeItem(state.item)} ${target} in the Remotion composition list. Update the registration order in code, preserving composition definitions and behavior.${files.length > 0 ? ` The involved registrations are in: ${files.join(', ')}.` : ''}`}
			skillId="remotion-markup"
			sources={sources}
			sourceStatus={
				sources.length === 0
					? 'Could not resolve the registration source location.'
					: null
			}
		/>
	);
};
