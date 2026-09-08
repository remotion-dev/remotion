import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {
	COMPOSITIONS_COMMAND,
	FUNCTIONS_COMMAND,
	POLICIES_COMMAND,
	QUOTAS_COMMAND,
	REGIONS_COMMAND,
	RENDER_COMMAND,
	SITES_COMMAND,
	STILL_COMMAND,
} from './commands/command-names';

const packagejson = require('../../package.json');
const rendererOptions = Object.values(BrowserSafeApis.options);

type HelpOption = ReturnType<typeof CliInternals.makeCommandHelpOption>;
export type PrintHelp = (
	selectedPath: readonly string[],
	logLevel: LogLevel,
) => void;

const lambdaOptions: Record<string, HelpOption> = {
	region: {flag: '--region <region>', description: 'AWS region to use.'},
	privacy: {
		flag: '--privacy <public|private|no-acl>',
		description: 'Set the privacy of the rendered output.',
	},
	'site-privacy': {
		flag: '--privacy <public|no-acl>',
		description: 'Set the privacy of the deployed site.',
	},
	'max-retries': {
		flag: '--max-retries <count>',
		description: 'Set how many times a failed chunk may be retried.',
	},
	'frames-per-lambda': {
		flag: '--frames-per-lambda <count>',
		description: 'Set the number of frames rendered per Lambda invocation.',
	},
	'concurrency-per-lambda': {
		flag: '--concurrency-per-lambda <count>',
		description: 'Set the concurrency within each Lambda invocation.',
	},
	'out-name': {
		flag: '--out-name <key>',
		description: 'Set the S3 key of the rendered output.',
	},
	's3-output-provider-endpoint': {
		flag: '--s3-output-provider-endpoint <url>',
		description: 'Use a custom S3-compatible endpoint for the output.',
	},
	's3-output-provider-region': {
		flag: '--s3-output-provider-region <region>',
		description: 'Set the region of the custom S3 output provider.',
	},
	's3-output-provider-force-path-style': {
		flag: '--s3-output-provider-force-path-style',
		description: 'Use path-style URLs for the custom S3 output provider.',
	},
	webhook: {
		flag: '--webhook <url>',
		description: 'Call a webhook when the render finishes.',
	},
	'webhook-secret': {
		flag: '--webhook-secret <secret>',
		description: 'Sign webhook requests with a secret.',
	},
	'function-name': {
		flag: '--function-name <name>',
		description: 'Use a specific Lambda function.',
	},
	'renderer-function-name': {
		flag: '--renderer-function-name <name>',
		description: 'Use a specific renderer Lambda function.',
	},
	'force-bucket-name': {
		flag: '--force-bucket-name <name>',
		description: 'Use a specific S3 bucket.',
	},
	'force-path-style': {
		flag: '--force-path-style',
		description: 'Use path-style S3 URLs.',
	},
	'storage-class': {
		flag: '--storage-class <class>',
		description: 'Set the S3 storage class of the output.',
	},
	memory: {
		flag: '--memory <megabytes>',
		description: 'Set the memory size of the Lambda function.',
	},
	disk: {
		flag: '--disk <megabytes>',
		description: 'Set the ephemeral disk size of the Lambda function.',
	},
	'retention-period': {
		flag: '--retention-period <days>',
		description: 'Set the CloudWatch log retention period.',
	},
	'disable-cloudwatch': {
		flag: '--disable-cloudwatch',
		description: 'Disable CloudWatch logging.',
	},
	'custom-role-arn': {
		flag: '--custom-role-arn <arn>',
		description: 'Use a custom IAM role.',
	},
	'custom-layer-arns': {
		flag: '--custom-layer-arns <arns>',
		description: 'Attach custom Lambda layers.',
	},
	'vpc-subnet-ids': {
		flag: '--vpc-subnet-ids <ids>',
		description: 'Attach the function to VPC subnets.',
	},
	'vpc-security-group-ids': {
		flag: '--vpc-security-group-ids <ids>',
		description: 'Attach VPC security groups to the function.',
	},
	'runtime-preference': {
		flag: '--runtime-preference <default|apple-emojis|cjk>',
		description: 'Choose the bundled font and emoji runtime.',
	},
	'function-timeout': {
		flag: '--timeout <seconds>',
		description: 'Set the Lambda function timeout.',
	},
	'compatible-only': {
		flag: '--compatible-only',
		description: 'Only list resources compatible with this version.',
	},
	'--yes': {
		flag: '--yes, -y',
		description: 'Skip the confirmation prompt.',
	},
	'--force': {
		flag: '--force, -f',
		description: 'Force the requested operation.',
	},
	'site-name': {
		flag: '--site-name <name>',
		description: 'Set the deployed site name.',
	},
	'default-only': {
		flag: '--default-only',
		description: 'Only show default AWS regions.',
	},
	quiet: {flag: '--quiet, -q', description: 'Reduce console output.'},
};

