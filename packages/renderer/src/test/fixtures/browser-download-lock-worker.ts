import fs from 'node:fs';
import {acquireBrowserDownloadLock} from '../../browser/browser-download-lock';

const [lockPath, eventsPath, name, releaseSignal] = process.argv.slice(2);

const appendEvent = (event: string) => {
	fs.appendFileSync(eventsPath, `${name}:${event}\n`);
};

const wait = (timeoutInMilliseconds: number): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(resolve, timeoutInMilliseconds);
	});
};

const main = async () => {
	if (!lockPath || !eventsPath || !name) {
		throw new Error('Expected lock path, events path and worker name');
	}

	appendEvent('attempting');
	const releaseLock = await acquireBrowserDownloadLock(lockPath);
	appendEvent('acquired');

	if (releaseSignal) {
		while (!fs.existsSync(releaseSignal)) {
			await wait(10);
		}
	}

	await releaseLock();
	appendEvent('released');
};

main().catch((error) => {
	throw error;
});
