import {BrowserSafeApis} from '@remotion/renderer/client';
import minimist from 'minimist';
import type {CommandLineOptions} from './parse-command-line';

export const BooleanFlags = [
	'overwrite',
	'force',
	'sequence',
	'help',
	'quiet',
	'q',
	'muted',
	BrowserSafeApis.options.enforceAudioOption.cliFlag,
	// Lambda flags
	'force',
	'disable-chunk-optimization',
	'save-browser-logs',
	'disable-cloudwatch',
	'enable-lambda-insights',
	'yes',
	'y',
	'disable-web-security',
	'ignore-certificate-errors',
	'disable-headless',
	'disable-keyboard-shortcuts',
	'default-only',
	'no-open',
	'ipv4',
	BrowserSafeApis.options.beepOnFinishOption.cliFlag,
	'repro',
	'compatible-only',
];

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2), {
	boolean: BooleanFlags,
	default: {
		overwrite: true,
	},
}) as CommandLineOptions & {
	_: string[];
};

export const quietFlagProvided = () => parsedCli.quiet || parsedCli.q;
