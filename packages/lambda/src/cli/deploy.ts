import {existsSync, lstatSync} from 'fs';
import path from 'path';
import {BINARY_NAME} from '../bundle-remotion';
import {deploySite} from '../deploy-site';
import {
	BucketCreationProgress,
	createProgressBar,
	DeployToS3Progress,
	makeBucketProgress,
	makeDeployProgressBar,
} from '../progress-bar';
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

	const progressBar = createProgressBar();

	const multiProgress: {
		bucketProgress: BucketCreationProgress;
		deployProgress: DeployToS3Progress;
	} = {
		bucketProgress: {
			bucketCreated: false,
			doneIn: null,
			websiteEnabled: false,
		},
		deployProgress: {
			doneIn: null,
			totalSize: null,
			sizeUploaded: 0,
		},
	};

	const updateProgress = () => {
		progressBar.update(
			[
				makeBucketProgress(multiProgress.bucketProgress),
				makeDeployProgressBar(multiProgress.deployProgress),
			].join('\n')
		);
	};

	updateProgress();

	const bucketStart = Date.now();
	const uploadStart = Date.now();

	const {url} = await deploySite(absoluteFile, {
		onBucketCreated: () => {
			multiProgress.bucketProgress = {
				bucketCreated: true,
				doneIn: null,
				websiteEnabled: false,
			};
			updateProgress();
		},
		onUploadProgress: (p) => {
			multiProgress.deployProgress = {
				sizeUploaded: p.sizeUploaded,
				totalSize: p.totalSize,
				doneIn: null,
			};
			updateProgress();
		},
		onWebsiteActivated: () => {
			multiProgress.bucketProgress = {
				bucketCreated: true,
				doneIn: Date.now() - bucketStart,
				websiteEnabled: true,
			};
			updateProgress();
		},
	});
	const uploadDuration = Date.now() - uploadStart;
	multiProgress.deployProgress = {
		sizeUploaded: 1,
		totalSize: 1,
		doneIn: uploadDuration,
	};
	updateProgress();

	Log.info();
	Log.info();
	Log.info('Deployed to S3!');

	Log.info(url);
};
