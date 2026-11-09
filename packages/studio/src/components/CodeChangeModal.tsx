import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import React, {useContext, useRef} from 'react';
import {OpenInEditor} from '../error-overlay/remotion-overlay/OpenInEditor';
import {StackElement} from '../error-overlay/remotion-overlay/StackFrame';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
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
	marginBottom: 16,
};

export const CodeChangeModal: React.FC<{
	readonly title: string;
	readonly description: React.ReactNode;
	readonly prompt: string;
	readonly skillId: string;
	readonly sources: readonly SymbolicatedStackFrame[];
	readonly sourceStatus: string | null;
}> = ({title, description, prompt, skillId, sources, sourceStatus}) => {
	const annotationTarget = useRef<HTMLDivElement>(null);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canOpenInEditor, defaultEditorId, defaultEditorName} =
		useEditorOpening(
			previewServerState.type === 'connected' &&
				!window.remotion_isReadOnlyStudio,
		);
	const uniqueSources = new Map(
		sources.map((source) => [
			`${source.originalFileName}:${source.originalLineNumber}:${source.originalColumnNumber}`,
			source,
		]),
	);

	return (
		<DismissableModal panelStyle={panelStyle}>
			<ModalHeader title={title} />
			<div ref={annotationTarget} style={container}>
				<div style={text}>{description}</div>
				{[...uniqueSources].map(([key, source], index) => (
					<div key={key} style={{marginBottom: 16}}>
						<StackElement
							collapsible={false}
							defaultFunctionName={null}
							editorId={canOpenInEditor ? defaultEditorId : null}
							fontSize={13}
							headerAction={
								canOpenInEditor && defaultEditorId && defaultEditorName ? (
									<OpenInEditor
										canHaveKeyboardShortcuts={false}
										editorId={defaultEditorId}
										editorName={defaultEditorName}
										size="compact"
										stack={source}
									/>
								) : null
							}
							horizontalSpacing={0}
							isFirst={index === 0}
							lineNumberWidth={
								String(
									Math.max(
										0,
										...(source.originalScriptCode ?? []).map(
											(line) => line.lineNumber,
										),
									),
								).length
							}
							s={source}
						/>
					</div>
				))}
				{sourceStatus ? <div style={text}>{sourceStatus}</div> : null}
				<AgentPrompt
					annotationTarget={annotationTarget}
					actionLabel={title}
					prompt={prompt}
					skillId={skillId}
				/>
			</div>
		</DismissableModal>
	);
};
