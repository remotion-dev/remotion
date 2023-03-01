import {CliInternals, ConfigInternals} from '@remotion/cli';
import {existsSync, lstatSync} from 'fs';
import {Internals} from 'remotion';
import {deploySite} from '../../../api/deploy-site';
import {getOrCreateBucket} from '../../../api/get-or-create-bucket';
import {BINARY_NAME} from '../../../shared/constants';
import {validateSiteName} from '../../../shared/validate-site-name';
import {parsedGcpCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import type {
	BucketCreationProgress,
	BundleProgress,
	DeployToStorageProgress,
} from '../../helpers/progress-bar';
import {
	makeBucketProgress,
	makeBundleProgress,
	makeDeployProgressBar,
} from '../../helpers/progress-bar';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const SITES_CREATE_SUBCOMMAND = 'create';

export const sitesCreateSubcommand = async (
	args: string[],
	remotionRoot: string
) => {
	const {file, reason} = CliInternals.findEntryPoint(args, remotionRoot);
	if (!file) {
		Log.error('No entry file passed.');
		Log.info(
			'Pass an additional argument specifying the entry file of your Remotion project:'
		);
		Log.info();
		Log.info(`${BINARY_NAME} deploy <entry-file.ts>`);
		quit(1);
		return;
	}

	Log.verbose('Entry point:', file, 'Reason:', reason);

	if (!existsSync(file)) {
		Log.error(
			`No file exists at ${file}. Make sure the path exists and try again.`
		);
		quit(1);
	}

	if (lstatSync(file).isDirectory()) {
		Log.error(
			`You passed a path ${file} but it is a directory. Pass a file instead.`
		);
		quit(1);
	}

	const desiredSiteName = parsedGcpCli['site-name'] ?? undefined;
	if (desiredSiteName !== undefined) {
		validateSiteName(desiredSiteName);
	}

	const progressBar = CliInternals.createOverwriteableCliOutput(
		CliInternals.quietFlagProvided()
	);

	const multiProgress: {
		bundleProgress: BundleProgress;
		bucketProgress: BucketCreationProgress;
		deployProgress: DeployToStorageProgress;
	} = {
		bundleProgress: {
			doneIn: null,
			progress: 0,
		},
		bucketProgress: {
			bucketCreated: false,
			doneIn: null,
		},
		deployProgress: {
			doneIn: null,
			totalSize: null,
			sizeUploaded: 0,
			stats: null,
		},
	};

	const updateProgress = () => {
		progressBar.update(
			[
				makeBundleProgress(multiProgress.bundleProgress),
				makeBucketProgress(multiProgress.bucketProgress),
				makeDeployProgressBar(multiProgress.deployProgress),
			].join('\n')
		);
	};

	const bucketStart = Date.now();

	const {bucketName} = await getOrCreateBucket({
		region: getGcpRegion(),
		onBucketEnsured: () => {
			multiProgress.bucketProgress.bucketCreated = true;
			updateProgress();
		},
	});

	multiProgress.bucketProgress.doneIn = Date.now() - bucketStart;
	updateProgress();

	const bundleStart = Date.now();

	const {serveUrl, siteName, stats} = await deploySite({
		entryPoint: file,
		siteName: desiredSiteName,
		bucketName,
		options: {
			onBundleProgress: (progress: number) => {
				multiProgress.bundleProgress = {
					progress,
					doneIn: progress === 100 ? Date.now() - bundleStart : null,
				};
			},
			onUploadProgress: (p) => {
				multiProgress.deployProgress = {
					sizeUploaded: p.sizeUploaded,
					totalSize: p.totalSize,
					doneIn: null,
					stats: null,
				};
				updateProgress();
			},
			enableCaching: ConfigInternals.getWebpackCaching(),
			webpackOverride: ConfigInternals.getWebpackOverrideFn() ?? ((f) => f),
		},
	});

	updateProgress();

	const uploadStart = Date.now();

	const uploadDuration = Date.now() - uploadStart;
	multiProgress.deployProgress = {
		sizeUploaded: 1,
		totalSize: 1,
		doneIn: uploadDuration,
		stats: {
			addedFiles: stats.uploadedFiles,
			removedFiles: stats.deletedFiles,
			untouchedFiles: stats.untouchedFiles,
		},
	};
	updateProgress();

	Log.info();
	Log.info();
	Log.info('Deployed to GCP Storage!');

	Log.info(`Serve URL: ${serveUrl}`);
	Log.info(`Site Name: ${siteName}`);

	Log.info();
	Log.info(
		CliInternals.chalk.blueBright(
			'ℹ️ If you make changes to your code, you need to redeploy the site. You can overwrite the existing site by running:'
		)
	);
	Log.info(
		CliInternals.chalk.blueBright(
			['npx remotion gcp sites create', args[0], `--site-name=${siteName}`]
				.filter(Internals.truthy)
				.join(' ')
		)
	);
};
