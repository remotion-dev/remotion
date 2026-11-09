import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import React, {useEffect, useState} from 'react';
import {resolveFileSource} from '../error-overlay/react-overlay/effects/resolve-file-source';
import {findOriginalPositionInFileAtProperty} from '../helpers/open-in-editor';
import type {ModalState} from '../state/modals';
import {CodeChangeModal} from './CodeChangeModal';

type FixComputedValueModalState = Extract<
	ModalState,
	{type: 'fix-computed-value'}
>;

type SourcePreviewState =
	| {type: 'loading'}
	| {type: 'loaded'; stack: SymbolicatedStackFrame}
	| {type: 'error'; message: string};

export const FixComputedValueModal: React.FC<{
	readonly state: FixComputedValueModalState;
}> = ({state}) => {
	const [sourcePreview, setSourcePreview] = useState<SourcePreviewState>({
		type: 'loading',
	});
	const promptLocation =
		sourcePreview.type === 'loaded'
			? `${sourcePreview.stack.originalFileName}:${sourcePreview.stack.originalLineNumber}:${sourcePreview.stack.originalColumnNumber}`
			: `${state.location.source}:${state.location.line}:${state.location.column}`;

	useEffect(() => {
		let cancelled = false;
		setSourcePreview({type: 'loading'});
		findOriginalPositionInFileAtProperty({
			originalPosition: state.location,
			property: state.prop.split('.').at(-1) ?? state.prop,
		})
			.then((position) => {
				return resolveFileSource(
					{
						columnNumber: position.column,
						fileName: position.source,
						lineNumber: position.line,
						message: `Computed value "${state.prop}"`,
					},
					1,
				);
			})
			.then((stack) => {
				if (!cancelled) setSourcePreview({type: 'loaded', stack});
			})
			.catch((err: unknown) => {
				if (!cancelled)
					setSourcePreview({
						type: 'error',
						message: err instanceof Error ? err.message : String(err),
					});
			});
		return () => {
			cancelled = true;
		};
	}, [state.location, state.prop]);

	return (
		<CodeChangeModal
			title="Fix computed value"
			description="This value cannot be interactively edited because it is computed. Edit the code to make it interactive, or ask an agent to do it."
			prompt={`Make the computed value "${state.prop}" at ${promptLocation} interactive.`}
			skillId="remotion-interactivity"
			sources={sourcePreview.type === 'loaded' ? [sourcePreview.stack] : []}
			sourceStatus={
				sourcePreview.type === 'loading'
					? 'Loading code preview...'
					: sourcePreview.type === 'error'
						? `Could not load code preview: ${sourcePreview.message}`
						: null
			}
		/>
	);
};
