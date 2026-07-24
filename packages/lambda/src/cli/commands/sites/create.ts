import fs from 'node:fs';
import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import {AwsProvider} from '@remotion/lambda-client';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ProviderSpecifics} from '@remotion/serverless';
import {internalGetOrCreateBucket, type Privacy} from '@remotion/serverless';
import {NoReactInternals} from 'remotion/no-react';
import {internalDeploySiteFromBundle} from '../../../api/deploy-site-from-bundle';
import {awsFullClientSpecifics} from '../../../functions/full-client-implementation';
import {LambdaInternals} from '../../../internals';
import {validateBundleDir} from '../../../shared/validate-bundle-dir';
import {validateSiteName} from '../../../shared/validate-site-name';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import type {
	BucketCreationProgress,
	BundleProgress,
	DeployToS3Progress,
	DiffingProgress,
} from '../../helpers/progress-bar';
import {
	makeBucketProgress,
	makeBundleProgress,
	makeDeployProgressBar,
	makeDiffingProgressBar,
} from '../../helpers/progress-bar';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {resolveBundleDirectory} from './resolve-bundle-directory';

export const SITES_CREATE_SUBCOMMAND = 'create';

const {
	folderExpiryOption,
	publicDirOption,
	throwIfSiteExistsOption,
	disableGitSourceOption,
	askAIOption,
	keyboardShortcutsOption,
} = BrowserSafeApis.options;

