import {installFileWatcher} from './file-watcher';
import {waitForLiveEventsListener} from './preview-server/live-events';
import {getProjectInfo} from './preview-server/project-info';

export const watchRootFile = async (
	remotionRoot: string,
	entryPoint: string,
) => {
	const rootFile = await getProjectInfo(remotionRoot, entryPoint);
	if (!rootFile.rootFile) {
		return;
	}

	installFileWatcher({
		file: rootFile.rootFile,
		onChange: () => {
			// Don't care if changed, added or deleted - should trigger a refetch in the frontend all the time
			waitForLiveEventsListener().then((listener) => {
				listener.sendEventToClient({type: 'root-file-changed'});
			});
		},
	});
};