const options = (
	flags: readonly string[],
	descriptionOverrides: Record<string, string> = {},
): HelpOption[] => {
	return flags.map((flag) => {
		const lambdaOption = lambdaOptions[flag];
		if (lambdaOption) {
			return lambdaOption;
		}

		const rendererOption = rendererOptions.find(
			(candidate) => candidate.cliFlag === flag,
		);
		if (!rendererOption) {
			throw new Error(`No Lambda CLI help metadata exists for --${flag}`);
		}

		return CliInternals.makeCommandHelpOption({
			option: rendererOption,
			description: descriptionOverrides[flag],
		});
	});
};

const commandHelp = [
	{
		path: [],
		args: ' <command>',
		description: 'Control Remotion Lambda.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli',
		options: [],
	},
	{
		path: [RENDER_COMMAND],
		args: ' <serve-url> [<composition-id>] [<output-location>]',
		description: 'Render a video in the cloud.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/render',
		options: options(
			[
				'region',
				'enable-cancellation',
				'props',
				'config',
				'port',
				'log',
				'privacy',
				'max-retries',
				'frames-per-lambda',
				'concurrency',
				'concurrency-per-lambda',
				'jpeg-quality',
				'muted',
				'codec',
				'audio-codec',
				'audio-bitrate',
				'video-bitrate',
				'buffer-size',
				'max-rate',
				'prores-profile',
				'x264-preset',
				'gop',
				'crf',
				'pixel-format',
				'image-format',
				'scale',
				'env-file',
				'frames',
				'every-nth-frame',
				'number-of-gif-loops',
				'timeout',
				'out-name',
				's3-output-provider-endpoint',
				's3-output-provider-region',
				's3-output-provider-force-path-style',
				'overwrite',
				'webhook',
				'webhook-secret',
				'height',
				'width',
				'fps',
				'duration',
				'function-name',
				'renderer-function-name',
				'force-bucket-name',
				'browser-executable',
				'ignore-certificate-errors',
				'disable-web-security',
				'disable-headless',
				'dark-mode',
				'gl',
				'enable-multiprocess-on-linux',
				'user-agent',
				'media-cache-size-in-bytes',
				'offthreadvideo-cache-size-in-bytes',
				'offthreadvideo-video-threads',
				'delete-after',
				'webhook-custom-data',
				'color-space',
				'prefer-lossless',
				'metadata',
				'sample-rate',
				'force-path-style',
				'storage-class',
				'license-key',
				'is-production',
				'binaries-directory',
				'quiet',
			],
			{
				'image-format': 'Video Image Format',
				port: 'Set a custom port when selecting a composition interactively.',
			},
		),
	},
	{
		path: [STILL_COMMAND],
		args: ' <serve-url> [<composition-id>] [<output-location>]',
		description: 'Render a still image in the cloud.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/still',
		options: options(
			[
				'frame',
				'region',
				'props',
				'config',
				'port',
				'env-file',
				'scale',
				'log',
				'privacy',
				'max-retries',
				'out-name',
				's3-output-provider-endpoint',
				's3-output-provider-region',
				's3-output-provider-force-path-style',
				'image-format',
				'jpeg-quality',
				'timeout',
				'height',
				'width',
				'fps',
				'duration',
				'function-name',
				'force-bucket-name',
				'browser-executable',
				'ignore-certificate-errors',
				'disable-web-security',
				'disable-headless',
				'dark-mode',
				'gl',
				'enable-multiprocess-on-linux',
				'user-agent',
				'media-cache-size-in-bytes',
				'offthreadvideo-cache-size-in-bytes',
				'offthreadvideo-video-threads',
				'delete-after',
				'force-path-style',
				'storage-class',
				'license-key',
				'is-production',
				'binaries-directory',
				'quiet',
			],
			{
				port: 'Set a custom port when selecting a composition interactively.',
			},
		),
	},
	{
		path: [COMPOSITIONS_COMMAND],
		args: ' <serve-url>',
		description: 'Print composition IDs from a serve URL.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/compositions',
		options: options([
			'region',
			'function-name',
			'props',
			'config',
			'env-file',
			'log',
			'timeout',
			'ignore-certificate-errors',
			'disable-web-security',
			'dark-mode',
			'disable-headless',
			'gl',
			'enable-multiprocess-on-linux',
			'quiet',
			'force-bucket-name',
			'user-agent',
		]),
	},
	{
		path: [FUNCTIONS_COMMAND],
		args: ' <command>',
		description: 'Deploy and manage AWS Lambda functions.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/functions',
		options: [],
	},
	{
		path: [FUNCTIONS_COMMAND, 'deploy'],
		args: '',
		description: 'Deploy a Lambda function.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/functions/deploy',
		options: options([
			'region',
			'memory',
			'disk',
			'function-timeout',
			'disable-cloudwatch',
			'retention-period',
			'enable-lambda-insights',
			'custom-role-arn',
			'custom-layer-arns',
			'quiet',
			'vpc-subnet-ids',
			'vpc-security-group-ids',
			'runtime-preference',
		]),
	},
	{
		path: [FUNCTIONS_COMMAND, 'ls'],
		args: '',
		description: 'List deployed Lambda functions.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/functions/ls',
		options: options(['compatible-only', 'region', 'quiet']),
	},
	{
		path: [FUNCTIONS_COMMAND, 'rm'],
		args: ' <function-name...>',
		description: 'Delete one or more Lambda functions.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/functions/rm',
		options: options(['region', '--yes', '--force', 'quiet']),
	},
	{
		path: [FUNCTIONS_COMMAND, 'rmall'],
		args: '',
		description: 'Delete all Lambda functions.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/functions/rmall',
		options: options(['region', '--yes', '--force', 'quiet']),
	},
	{
		path: [SITES_COMMAND],
		args: ' <command>',
		description: 'Deploy and manage Remotion projects.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/sites',
		options: [],
	},
	{
		path: [SITES_COMMAND, 'create'],
		args: ' [<entry-point>]',
		description: 'Deploy a Remotion project.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/sites/create',
		options: options([
			'region',
			'site-name',
			'force-bucket-name',
			'site-privacy',
			'config',
			'public-dir',
			'enable-folder-expiry',
			'throw-if-site-exists',
			'disable-git-source',
			'force-path-style',
			'bundle-cache',
			'rspack',
			'disable-ask-ai',
			'disable-keyboard-shortcuts',
			'quiet',
		]),
	},
	{
		path: [SITES_COMMAND, 'ls'],
		args: '',
		description: 'List deployed Remotion projects.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/sites/ls',
		options: options(['region', 'quiet', 'compatible-only']),
	},
	{
		path: [SITES_COMMAND, 'rm'],
		args: ' <site-id...>',
		description: 'Delete one or more Remotion projects.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/sites/rm',
		options: options(['region', '--yes', '--force', 'force-bucket-name']),
	},
	{
		path: [SITES_COMMAND, 'rmall'],
		args: '',
		description: 'Delete all Remotion projects.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/sites/rmall',
		options: options(['region', '--yes', '--force', 'force-bucket-name']),
	},
	{
		path: [POLICIES_COMMAND],
		args: ' <role | user | validate>',
		description: 'View and validate AWS policy files.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/policies',
		options: [],
	},
	{
		path: [POLICIES_COMMAND, 'role'],
		args: '',
		description: 'Print the required AWS role policy.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/policies',
		options: options(['region']),
	},
	{
		path: [POLICIES_COMMAND, 'user'],
		args: '',
		description: 'Print the required AWS user policy.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/policies',
		options: options(['region']),
	},
	{
		path: [POLICIES_COMMAND, 'validate'],
		args: '',
		description: 'Validate the current AWS policies.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/policies',
		options: options(['region']),
	},
	{
		path: [REGIONS_COMMAND],
		args: '',
		description: 'Show the supported AWS regions.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/regions',
		options: options(['default-only']),
	},
	{
		path: [QUOTAS_COMMAND],
		args: '',
		description: 'Show the AWS service quotas.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/quotas',
		options: options(['region']),
	},
	{
		path: [QUOTAS_COMMAND, 'increase'],
		args: '',
		description: 'Request an increase to the AWS service quotas.',
		documentation: 'https://www.remotion.dev/docs/lambda/cli/quotas',
		options: options(['region', '--yes', '--force']),
	},
] satisfies Parameters<typeof CliInternals.getCommandHelp>[0]['commands'];

export const getLambdaHelp = (selectedPath: readonly string[]) => {
	return CliInternals.getCommandHelp({
		binaryName: BINARY_NAME,
		commands: commandHelp,
		selectedPath,
		rootDocumentation: 'https://www.remotion.dev/docs/lambda/cli',
	});
};

export const printHelp: PrintHelp = (selectedPath, logLevel) => {
	if (selectedPath.length === 0) {
		CliInternals.Log.info(
			{indent: false, logLevel},
			`${BINARY_NAME} ${
				packagejson.version
			} © ${new Date().getFullYear()} The Remotion developers`,
		);
	}

	const lines = getLambdaHelp(selectedPath);
	for (const line of selectedPath.length === 0 ? lines : lines.slice(1)) {
		CliInternals.Log.info({indent: false, logLevel}, line);
	}
};
