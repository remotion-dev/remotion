import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {
	CLOUD_RUN_DEPLOY_SUBCOMMAND,
	CLOUDRUN_BINARY_NAME,
	PERMISSIONS_COMMAND,
	REGIONS_COMMAND,
	RENDER_COMMAND,
	SERVICES_COMMAND,
	SERVICES_LS_SUBCOMMAND,
	SERVICES_RM_SUBCOMMAND,
	SERVICES_RMALL_SUBCOMMAND,
	SITES_COMMAND,
	SITES_CREATE_SUBCOMMAND,
	SITES_LS_SUBCOMMAND,
	SITES_RM_COMMAND,
	SITES_RMALL_COMMAND,
	STILL_COMMAND,
} from './commands/command-names';

const packagejson = require('../../package.json');

const rendererOptions = Object.values(BrowserSafeApis.options);

const cloudrunOnlyOptions = {
	region: {
		flag: '--region <region>',
		description: 'Select the GCP region.',
	},
	privacy: {
		flag: '--privacy <public|private|no-acl>',
		description: 'Set the privacy of the rendered output.',
	},
	'force-bucket-name': {
		flag: '--force-bucket-name <bucket-name>',
		description: 'Store the output in a specific Cloud Storage bucket.',
	},
	'out-name': {
		flag: '--out-name <file-name>',
		description: 'Set the output file name in Cloud Storage.',
	},
	'cloud-run-url': {
		flag: '--cloud-run-url <url>',
		description: 'Use a specific Cloud Run service URL.',
	},
	'service-name': {
		flag: '--service-name <service-name>',
		description: 'Use a specific deployed Cloud Run service.',
	},
	webhook: {
		flag: '--webhook <url>',
		description: 'POST render progress to this URL.',
	},
	'render-id-override': {
		flag: '--render-id-override <id>',
		description: 'Use a specific render ID.',
	},
	memoryLimit: {
		flag: '--memoryLimit <limit>',
		description: 'Set the maximum memory available to each service instance.',
	},
	cpuLimit: {
		flag: '--cpuLimit <limit>',
		description: 'Set the maximum CPU available to each service instance.',
	},
	minInstances: {
		flag: '--minInstances <count>',
		description: 'Set the minimum number of service instances.',
	},
	maxInstances: {
		flag: '--maxInstances <count>',
		description: 'Set the maximum number of service instances.',
	},
	timeoutSeconds: {
		flag: '--timeoutSeconds <seconds>',
		description: 'Set the request timeout for the service.',
	},
	onlyAllocateCpuDuringRequestProcessing: {
		flag: '--onlyAllocateCpuDuringRequestProcessing',
		description: 'Allocate CPU only while a request is being processed.',
	},
	quiet: {
		flag: '--quiet, -q',
		description: 'Reduce console output.',
	},
	force: {
		flag: '--force, -f',
		description: 'Skip deletion confirmation prompts.',
	},
	yes: {
		flag: '--yes, -y',
		description: 'Skip deletion confirmation prompts.',
	},
	'site-name': {
		flag: '--site-name <name>',
		description: 'Set the deployed site name.',
	},
	'all-regions': {
		flag: '--all-regions',
		description: 'Include sites from every region.',
	},
} as const;

const options = (
	flags: readonly string[],
	descriptionOverrides: Record<string, string> = {},
) => {
	return flags.map((flag) => {
		const cloudrunOnlyOption =
			cloudrunOnlyOptions[flag as keyof typeof cloudrunOnlyOptions];
		if (cloudrunOnlyOption) {
			return {
				...cloudrunOnlyOption,
				description:
					descriptionOverrides[flag] ?? cloudrunOnlyOption.description,
			};
		}

		const rendererOption = rendererOptions.find(
			(candidate) => candidate.cliFlag === flag,
		);
		if (!rendererOption) {
			throw new Error(`No Cloud Run CLI help metadata exists for --${flag}`);
		}

		return CliInternals.makeCommandHelpOption({
			option: rendererOption,
			description: descriptionOverrides[flag],
		});
	});
};

const renderOptions = options(
	[
		'region',
		'props',
		'privacy',
		'force-bucket-name',
		'concurrency',
		'height',
		'width',
		'fps',
		'duration',
		'jpeg-quality',
		'image-format',
		'scale',
		'env-file',
		'out-name',
		'cloud-run-url',
		'service-name',
		'codec',
		'audio-codec',
		'audio-bitrate',
		'video-bitrate',
		'buffer-size',
		'max-rate',
		'webhook',
		'render-id-override',
		'prores-profile',
		'x264-preset',
		'gop',
		'crf',
		'pixel-format',
		'every-nth-frame',
		'number-of-gif-loops',
		'frames',
		'browser-executable',
		'user-agent',
		'disable-web-security',
		'ignore-certificate-errors',
		'enable-multiprocess-on-linux',
		'gl',
		'disable-headless',
		'dark-mode',
		'config',
		'port',
		'timeout',
		'binaries-directory',
		'muted',
		'enforce-audio-track',
		'quiet',
		'media-cache-size-in-bytes',
		'offthreadvideo-cache-size-in-bytes',
		'offthreadvideo-video-threads',
		'color-space',
		'metadata',
		'sample-rate',
	],
	{
		'image-format': 'Video Image Format',
		port: 'Set the local server port when no composition ID is passed.',
	},
);

