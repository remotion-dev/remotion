import type {ApiRoutes} from '@remotion/studio-shared';
import type {ApiHandler} from './api-types';
import {handleAddRender} from './routes/add-render';
import {applyCodemodHandler} from './routes/apply-codemod';
import {applyVisualControlHandler} from './routes/apply-visual-control-change';
import {handleCancelRender} from './routes/cancel-render';
import {deleteEffectHandler} from './routes/delete-effect';
import {deleteJsxNodeHandler} from './routes/delete-jsx-node';
import {deleteStaticFileHandler} from './routes/delete-static-file';
import {duplicateJsxNodeHandler} from './routes/duplicate-jsx-node';
import {handleInstallPackage} from './routes/install-dependency';
import {handleOpenInFileExplorer} from './routes/open-in-file-explorer';
import {projectInfoHandler} from './routes/project-info';
import {redoHandler} from './routes/redo';
import {handleRemoveRender} from './routes/remove-render';
import {handleRestartStudio} from './routes/restart-studio';
import {saveEffectPropsHandler} from './routes/save-effect-props';
import {saveSequencePropsHandler} from './routes/save-sequence-props';
import {subscribeToDefaultProps} from './routes/subscribe-to-default-props';
import {subscribeToFileExistence} from './routes/subscribe-to-file-existence';
import {subscribeToSequenceProps} from './routes/subscribe-to-sequence-props';
import {undoHandler} from './routes/undo';
import {unsubscribeFromDefaultProps} from './routes/unsubscribe-from-default-props';
import {unsubscribeFromFileExistence} from './routes/unsubscribe-from-file-existence';
import {unsubscribeFromSequenceProps} from './routes/unsubscribe-from-sequence-props';
import {handleUpdate} from './routes/update-available';
import {updateDefaultPropsHandler} from './routes/update-default-props';

export const allApiRoutes: {
	[key in keyof ApiRoutes]: ApiHandler<
		ApiRoutes[key]['Request'],
		ApiRoutes[key]['Response']
	>;
} = {
	'/api/cancel': handleCancelRender,
	'/api/render': handleAddRender,
	'/api/unsubscribe-from-file-existence': unsubscribeFromFileExistence,
	'/api/subscribe-to-file-existence': subscribeToFileExistence,
	'/api/remove-render': handleRemoveRender,
	'/api/open-in-file-explorer': handleOpenInFileExplorer,
	'/api/update-default-props': updateDefaultPropsHandler,
	'/api/apply-visual-control-change': applyVisualControlHandler,
	'/api/apply-codemod': applyCodemodHandler,
	'/api/subscribe-to-default-props': subscribeToDefaultProps,
	'/api/unsubscribe-from-default-props': unsubscribeFromDefaultProps,
	'/api/subscribe-to-sequence-props': subscribeToSequenceProps,
	'/api/unsubscribe-from-sequence-props': unsubscribeFromSequenceProps,
	'/api/save-sequence-props': saveSequencePropsHandler,
	'/api/save-effect-props': saveEffectPropsHandler,
	'/api/delete-effect': deleteEffectHandler,
	'/api/delete-jsx-node': deleteJsxNodeHandler,
	'/api/duplicate-jsx-node': duplicateJsxNodeHandler,
	'/api/update-available': handleUpdate,
	'/api/project-info': projectInfoHandler,
	'/api/delete-static-file': deleteStaticFileHandler,
	'/api/restart-studio': handleRestartStudio,
	'/api/install-package': handleInstallPackage,
	'/api/undo': undoHandler,
	'/api/redo': redoHandler,
};
