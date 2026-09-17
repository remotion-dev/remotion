import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import React, {useContext, useEffect, useState} from 'react';
import {resolveFileSource} from '../error-overlay/react-overlay/effects/resolve-file-source';
import {OpenInEditor} from '../error-overlay/remotion-overlay/OpenInEditor';
import {StackElement} from '../error-overlay/remotion-overlay/StackFrame';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import {findOriginalPositionInFileAtProperty} from '../helpers/open-in-editor';
import type {ModalState} from '../state/modals';
import {AgentPrompt} from './AgentPrompt';
import {getMaxModalHeight, getMaxModalWidth} from './ModalContainer';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {useEditorOpening} from './use-default-editor-info';

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	display: 'flex',
	flexDirection: 'column',
	width: getMaxModalWidth(560),
	maxHeight: getMaxModalHeight(800),
	minWidth: 0,
	overflow: 'hidden',
};

const container: React.CSSProperties = {
	padding: 16,
	minHeight: 0,
	overflowY: 'auto',
};

const text: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

const sourcePreviewContainer: React.CSSProperties = {
	marginBottom: 16,
	marginTop: 4,
};

const sourcePreviewStatus: React.CSSProperties = {
	...text,
	marginBottom: 16,
	marginTop: 10,
};

type FixComputedValueModalState = Extract<
	ModalState,
	{type: 'fix-computed-value'}
>;

type SourcePreviewState =
	| {
			type: 'loading';
	  }
	| {
			type: 'loaded';
			stack: SymbolicatedStackFrame;
	  }
	| {
			type: 'error';
			message: string;
	  };

export const FixComputedValueModal: React.FC<{
	readonly state: FixComputedValueModalState;
}> = ({state}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canOpenInEditor, defaultEditorId, defaultEditorName} =
		useEditorOpening(previewServerState.type === 'connected');
	const [sourcePreview, setSourcePreview] = useState<SourcePreviewState>({
		type: 'loading',
	});
	const promptLocation =
		sourcePreview.type === 'loaded'
			? `${sourcePreview.stack.originalFileName}:${sourcePreview.stack.originalLineNumber}:${sourcePreview.stack.originalColumnNumber}`
			: `${state.location.source}:${state.location.line}:${state.location.column}`;
	const promptDetails = ` ${promptLocation} make "${state.prop}" interactive`;
	const canOpenSourceInEditor =
		sourcePreview.type === 'loaded' &&
		canOpenInEditor &&
		defaultEditorId !== null &&
		defaultEditorName !== null;

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
				if (!cancelled) {
					setSourcePreview({type: 'loaded', stack});
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setSourcePreview({
						type: 'error',
						message: err instanceof Error ? err.message : String(err),
					});
				}
			});

		return () => {
			cancelled = true;
		};
	}, [state.location, state.prop]);

	return (
		<DismissableModal panelStyle={panelStyle}>
			<ModalHeader title="Fix computed value" />
			<div style={container}>
				<div style={text}>
					This value cannot be interactively edited because it is computed:
				</div>
				{sourcePreview.type === 'loaded' ? (
					<div style={sourcePreviewContainer}>
						<StackElement
							collapsible={false}
							defaultFunctionName={null}
							editorId={canOpenInEditor ? defaultEditorId : null}
							fontSize={13}
							headerAction={
								canOpenSourceInEditor ? (
									<OpenInEditor
										canHaveKeyboardShortcuts={false}
										editorId={defaultEditorId}
										editorName={defaultEditorName}
										size="compact"
										stack={sourcePreview.stack}
									/>
								) : null
							}
							horizontalSpacing={0}
							isFirst
							lineNumberWidth={
								String(
									Math.max(
										0,
										...(sourcePreview.stack.originalScriptCode ?? []).map(
											(line) => line.lineNumber,
										),
									),
								).length
							}
							s={sourcePreview.stack}
						/>
					</div>
				) : (
					<div style={sourcePreviewStatus}>
						{sourcePreview.type === 'loading'
							? 'Loading code preview...'
							: `Could not load code preview: ${sourcePreview.message}`}
					</div>
				)}
				<AgentPrompt
					availableText="Use this prompt to make this value editable:"
					promptDetails={promptDetails}
					skillId="remotion-interactivity"
				/>
			</div>
		</DismissableModal>
	);
};
