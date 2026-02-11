import type {CompletedClientRender} from '@remotion/studio-shared';
import path from 'node:path';
import {installFileWatcher} from './file-watcher';
import {waitForLiveEventsListener} from './preview-server/live-events';

let completedClientRenders: CompletedClientRender[] = [];
const cleanupFns: Map<string, () => void> = new Map();

const notifyClientsOfUpdate = () => {
	waitForLiveEventsListener().then((listener) => {
		listener.sendEventToClient({
			type: 'client-renders-updated',
			renders: getCompletedClientRenders(),
		});
	});
};

export const getCompletedClientRenders = (): CompletedClientRender[] => {
	return completedClientRenders;
};

export const addCompletedClientRender = ({
	render,
	remotionRoot,
}: {
	render: CompletedClientRender;
	remotionRoot: string;
}): void => {
	if (completedClientRenders.some((r) => r.id === render.id)) {
		return;
	}

	completedClientRenders.push(render);

	const filePath = path.resolve(remotionRoot, render.outName);
	const {unwatch} = installFileWatcher({
		file: filePath,
		onChange: (type) => {
			if (type === 'created' || type === 'deleted') {
				updateCompletedClientRender(render.id, {
					deletedOutputLocation: type === 'deleted',
				});
			}
		},
	});

	cleanupFns.set(render.id, unwatch);
	notifyClientsOfUpdate();
};

export const removeCompletedClientRender = (id: string): void => {
	const cleanup = cleanupFns.get(id);
	if (cleanup) {
		cleanup();
		cleanupFns.delete(id);
	}

	completedClientRenders = completedClientRenders.filter((r) => r.id !== id);
	notifyClientsOfUpdate();
};

const updateCompletedClientRender = (
	id: string,
	updates: Partial<CompletedClientRender>,
): void => {
	completedClientRenders = completedClientRenders.map((r) => {
		if (r.id === id) {
			return {...r, ...updates};
		}

		return r;
	});
	notifyClientsOfUpdate();
};
