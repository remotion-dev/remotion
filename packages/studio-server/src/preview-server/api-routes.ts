import type {ApiRoutes} from '@remotion/studio-shared';
import type {ApiHandler} from './api-types';
import {handleAddRender} from './routes/add-render';
import {applyCodemodHandler} from './routes/apply-codemod';
import {canUpdateDefaultPropsHandler} from './routes/can-update-default-props';
import {handleCancelRender} from './routes/cancel-render';
import {handleCopyStillToClipboard} from './routes/copy-still-to-clipboard-handler';
import {handleOpenInFileExplorer} from './routes/open-in-file-explorer';
import {projectInfoHandler} from './routes/project-info';
import {handleRemoveRender} from './routes/remove-render';
import {subscribeToFileExistence} from './routes/subscribe-to-file-existence';
import {unsubscribeFromFileExistence} from './routes/unsubscribe-from-file-existence';
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
	'/api/copy-still-to-clipboard': handleCopyStillToClipboard,
	'/api/update-default-props': updateDefaultPropsHandler,
	'/api/apply-codemod': applyCodemodHandler,
	'/api/can-update-default-props': canUpdateDefaultPropsHandler,
	'/api/update-available': handleUpdate,
	'/api/project-info': projectInfoHandler,
};
