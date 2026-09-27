import type {ApiRoutes} from '@remotion/studio-shared';
import type {ApiHandler} from './api-types';
import {addEffectHandler} from './routes/add-effect';
import {addEffectKeyframeHandler} from './routes/add-effect-keyframe';
import {addKeyframesHandler} from './routes/add-keyframes';
import {handleAddRender} from './routes/add-render';
import {addSequenceKeyframeHandler} from './routes/add-sequence-keyframe';
import {applyCodemodHandler} from './routes/apply-codemod';
import {applyVisualControlHandler} from './routes/apply-visual-control-change';
import {batchUpdateKeyframeSettingsHandler} from './routes/batch-update-keyframe-settings';
import {handleCancelRender} from './routes/cancel-render';
import {compositionComponentInfoHandler} from './routes/composition-component-info';
import {convertFigmaClipboardToSvgHandler} from './routes/convert-figma-clipboard-to-svg';
import {copyRenderOutputToAssetHandler} from './routes/copy-render-output-to-asset';
import {
	getDefaultCodingAgentInfoHandler,
	openInCodingAgentHandler,
} from './routes/default-coding-agent';
import {getDefaultEditorInfoHandler} from './routes/default-editor';
import {deleteEffectHandler} from './routes/delete-effect';
import {deleteKeyframesHandler} from './routes/delete-keyframes';
import {deleteNodesHandler} from './routes/delete-nodes';
import {deleteStaticFileHandler} from './routes/delete-static-file';
import {downloadRemoteAssetHandler} from './routes/download-remote-asset';
import {duplicateEffectHandler} from './routes/duplicate-effect';
import {duplicateNodesHandler} from './routes/duplicate-nodes';
import {findInFileHandler} from './routes/find-in-file';
import {insertBasicCaptionsHandler} from './routes/insert-basic-captions';
import {insertCompositionElementHandler} from './routes/insert-composition-element';
import {insertElementHandler} from './routes/insert-element';
import {
	installRemotionSkillHandler,
	removeRemotionSkillHandler,
} from './routes/install-remotion-skill';
import {invalidateBundleHandler} from './routes/invalidate-bundle';
import {logStudioErrorHandler} from './routes/log-studio-error';
import {moveKeyframesHandler} from './routes/move-keyframes';
import {openInEditorHandler} from './routes/open-in-editor';
import {handleOpenInFileExplorer} from './routes/open-in-file-explorer';
import {openInGitClientHandler} from './routes/open-in-git-client';
import {openInTerminalHandler} from './routes/open-in-terminal';
import {pasteEffectsHandler} from './routes/paste-effects';
import {precomposeJsxNodesHandler} from './routes/precompose-jsx-nodes';
import {prepareElementInstallHandler} from './routes/prepare-element-install';
import {projectInfoHandler} from './routes/project-info';
import {redoHandler} from './routes/redo';
import {registerClientRenderHandler} from './routes/register-client-render';
import {getReleaseNotesHandler} from './routes/release-notes';
import {remotionSkillsInfoHandler} from './routes/remotion-skills-info';
import {handleRemoveRender} from './routes/remove-render';
import {renameStaticFileHandler} from './routes/rename-static-file';
import {reorderEffectHandler} from './routes/reorder-effect';
import {reorderSequenceHandler} from './routes/reorder-sequence';
import {replaceVideoSourceHandler} from './routes/replace-video-source';
import {handleRestartStudio} from './routes/restart-studio';
import {saveEffectPropsHandler} from './routes/save-effect-props';
import {saveMultipleEffectPropsHandler} from './routes/save-multiple-effect-props';
import {saveSequencePropsHandler} from './routes/save-sequence-props';
import {handleShutdownStudio} from './routes/shutdown-studio';
import {splitSequencesHandler} from './routes/split-sequences';
import {splitVideoFromAudioHandler} from './routes/split-video-from-audio';
import {subscribeToDefaultProps} from './routes/subscribe-to-default-props';
import {subscribeToFileExistence} from './routes/subscribe-to-file-existence';
import {subscribeToSequenceProps} from './routes/subscribe-to-sequence-props';
import {undoHandler} from './routes/undo';
import {unregisterClientRenderHandler} from './routes/unregister-client-render';
import {unsubscribeFromDefaultProps} from './routes/unsubscribe-from-default-props';
import {unsubscribeFromFileExistence} from './routes/unsubscribe-from-file-existence';
import {unsubscribeFromSequenceProps} from './routes/unsubscribe-from-sequence-props';
import {handleUpdate} from './routes/update-available';
import {updateDefaultPropsHandler} from './routes/update-default-props';
import {updateEffectKeyframeSettingsHandler} from './routes/update-effect-keyframe-settings';
import {updateElementInstallTargetHandler} from './routes/update-element-install-target';
import {updateSequenceKeyframeSettingsHandler} from './routes/update-sequence-keyframe-settings';
import {handleUpgradeRemotion} from './routes/upgrade-remotion';
import {wrapNodeHandler} from './routes/wrap-node';

