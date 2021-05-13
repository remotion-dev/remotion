import {existsSync, lstatSync} from 'fs';
import path from 'path';
import {BINARY_NAME} from '../bundle-remotion';
import {deploySite} from '../deploy-site';
import {parsedCli} from './args';
import {Log} from './log';

export const deployCommand = async () => {
	const fileName = parsedCli._[1];
	if (!fileName) {
		Log.error('No entry file passed.');
		Log.info(
			'Pass an additional argument specifying the entry file of your Remotion project:'
		);
		Log.info();
		Log.info(`${BINARY_NAME} deploy <entry-file.ts>`);
		process.exit(1);
	}

	const absoluteFile = path.join(process.cwd(), fileName);
	if (!existsSync(absoluteFile)) {
		Log.error(
			`No file exists at ${absoluteFile}. Make sure the path exists and try again.`
		);
		process.exit(1);
	}

	if (lstatSync(absoluteFile).isDirectory()) {
		Log.error(
			`You passed a path ${absoluteFile} but it is a directory. Pass a file instead.`
		);
		process.exit(1);
	}

	// TODO: Progress bar

	const {url} = await deploySite(absoluteFile, {
		onBucketCreated: () => Log.info('Bucket created.'),
		onUploadProgress: (p) => Log.info(p.sizeUploaded / p.totalSize),
		onWebsiteActivated: () => Log.info('Website activated'),
	});
	console.log({url});
};
