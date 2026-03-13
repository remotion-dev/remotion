import {RenderInternals} from '@remotion/renderer';
import type {LogLevel} from '@remotion/renderer';
import {makeHyperlink} from '../../hyperlinks/make-link';

let warnedAboutPrettier = false;

export const warnAboutPrettierOnce = (logLevel: LogLevel) => {
	if (warnedAboutPrettier) {
		return;
	}

	warnedAboutPrettier = true;
	RenderInternals.Log.warn(
		{indent: false, logLevel},
		RenderInternals.chalk.yellow(
			'Could not format with Prettier. File will need to be formatted manually.',
		),
	);
};

const normalizeQuotes = (str: string): string => {
	if (
		str.length >= 2 &&
		((str.startsWith("'") && str.endsWith("'")) ||
			(str.startsWith('"') && str.endsWith('"')))
	) {
		return `'${str.slice(1, -1)}'`;
	}

	return str;
};

const formatValueChange = ({
	oldValueString,
	newValueString,
	defaultValueString,
}: {
	oldValueString: string;
	newValueString: string;
	defaultValueString: string | null;
}) => {
	// Changed to default value (prop gets deleted) → show only old value in red
	if (defaultValueString !== null && newValueString === defaultValueString) {
		return RenderInternals.chalk.red(oldValueString);
	}

	// Changed from default value (prop gets added) → show only new value in green
	if (defaultValueString !== null && oldValueString === defaultValueString) {
		return RenderInternals.chalk.green(newValueString);
	}

	return `${RenderInternals.chalk.red(oldValueString)} \u2192 ${RenderInternals.chalk.green(newValueString)}`;
};

const formatPropChange = ({
	key,
	oldValueString,
	newValueString,
	defaultValueString,
}: {
	key: string;
	oldValueString: string;
	newValueString: string;
	defaultValueString: string | null;
}) => {
	const isResetToDefault =
		defaultValueString !== null && newValueString === defaultValueString;
	const isChangeFromDefault =
		defaultValueString !== null && oldValueString === defaultValueString;

	const valueChange = formatValueChange({
		oldValueString,
		newValueString,
		defaultValueString,
	});

	const dotIndex = key.indexOf('.');
	if (dotIndex === -1) {
		if (isResetToDefault) {
			return RenderInternals.chalk.red(`${key}={${oldValueString}}`);
		}

		if (isChangeFromDefault) {
			return RenderInternals.chalk.green(`${key}={${newValueString}}`);
		}

		return `${key}={${valueChange}}`;
	}

	const parentKey = key.slice(0, dotIndex);
	const childKey = key.slice(dotIndex + 1);

	if (isResetToDefault) {
		return `${parentKey}={{${RenderInternals.chalk.red(`${childKey}: ${oldValueString}`)}}}`;
	}

	if (isChangeFromDefault) {
		return `${parentKey}={{${RenderInternals.chalk.green(`${childKey}: ${newValueString}`)}}}`;
	}

	return `${parentKey}={{${childKey}: ${valueChange}}}`;
};

export const logUpdate = ({
	absolutePath,
	fileRelativeToRoot,
	key,
	oldValueString,
	newValueString,
	defaultValueString,
	formatted,
	logLevel,
}: {
	absolutePath: string;
	fileRelativeToRoot: string;
	key: string;
	oldValueString: string;
	newValueString: string;
	defaultValueString: string | null;
	formatted: boolean;
	logLevel: LogLevel;
}) => {
	const locationLabel = `${fileRelativeToRoot}`;
	const fileLink = makeHyperlink({
		url: `file://${absolutePath}`,
		text: locationLabel,
		fallback: locationLabel,
	});
	const propChange = formatPropChange({
		key,
		oldValueString: normalizeQuotes(oldValueString),
		newValueString: normalizeQuotes(newValueString),
		defaultValueString:
			defaultValueString !== null ? normalizeQuotes(defaultValueString) : null,
	});
	RenderInternals.Log.info(
		{indent: false, logLevel},
		`${RenderInternals.chalk.blueBright(`${fileLink}:`)} ${propChange}`,
	);
	if (!formatted) {
		warnAboutPrettierOnce(logLevel);
	}
};