type StandardApiRoute = Exclude<
	keyof ApiRoutes,
	'/api/install-package' | '/api/update-config'
>;

export const allApiRoutes: {
	[key in StandardApiRoute]: ApiHandler<
		ApiRoutes[key]['Request'],
		ApiRoutes[key]['Response']
	>;
} = {
	'/api/invalidate-bundle': invalidateBundleHandler,
	'/api/composition-component-info': compositionComponentInfoHandler,
	'/api/copy-render-output-to-asset': copyRenderOutputToAssetHandler,
	'/api/convert-figma-clipboard-to-svg': convertFigmaClipboardToSvgHandler,
	'/api/cancel': handleCancelRender,
	'/api/render': handleAddRender,
	'/api/unsubscribe-from-file-existence': unsubscribeFromFileExistence,
	'/api/subscribe-to-file-existence': subscribeToFileExistence,
	'/api/remove-render': handleRemoveRender,
	'/api/find-in-file': findInFileHandler,
	'/api/open-in-file-explorer': handleOpenInFileExplorer,
	'/api/open-in-terminal': openInTerminalHandler,
	'/api/open-in-git-client': openInGitClientHandler,
	'/api/open-in-editor': openInEditorHandler,
	'/api/open-in-coding-agent': openInCodingAgentHandler,
	'/api/register-client-render': registerClientRenderHandler,
	'/api/unregister-client-render': unregisterClientRenderHandler,
	'/api/update-default-props': updateDefaultPropsHandler,
	'/api/apply-visual-control-change': applyVisualControlHandler,
	'/api/apply-codemod': applyCodemodHandler,
	'/api/subscribe-to-default-props': subscribeToDefaultProps,
	'/api/unsubscribe-from-default-props': unsubscribeFromDefaultProps,
	'/api/subscribe-to-sequence-props': subscribeToSequenceProps,
	'/api/unsubscribe-from-sequence-props': unsubscribeFromSequenceProps,
	'/api/save-sequence-props': saveSequencePropsHandler,
	'/api/save-effect-props': saveEffectPropsHandler,
	'/api/save-multiple-effect-props': saveMultipleEffectPropsHandler,
	'/api/add-effect': addEffectHandler,
	'/api/reorder-effect': reorderEffectHandler,
	'/api/duplicate-effect': duplicateEffectHandler,
	'/api/reorder-sequence': reorderSequenceHandler,
	'/api/delete-keyframes': deleteKeyframesHandler,
	'/api/move-keyframes': moveKeyframesHandler,
	'/api/add-sequence-keyframe': addSequenceKeyframeHandler,
	'/api/add-effect-keyframe': addEffectKeyframeHandler,
	'/api/add-keyframes': addKeyframesHandler,
	'/api/update-sequence-keyframe-settings':
		updateSequenceKeyframeSettingsHandler,
	'/api/update-effect-keyframe-settings': updateEffectKeyframeSettingsHandler,
	'/api/batch-update-keyframe-settings': batchUpdateKeyframeSettingsHandler,
	'/api/delete-effect': deleteEffectHandler,
	'/api/paste-effects': pasteEffectsHandler,
	'/api/delete-nodes': deleteNodesHandler,
	'/api/duplicate-nodes': duplicateNodesHandler,
	'/api/wrap-node': wrapNodeHandler,
	'/api/precompose-jsx-nodes': precomposeJsxNodesHandler,
	'/api/split-sequences': splitSequencesHandler,
	'/api/split-video-from-audio': splitVideoFromAudioHandler,
	'/api/insert-basic-captions': insertBasicCaptionsHandler,
	'/api/replace-video-source': replaceVideoSourceHandler,
	'/api/update-available': handleUpdate,
	'/api/release-notes': getReleaseNotesHandler,
	'/api/remotion-skills-info': remotionSkillsInfoHandler,
	'/api/install-remotion-skill': installRemotionSkillHandler,
	'/api/remove-remotion-skill': removeRemotionSkillHandler,
	'/api/project-info': projectInfoHandler,
	'/api/delete-static-file': deleteStaticFileHandler,
	'/api/rename-static-file': renameStaticFileHandler,
	'/api/upgrade-remotion': handleUpgradeRemotion,
	'/api/shutdown-studio': handleShutdownStudio,
	'/api/restart-studio': handleRestartStudio,
	'/api/default-coding-agent-info': getDefaultCodingAgentInfoHandler,
	'/api/default-editor-info': getDefaultEditorInfoHandler,
	'/api/insert-composition-element': insertCompositionElementHandler,
	'/api/insert-element': insertElementHandler,
	'/api/prepare-element-install': prepareElementInstallHandler,
	'/api/update-element-install-target': updateElementInstallTargetHandler,
	'/api/download-remote-asset': downloadRemoteAssetHandler,
	'/api/undo': undoHandler,
	'/api/redo': redoHandler,
	'/api/log-studio-error': logStudioErrorHandler,
};