export const sitesCreateSubcommand = async (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
	implementation: ProviderSpecifics<AwsProvider>,
) => {
	const siteInput = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
		? {
				file: resolveBundleDirectory({
					bundleDir: args[0],
					remotionRoot,
					currentWorkingDirectory: process.cwd(),
				}),
				reason: args[0] ? 'argument passed' : 'default build directory',
			}
		: CliInternals.findEntryPoint({
				args,
				remotionRoot,
				logLevel,
				allowDirectory: true,
			});
	const {file, reason} = siteInput;
	if (
		args[0] &&
		reason !== 'argument passed' &&
		reason !== 'argument passed - found in cwd' &&
		reason !== 'argument passed - found in root'
	) {
		throw new Error(`The specified site input ${args[0]} was not found.`);
	}

	if (!file) {
		Log.error(
			{indent: false, logLevel},
			'No entry file or bundle directory passed.',
		);
		Log.info(
			{indent: false, logLevel},
			'Pass an additional argument specifying the entry file or bundle directory:',
		);
		Log.info({indent: false, logLevel});
		Log.info(
			{indent: false, logLevel},
			`${BINARY_NAME} lambda sites create <entry-file.ts|bundle-directory>`,
		);
		quit(1);
		return;
	}

	const isBundleDirectory =
		NoReactInternals.ENABLE_V5_BREAKING_CHANGES ||
		(fs.existsSync(file) && fs.statSync(file).isDirectory());
	const bundleDir = isBundleDirectory ? validateBundleDir(file) : null;

	Log.verbose(
		{indent: false, logLevel},
		isBundleDirectory ? 'Bundle directory:' : 'Entry point:',
		file,
		'Reason:',
		reason,
	);

	const desiredSiteName = parsedLambdaCli['site-name'] ?? undefined;
	if (desiredSiteName !== undefined) {
		validateSiteName(desiredSiteName);
	}

	const progressBar = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		// No browser logs
		updatesDontOverwrite: false,
		indent: false,
		logLevel,
	});

	const multiProgress: {
		bundleProgress: BundleProgress;
		bucketProgress: BucketCreationProgress;
		deployProgress: DeployToS3Progress;
		diffingProgress: DiffingProgress;
	} = {
		bundleProgress: {
			doneIn: null,
			progress: 0,
		},
		bucketProgress: {
			doneIn: null,
		},
		deployProgress: {
			doneIn: null,
			totalSize: null,
			sizeUploaded: 0,
			stats: null,
		},
		diffingProgress: {
			doneIn: null,
			bytesProcessed: 0,
		},
	};

	const updateProgress = (newLine: boolean) => {
		progressBar.update(
			[
				isBundleDirectory
					? null
					: makeBundleProgress(multiProgress.bundleProgress),
				makeBucketProgress(multiProgress.bucketProgress),
				makeDiffingProgressBar(multiProgress.diffingProgress),
				makeDeployProgressBar(multiProgress.deployProgress),
			]
				.filter(NoReactInternals.truthy)
				.join('\n'),
			newLine,
		);
	};

	const bucketStart = Date.now();

	const enableFolderExpiry = folderExpiryOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const cliBucketName = parsedLambdaCli['force-bucket-name'] ?? null;
	const bucketName =
		cliBucketName ??
		(
			await internalGetOrCreateBucket({
				region: getAwsRegion(),
				enableFolderExpiry,
				customCredentials: null,
				providerSpecifics: implementation,
				forcePathStyle: false,
				skipPutAcl: parsedLambdaCli.privacy === 'no-acl',
				requestHandler: null,
				logLevel,
			})
		).bucketName;

	multiProgress.bucketProgress.doneIn = Date.now() - bucketStart;
	updateProgress(false);

	const operationStart = Date.now();
	let uploadStart = operationStart;
	const throwIfSiteExists = throwIfSiteExistsOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const siteNameToDeploy = desiredSiteName ?? implementation.randomHash();
	const region = getAwsRegion();
	const privacy =
		(parsedLambdaCli.privacy as Exclude<Privacy, 'private'>) ?? 'public';
	const forcePathStyle = parsedLambdaCli['force-path-style'] ?? false;
	const bypassBucketNameValidation = Boolean(
		parsedLambdaCli['force-bucket-name'],
	);
	const onDiffingProgress = (bytes: number, done: boolean) => {
		const previous = multiProgress.diffingProgress.bytesProcessed;
		const newBytes = bytes - previous;
		if (newBytes > 100_000_000 || done) {
			multiProgress.diffingProgress = {
				bytesProcessed: bytes,
				doneIn: done ? Date.now() - operationStart : null,
			};
			updateProgress(false);
		}
	};
	const onUploadProgress = (p: {sizeUploaded: number; totalSize: number}) => {
		multiProgress.deployProgress = {
			sizeUploaded: p.sizeUploaded,
			totalSize: p.totalSize,
			doneIn: null,
			stats: null,
		};
		updateProgress(false);
	};

	const {serveUrl, siteName, stats} = bundleDir
		? await internalDeploySiteFromBundle({
				bundleDir,
				siteName: siteNameToDeploy,
				bucketName,
				options: {
					onDiffingProgress,
					onUploadProgress,
					bypassBucketNameValidation,
				},
				region,
				privacy,
				indent: false,
				logLevel,
				throwIfSiteExists,
				providerSpecifics: implementation,
				forcePathStyle,
				fullClientSpecifics: awsFullClientSpecifics,
				requestHandler: null,
			})
		: await LambdaInternals.internalDeploySite({
				entryPoint: file,
				siteName: siteNameToDeploy,
				bucketName,
				options: {
					publicDir: publicDirOption.getValue({
						commandLine: CliInternals.parsedCli,
					}).value,
					rootDir: remotionRoot,
					onBundleProgress: (progress: number) => {
						multiProgress.bundleProgress = {
							progress,
							doneIn: progress === 100 ? Date.now() - operationStart : null,
						};
						if (progress === 100) {
							uploadStart = Date.now();
						}

						updateProgress(false);
					},
					onDiffingProgress,
					onUploadProgress,
					enableCaching: BrowserSafeApis.options.bundleCacheOption.getValue({
						commandLine: CliInternals.parsedCli,
					}).value,
					bundlerOverride: ConfigInternals.getBundlerOverrideFn(),
					rspackOverride: ConfigInternals.getRspackOverrideFn(),
					webpackOverride: ConfigInternals.getWebpackOverrideFn() ?? ((f) => f),
					bypassBucketNameValidation,
					askAIEnabled: askAIOption.getValue({
						commandLine: CliInternals.parsedCli,
					}).value,
					keyboardShortcutsEnabled: keyboardShortcutsOption.getValue({
						commandLine: CliInternals.parsedCli,
					}).value,
				},
				region,
				privacy,
				gitSource: CliInternals.getGitSource({
					remotionRoot,
					disableGitSource: disableGitSourceOption.getValue({
						commandLine: CliInternals.parsedCli,
					}).value,
					logLevel,
				}),
				indent: false,
				logLevel,
				throwIfSiteExists,
				providerSpecifics: implementation,
				forcePathStyle,
				fullClientSpecifics: awsFullClientSpecifics,
				requestHandler: null,
			});

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
	updateProgress(true);

	CliInternals.printFact('info')({
		indent: false,
		left: 'Serve URL',
		logLevel,
		right: serveUrl,
		color: 'blueBright',
	});
	CliInternals.printFact('info')({
		indent: false,
		left: 'Site name',
		logLevel,
		right: siteName,
		color: 'blueBright',
	});

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.blueBright(
			'ℹ️   Redeploy your site everytime you make changes to it. You can overwrite the existing site by running:',
		),
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.blueBright(
			[
				'npx remotion lambda sites create',
				args[0] ?? (isBundleDirectory ? './build' : null),
				`--site-name=${siteName}`,
			]
				.filter(NoReactInternals.truthy)
				.join(' '),
		),
	);
};
