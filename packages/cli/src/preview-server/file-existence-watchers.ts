import type {IncomingMessage, ServerResponse} from 'http';
import path from 'path';
import {installFileWatcher} from '../file-watcher';
import {waitForLiveEventsListener} from './live-events';
import {parseRequestBody} from './parse-body';
import type {
	SubscribeToFileExistence,
	UnsubscribeFromFileExistence,
} from './render-queue/job';

const fileExistenceWatchers: Record<string, () => void> = {};

export const subscribeToFileExistenceWatchers = ({
	file: relativeFile,
	remotionRoot,
}: {
	file: string;
	remotionRoot: string;
}): {exists: boolean} => {
	const file = path.resolve(remotionRoot, relativeFile);

	const {unwatch, exists} = installFileWatcher({
		file,
		onChange: (type) => {
			if (type === 'created') {
				waitForLiveEventsListener().then((listener) => {
					listener.sendEventToClient({
						type: 'watched-file-undeleted',
						// Must be relative file because that's what the client expects
						file: relativeFile,
					});
				});
			}

			if (type === 'deleted') {
				waitForLiveEventsListener().then((listener) => {
					listener.sendEventToClient({
						type: 'watched-file-deleted',
						// Must be relative file because that's what the client expects
						file: relativeFile,
					});
				});
			}
		},
	});
	fileExistenceWatchers[file] = unwatch;

	return {exists};
};

export const unsubscribeFromFileExistenceWatchers = ({
	file,
	remotionRoot,
}: {
	file: string;
	remotionRoot: string;
}) => {
	const actualPath = path.resolve(remotionRoot, file);
	fileExistenceWatchers[actualPath]?.();
	delete fileExistenceWatchers[actualPath];
};

export const handleSubscribeToFileExistence = async (
	remotionRoot: string,
	req: IncomingMessage,
	res: ServerResponse
) => {
	if (req.method === 'OPTIONS') {
		res.statusCode = 200;
		res.end();
		return;
	}

	res.setHeader('content-type', 'application/json');
	res.writeHead(200);

	try {
		const body = (await parseRequestBody(req)) as SubscribeToFileExistence;

		const {exists} = subscribeToFileExistenceWatchers({
			file: body.file,
			remotionRoot,
		});

		res.end(
			JSON.stringify({
				success: true,
				data: {
					exists,
				},
			})
		);
	} catch (err) {
		res.end(
			JSON.stringify({
				success: false,
				error: (err as Error).message,
			})
		);
	}
};

export const handleUnsubscribeToFileExistence = async (
	remotionRoot: string,
	req: IncomingMessage,
	res: ServerResponse
) => {
	if (req.method === 'OPTIONS') {
		res.statusCode = 200;
		res.end();
		return;
	}

	res.setHeader('content-type', 'application/json');
	res.writeHead(200);

	try {
		const body = (await parseRequestBody(req)) as UnsubscribeFromFileExistence;

		unsubscribeFromFileExistenceWatchers({file: body.file, remotionRoot});

		res.end(
			JSON.stringify({
				success: true,
			})
		);
	} catch (err) {
		res.end(
			JSON.stringify({
				success: false,
				error: (err as Error).message,
			})
		);
	}
};
