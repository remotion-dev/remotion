import React from 'react';
import {formatFileLocation} from '../helpers/format-file-location';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import type {ModalState} from '../state/modals';
import {CodeChangeModal} from './CodeChangeModal';

type State = Extract<ModalState, {type: 'precompose-refactor'}>;

export const PrecomposeRefactorModal: React.FC<{readonly state: State}> = ({
	state,
}) => {
	const failureReason = state.failureReason ?? null;
	const targets = [
		...new Set(
			state.targets.map(({fileName, displayName, line}) => {
				const location =
					formatFileLocation({
						location: {source: fileName, line},
						root: window.remotion_cwd,
					}) ?? fileName;
				return displayName ? `${displayName} (${location})` : location;
			}),
		),
	];
	const sources = state.targets.flatMap(({fileName, line}) => {
		const source = resolvedStackToSymbolicated({
			source: fileName,
			line,
			column: null,
		});
		return source ? [source] : [];
	});
	return (
		<CodeChangeModal
			title="Pre-compose"
			description={
				<>
					{failureReason === null ? null : (
						<>
							{failureReason}
							<br />
							<br />
						</>
					)}
					Studio could not automatically pre-compose these items. Move them into
					their own composition and re-import them here, or ask an agent to do
					it.
				</>
			}
			prompt={`Pre-compose these selected items.\n${targets.join('\n')}\n\nMove the selected items into their own composition and re-import it into this composition.${failureReason === null ? '' : `\n\nAutomatic pre-compose stopped.\n${failureReason}`}`}
			skillId="remotion-markup"
			sources={sources}
			sourceStatus={null}
		/>
	);
};
