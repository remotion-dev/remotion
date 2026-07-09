import type {ApiRoutes} from '@remotion/studio-shared';
import type {ApiHandler} from './api-types';
import {addEffectHandler} from './routes/add-effect';
import {addEffectKeyframeHandler} from './routes/add-effect-keyframe';
import {addKeyframesHandler} from './routes/add-keyframes';
import {handleAddRender} from './routes/add-render';
import {addSequenceKeyframeHandler} from './routes/add-sequence-keyframe';
import {applyCodemodHandler} from './routes/apply-codemod';
import {applyVisualControlHandler} from './routes/apply-visual-control-change';
import {handleCancelRender} from './routes/cancel-render';
import {compositionComponentInfoHandler} from './routes/composition-component-info';
import {deleteEffectHandler} from './routes/delete-effect';
import {deleteJsxNodeHandler} from './routes/delete-jsx-node';
import {deleteKeyframesHandler} from './routes/delete-keyframes';
import {deleteStaticFileHandler} from './routes/delete-static-file';
import {downloadRemoteAssetHandler} from './routes/download-remote-asset';
import {duplicateEffectHandler} from './routes/duplicate-effect';
import {duplicateJsxNodeHandler} from './routes/duplicate-jsx-node';
import {insertElementHandler} from './routes/insert-element';
import {insertJsxElementHandler} from './routes/insert-jsx-element';
import {handleInstallPackage} from './routes/install-dependency';
import {logStudioErrorHandler} from './routes/log-studio-error';
import {moveKeyframesHandler} from './routes/move-keyframes';
import {openInEditorHandler} from './routes/open-in-editor';
import {handleOpenInFileExplorer} from './routes/open-in-file-explorer';
import {pasteEffectsHandler} from './routes/paste-effects';
import {projectInfoHandler} from './routes/project-info';
import {redoHandler} from './routes/redo';
import {registerClientRenderHandler} from './routes/register-client-render';
import {handleRemoveRender} from './routes/remove-render';
import {renameStaticFileHandler} from './routes/rename-static-file';
import {reorderEffectHandler} from './routes/reorder-effect';
import {reorderSequenceHandler} from './routes/reorder-sequence';
import {handleRestartStudio} from './routes/restart-studio';
import {saveEffectPropsHandler} from './routes/save-effect-props';
import {saveSequencePropsHandler} from './routes/save-sequence-props';
import {splitJsxSequenceHandler} from './routes/split-jsx-sequence';
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
import {updateSequenceKeyframeSettingsHandler} from './routes/update-sequence-keyframe-settings';

export const allApiRoutes: {
	[key in keyof ApiRoutes]: ApiHandler<
		ApiRoutes[key]['Request'],
		ApiRoutes[key]['Response']
	>;
} = {
	'/api/composition-component-info': compositionComponentInfoHandler,
	'/api/cancel': handleCancelRender,
	'/api/render': handleAddRender,
	'/api/unsubscribe-from-file-existence': unsubscribeFromFileExistence,
	'/api/subscribe-to-file-existence': subscribeToFileExistence,
	'/api/remove-render': handleRemoveRender,
	'/api/open-in-editor': openInEditorHandler,
	'/api/open-in-file-explorer': handleOpenInFileExplorer,
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
	'/api/delete-effect': deleteEffectHandler,
	'/api/paste-effects': pasteEffectsHandler,
	'/api/delete-jsx-node': deleteJsxNodeHandler,
	'/api/duplicate-jsx-node': duplicateJsxNodeHandler,
	'/api/split-jsx-sequence': splitJsxSequenceHandler,
	'/api/update-available': handleUpdate,
	'/api/project-info': projectInfoHandler,
	'/api/delete-static-file': deleteStaticFileHandler,
	'/api/rename-static-file': renameStaticFileHandler,
	'/api/restart-studio': handleRestartStudio,
	'/api/install-package': handleInstallPackage,
	'/api/insert-jsx-element': insertJsxElementHandler,
	'/api/insert-element': insertElementHandler,
	'/api/download-remote-asset': downloadRemoteAssetHandler,
	'/api/undo': undoHandler,
	'/api/redo': redoHandler,
	'/api/log-studio-error': logStudioErrorHandler,
};
