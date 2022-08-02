import {CliInternals, ConfigInternals} from '@remotion/cli';
import {existsSync} from 'fs';
import {stat} from 'fs/promises';
import path from 'path';
import {deploySite} from '../../../api/deploy-site';
import {getOrCreateBucket} from '../../../api/get-or-create-bucket';
import {BINARY_NAME} from '../../../shared/constants';
import {truthy} from '../../../shared/truthy';
import {validateSiteName} from '../../../shared/validate-site-name';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import type {
	BucketCreationProgress,
	BundleProgress,
	DeployToS3Progress,
} from '../../helpers/progress-bar';
import {
	makeBucketProgress,
	makeBundleProgress,
	makeDeployProgressBar,
} from '../../helpers/progress-bar';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const SITES_CREATE_SUBCOMMAND = 'create';

export const sitesCreateSubcommand = async (args: string[]) => {
	const fileName = args[0];
	if (!fileName) {
		Log.error('No entry file passed.');
		Log.info(
			'Pass an additional argument specifying the entry file of your Remotion project:'
		);
		Log.info();
		Log.info(`${BINARY_NAME} deploy <entry-file.ts>`);
		quit(1);
	}

	const absoluteFile = path.resolve(process.cwd(), fileName);
	if (!existsSync(absoluteFile)) {
		Log.error(
			`No file exists at ${absoluteFile}. Make sure the path exists and try again.`
		);
		quit(1);
	}

	const needsToBundle = !(await stat(absoluteFile)).isDirectory();
	if (!needsToBundle) {
		Log.warn(
			"Uploading a pre-bundled directory. Make sure it was bundled with the correct 'publicPath'."
		);
	}

	const desiredSiteName = parsedLambdaCli['site-name'] ?? undefined;
	if (desiredSiteName !== undefined) {
		validateSiteName(desiredSiteName);
	}

	const progressBar = CliInternals.createOverwriteableCliOutput(
		CliInternals.quietFlagProvided()
	);

	const steps = needsToBundle ? 3 : 2;

	const multiProgress: {
		bundleProgress: BundleProgress;
		bucketProgress: BucketCreationProgress;
		deployProgress: DeployToS3Progress;
	} = {
		bundleProgress: {
			doneIn: null,
			progress: 0,
		},
		bucketProgress: {
			bucketCreated: false,
			doneIn: null,
			websiteEnabled: false,
			steps,
			currentStep: steps - 1,
		},
		deployProgress: {
			doneIn: null,
			totalSize: null,
			sizeUploaded: 0,
			steps,
			currentStep: steps,
		},
	};

	const updateProgress = () => {
		progressBar.update(
			[
				needsToBundle ? makeBundleProgress(multiProgress.bundleProgress) : null,
				makeBucketProgress(multiProgress.bucketProgress),
				makeDeployProgressBar(multiProgress.deployProgress),
			]
				.filter(truthy)
				.join('\n')
		);
	};

	const bucketStart = Date.now();

	const prom = getOrCreateBucket({
		region: getAwsRegion(),
		onBucketEnsured: () => {
			multiProgress.bucketProgress.bucketCreated = true;
			updateProgress();
		},
	});

	const bundleStart = Date.now();
	const uploadStart = Date.now();

	const {serveUrl, siteName} = await deploySite({
		entryPoint: absoluteFile,
		siteName: desiredSiteName,
		bucketName: prom.then((p) => {
			multiProgress.bucketProgress.websiteEnabled = true;
			multiProgress.bucketProgress.doneIn = Date.now() - bucketStart;
			updateProgress();
			return p.bucketName;
		}),

		options: {
			onBundleProgress: (progress: number) => {
				multiProgress.bundleProgress = {
					progress,
					doneIn: progress === 100 ? Date.now() - bundleStart : null,
				};
			},
			onUploadProgress: (p) => {
				multiProgress.deployProgress = {
					...multiProgress.deployProgress,
					sizeUploaded: p.sizeUploaded,
					totalSize: p.totalSize,
					doneIn: null,
				};
				updateProgress();
			},
			enableCaching: ConfigInternals.getWebpackCaching(),
			webpackOverride: ConfigInternals.getWebpackOverrideFn() ?? ((f) => f),
		},
		region: getAwsRegion(),
	});
	const uploadDuration = Date.now() - uploadStart;
	multiProgress.deployProgress = {
		...multiProgress.deployProgress,
		sizeUploaded: 1,
		totalSize: 1,
		doneIn: uploadDuration,
	};
	updateProgress();

	Log.info();
	Log.info();
	Log.info('Deployed to S3!');

	Log.info(`Serve URL: ${serveUrl}`);
	Log.info(`Site Name: ${siteName}`);
};