const commandHelp = [
	{
		path: [],
		args: ' <command>',
		description: 'Control Remotion Cloud Run.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli',
		options: [],
	},
	{
		path: [RENDER_COMMAND],
		args: ' <serve-url|site-name> [<composition-id>] [<output-location>]',
		description: 'Render Remotion media on GCP Cloud Run.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/render',
		options: renderOptions,
	},
	{
		path: [STILL_COMMAND],
		args: ' <serve-url|site-name> [<still-id>] [<output-location>]',
		description: 'Render a Remotion still on GCP Cloud Run.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/still',
		options: options(
			[
				'region',
				'props',
				'frame',
				'privacy',
				'force-bucket-name',
				'height',
				'width',
				'fps',
				'duration',
				'jpeg-quality',
				'image-format',
				'scale',
				'env-file',
				'out-name',
				'cloud-run-url',
				'service-name',
				'browser-executable',
				'user-agent',
				'disable-web-security',
				'ignore-certificate-errors',
				'enable-multiprocess-on-linux',
				'gl',
				'disable-headless',
				'dark-mode',
				'config',
				'port',
				'timeout',
				'binaries-directory',
				'quiet',
				'media-cache-size-in-bytes',
				'offthreadvideo-cache-size-in-bytes',
			],
			{
				port: 'Set the local server port when no composition ID is passed.',
			},
		),
	},
	{
		path: [SERVICES_COMMAND],
		args: ' <command>',
		description: 'Deploy and manage Cloud Run services on GCP.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/services',
		options: [],
	},
	{
		path: [SERVICES_COMMAND, CLOUD_RUN_DEPLOY_SUBCOMMAND],
		args: '',
		description: 'Deploy a new Cloud Run service.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/services/deploy',
		options: options([
			'region',
			'memoryLimit',
			'cpuLimit',
			'minInstances',
			'maxInstances',
			'timeoutSeconds',
			'onlyAllocateCpuDuringRequestProcessing',
			'quiet',
		]),
	},
	{
		path: [SERVICES_COMMAND, SERVICES_LS_SUBCOMMAND],
		args: '',
		description: 'List deployed Cloud Run services.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/services/ls',
		options: options(['region', 'quiet']),
	},
	{
		path: [SERVICES_COMMAND, SERVICES_RM_SUBCOMMAND],
		args: ' <service-name...>',
		description: 'Delete one or more Cloud Run services.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/services/rm',
		options: options(['region', 'yes', 'force', 'quiet']),
	},
	{
		path: [SERVICES_COMMAND, SERVICES_RMALL_SUBCOMMAND],
		args: '',
		description: 'Delete all Cloud Run services in the selected region.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/services/rmall',
		options: options(['region', 'yes', 'force', 'quiet']),
	},
	{
		path: [SITES_COMMAND],
		args: ' <command>',
		description: 'Deploy and manage Remotion projects.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/sites',
		options: [],
	},
	{
		path: [SITES_COMMAND, SITES_CREATE_SUBCOMMAND],
		args: ' <entry-point>?',
		description: 'Bundle and upload a Remotion project.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/sites/create',
		options: options(
			[
				'region',
				'site-name',
				'privacy',
				'config',
				'disable-git-source',
				'bundle-cache',
				'rspack',
				'disable-ask-ai',
				'disable-keyboard-shortcuts',
				'quiet',
			],
			{
				privacy: 'Set the privacy of the deployed site.',
			},
		),
	},
	{
		path: [SITES_COMMAND, SITES_LS_SUBCOMMAND],
		args: '',
		description: 'List deployed Remotion projects.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/sites/ls',
		options: options(['region', 'all-regions', 'quiet']),
	},
	{
		path: [SITES_COMMAND, SITES_RM_COMMAND],
		args: ' <site-name...>',
		description: 'Delete one or more deployed Remotion projects.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/sites/rm',
		options: options(['region', 'yes', 'force', 'quiet']),
	},
	{
		path: [SITES_COMMAND, SITES_RMALL_COMMAND],
		args: '',
		description: 'Delete all deployed Remotion projects.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/sites/rmall',
		options: options(['region', 'all-regions', 'yes', 'force']),
	},
	{
		path: [PERMISSIONS_COMMAND],
		args: '',
		description: 'View and validate required GCP permissions.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/permissions',
		options: [],
	},
	{
		path: [REGIONS_COMMAND],
		args: '',
		description: 'Show the supported GCP regions.',
		documentation: 'https://www.remotion.dev/docs/cloudrun/cli/regions',
		options: [],
	},
] as const;

export const getCloudrunHelp = (selectedPath: readonly string[]) => {
	return CliInternals.getCommandHelp({
		binaryName: CLOUDRUN_BINARY_NAME,
		commands: commandHelp,
		selectedPath,
		rootDocumentation: 'https://www.remotion.dev/docs/cloudrun/cli',
	});
};

export const printHelp = (
	selectedPath: readonly string[],
	logLevel: LogLevel,
) => {
	if (selectedPath.length === 0) {
		CliInternals.Log.info(
			{indent: false, logLevel},
			`${CLOUDRUN_BINARY_NAME} ${
				packagejson.version
			} © ${new Date().getFullYear()} The Remotion developers`,
		);
	}

	const lines = getCloudrunHelp(selectedPath);
	for (const line of selectedPath.length === 0 ? lines : lines.slice(1)) {
		CliInternals.Log.info({indent: false, logLevel}, line);
	}
};
