import type {
	EditorPickerId,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {resolveFileSource} from '../error-overlay/react-overlay/effects/resolve-file-source';
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

const CodeChangeSource: React.FC<{
	readonly source: SymbolicatedStackFrame;
	readonly editorId: EditorPickerId | null;
	readonly editorName: string | null;
	readonly isFirst: boolean;
}> = ({source, editorId, editorName, isFirst}) => {
	const {
		originalFileName,
		originalLineNumber,
		originalColumnNumber,
		originalScriptCode,
	} = source;
	const key = JSON.stringify([
		originalFileName,
		originalLineNumber,
		originalColumnNumber,
	]);
	const [resolved, setResolved] = useState<{
		key: string;
		source: SymbolicatedStackFrame | null;
		error: string | null;
	} | null>(null);

	useEffect(() => {
		if (
			originalScriptCode !== null ||
			originalFileName === null ||
			originalLineNumber === null
		) {
			return;
		}

		let cancelled = false;
		resolveFileSource(
			{
				fileName: originalFileName,
				lineNumber: originalLineNumber,
				columnNumber: originalColumnNumber ?? 0,
				message: '',
			},
			3,
		)
			.then((resolvedFrame) => {
				if (!cancelled) setResolved({key, source: resolvedFrame, error: null});
			})
			.catch((error: unknown) => {
				if (!cancelled)
					setResolved({
						key,
						source: null,
						error: error instanceof Error ? error.message : String(error),
					});
			});
		return () => {
			cancelled = true;
		};
	}, [
		key,
		originalFileName,
		originalLineNumber,
		originalColumnNumber,
		originalScriptCode,
	]);

	const current = resolved?.key === key ? resolved : null;
	const frame =
		originalScriptCode === null ? (current?.source ?? source) : source;
	const status =
		frame.originalScriptCode !== null
			? null
			: originalFileName === null || originalLineNumber === null
				? 'The source location is unavailable.'
				: current?.error
					? `Could not load code preview: ${current.error}`
					: 'Loading code preview...';

	return (
		<div style={{marginBottom: 16}}>
			<StackElement
				collapsible={false}
				defaultFunctionName={null}
				editorId={editorId}
				fontSize={13}
				headerAction={
					editorId && editorName ? (
						<OpenInEditor
							canHaveKeyboardShortcuts={false}
							editorId={editorId}
							editorName={editorName}
							size="compact"
							stack={frame}
						/>
					) : null
				}
				horizontalSpacing={0}
				isFirst={isFirst}
				lineNumberWidth={
					String(
						Math.max(
							0,
							...(frame.originalScriptCode ?? []).map(
								(line) => line.lineNumber,
							),
						),
					).length
				}
				s={frame}
			/>
			{status ? <div style={text}>{status}</div> : null}
		</div>
	);
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
			<div
				ref={annotationTarget}
				className="__remotion-vertical-scrollbar"
				style={container}
			>
				<div style={text}>{description}</div>
				{[...uniqueSources].map(([key, source], index) => (
					<CodeChangeSource
						key={key}
						source={source}
						editorId={canOpenInEditor ? defaultEditorId : null}
						editorName={defaultEditorName}
						isFirst={index === 0}
					/>
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
