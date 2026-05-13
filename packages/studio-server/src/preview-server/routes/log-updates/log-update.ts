import {RenderInternals} from '@remotion/renderer';
import type {LogLevel} from '@remotion/renderer';
import {formatPropChange} from './format-prop-change';
import {type PropDelta} from './format-side-props';

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

export const normalizeQuotes = (str: string): string => {
	if (
		str.length >= 2 &&
		((str.startsWith("'") && str.endsWith("'")) ||
			(str.startsWith('"') && str.endsWith('"')))
	) {
		return `'${str.slice(1, -1)}'`;
	}

	return str;
};

export const logUpdate = ({
	fileRelativeToRoot,
	line,
	key,
	oldValueString,
	newValueString,
	defaultValueString,
	formatted,
	logLevel,
	removedProps,
	addedProps,
}: {
	fileRelativeToRoot: string;
	line: number;
	key: string;
	oldValueString: string;
	newValueString: string;
	defaultValueString: string | null;
	formatted: boolean;
	logLevel: LogLevel;
	removedProps: PropDelta[];
	addedProps: PropDelta[];
}) => {
	const locationLabel = `${fileRelativeToRoot}:${line}`;
	const propChange = formatPropChange({
		key,
		oldValueString: normalizeQuotes(oldValueString),
		newValueString: normalizeQuotes(newValueString),
		defaultValueString:
			defaultValueString !== null ? normalizeQuotes(defaultValueString) : null,
		removedProps,
		addedProps,
	});
	RenderInternals.Log.info(
		{indent: false, logLevel},
		`${RenderInternals.chalk.blueBright(`${locationLabel}:`)} ${propChange}`,
	);
	if (!formatted) {
		warnAboutPrettierOnce(logLevel);
	}
};
