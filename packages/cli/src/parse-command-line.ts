import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {Config} from './config';
import {Log} from './log';
import {parsedCli} from './parsed-cli';

/**
 * Returns the set of all known CLI flag names, derived from the AnyRemotionOption
 * registry plus a small set of aliases that minimist expands for us.
 */
const getKnownCliFlags = (): Set<string> => {
	const flags = new Set<string>(
		Object.values(BrowserSafeApis.options).map(
			(opt) => (opt as {cliFlag: string}).cliFlag,
		),
	);

	// `-q` is a single-letter alias for `--quiet` recognised by minimist.
	// It is not its own AnyRemotionOption entry, so we add it explicitly.
	flags.add('q');

	return flags;
};

export const warnAboutUnknownFlags = (logLevel: LogLevel) => {
	const knownFlags = getKnownCliFlags();

	const unknownFlags = Object.keys(parsedCli)
		// `_` holds positional arguments, not flags
		.filter((key) => key !== '_')
		.filter((key) => !knownFlags.has(key));

	for (const flag of unknownFlags) {
		Log.warn(
			{indent: false, logLevel},
			`Warning: Unknown CLI flag "--${flag}" was passed and will be ignored. Check for typos.`,
		);
	}
};

export const parseCommandLine = () => {
	if (parsedCli[BrowserSafeApis.options.pngOption.cliFlag]) {
		throw new Error(
			'The --png flag has been removed. Use --sequence --image-format=png from now on.',
		);
	}

	const licenseKey =
		parsedCli[BrowserSafeApis.options.licenseKeyOption.cliFlag];
	if (licenseKey && licenseKey.startsWith('rm_pub_')) {
		Config.setPublicLicenseKey(licenseKey);
	}
};
