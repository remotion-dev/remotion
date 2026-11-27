import React, {useContext} from 'react';
import {Internals} from 'remotion';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import type {ModalState} from '../state/modals';
import {CodeChangeModal} from './CodeChangeModal';
import {
	getCachedResolvedStack,
	hasResolvedStack,
	useResolvedStack,
} from './Timeline/use-resolved-stack';

type FixDefaultPropsModalState = Extract<
	ModalState,
	{type: 'fix-default-props'}
>;

export const FixDefaultPropsModal: React.FC<{
	readonly state: FixDefaultPropsModalState;
}> = ({state}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const stack =
		compositions.find((c) => c.id === state.compositionId)?.stack ?? null;
	useResolvedStack(stack);
	const source = resolvedStackToSymbolicated(getCachedResolvedStack(stack));
	const location = source
		? ` at ${source.originalFileName}:${source.originalLineNumber}`
		: '';

	return (
		<CodeChangeModal
			title="Fix default props"
			description={`${state.reason}. The Studio saves default props by editing the <Composition> in a TypeScript file, so its id needs to be a string literal and defaultProps an inline object literal. Edit the code to make them editable, or ask an agent to do it.`}
			prompt={`Make the defaultProps of the composition "${state.compositionId}"${location} editable in Remotion Studio.`}
			skillId="remotion-interactivity"
			sources={source ? [source] : []}
			sourceStatus={
				source
					? null
					: hasResolvedStack(stack)
						? 'The source location is unavailable.'
						: 'Loading code preview...'
			}
		/>
	);
};
