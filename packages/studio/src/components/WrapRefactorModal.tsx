import React, {useCallback, useContext, useRef} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import {formatFileLocation} from '../helpers/format-file-location';
import {getCodexAnnotation} from '../helpers/get-codex-annotation';
import {requestCodexAnnotation} from '../helpers/request-codex-annotation';
import type {ModalState} from '../state/modals';
import {AgentPrompt} from './AgentPrompt';
import {ModalButton} from './ModalButton';
import {getMaxModalHeight, getMaxModalWidth} from './ModalContainer';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {useSettings} from './SettingsContext';

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	display: 'flex',
	flexDirection: 'column',
	maxHeight: getMaxModalHeight(800),
	minWidth: 0,
	overflow: 'hidden',
	width: getMaxModalWidth(560),
};

const container: React.CSSProperties = {
	minHeight: 0,
	overflowY: 'auto',
	padding: 16,
};

const text: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	marginBottom: 16,
};

type State = Extract<ModalState, {type: 'wrap-refactor'}>;

export const WrapRefactorModal: React.FC<{readonly state: State}> = ({
	state,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {error, remotionSkillsInfo} = useSettings();
	const annotationTarget = useRef<HTMLDivElement>(null);
	const markupSkill = remotionSkillsInfo?.skills.find(
		({name}) => name === 'remotion-markup',
	);
	const markupSkillAvailable = Boolean(
		markupSkill?.installedInProject || markupSkill?.installedGlobally,
	);
	const canAnnotate =
		!window.remotion_isReadOnlyStudio && getCodexAnnotation() !== null;
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const canSuggestAgent =
		!isBrowserStudio &&
		!window.remotion_isReadOnlyStudio &&
		previewServerState.type === 'connected' &&
		remotionSkillsInfo?.skills.some(({name}) => name === 'remotion-markup');
	const location =
		formatFileLocation({
			location: state.location,
			root: window.remotion_cwd,
		}) ?? state.location.source;
	const target = state.displayName
		? `${state.displayName} (${location})`
		: location;
	const wrapperImportPath =
		state.wrapper === 'HtmlInCanvasMotionBlur'
			? '@remotion/motion-blur'
			: 'remotion';
	const onSendToChatGPT = useCallback(() => {
		requestCodexAnnotation({
			target: annotationTarget.current,
			initialComment: markupSkillAvailable
				? '$remotion-markup Wrap this item.'
				: 'Wrap this item.',
			metadata: {
				action: 'Wrap item',
				wrapper: state.wrapper,
				import: wrapperImportPath,
				...(state.displayName ? {selection: state.displayName} : {}),
				source: location,
			},
		});
	}, [
		location,
		markupSkillAvailable,
		state.displayName,
		state.wrapper,
		wrapperImportPath,
	]);

	return (
		<DismissableModal panelStyle={panelStyle}>
			<ModalHeader title="Wrap item" />
			<div ref={annotationTarget} style={container}>
				<div style={text}>
					Studio could not safely wrap this item in
					{` <${state.wrapper}>`} with an automated code change.
				</div>
				{canSuggestAgent || canAnnotate ? (
					<AgentPrompt
						action={
							canAnnotate ? (
								<ModalButton size="compact" onClick={onSendToChatGPT}>
									Send to ChatGPT
								</ModalButton>
							) : null
						}
						availableText="You can wrap it using an agent:"
						promptDetails={` Wrap ${target} in <${state.wrapper}> from '${wrapperImportPath}'`}
						skillId="remotion-markup"
					/>
				) : (
					<div style={text}>
						{isBrowserStudio
							? 'Agent-assisted refactoring is unavailable in Browser Studio.'
							: remotionSkillsInfo === null && error === null
								? 'Checking whether /remotion-markup is available...'
								: 'The /remotion-markup Agent Skill is unavailable in this Studio.'}
					</div>
				)}
			</div>
		</DismissableModal>
	);
};
