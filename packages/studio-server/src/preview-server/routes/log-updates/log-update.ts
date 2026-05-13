import {RenderInternals} from '@remotion/renderer';
import type {LogLevel} from '@remotion/renderer';
import {formatSideProps, type PropDelta} from './format-side-props';
import {
	attrName,
	colorValue,
	equals,
	punctuation,
	strikeThrough,
} from './formatting';

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

const colorEnabled = () => RenderInternals.chalk.enabled();

// Format key={value} with Monokai syntax highlighting
const formatSimpleProp = (key: string, value: string) => {
	return `${attrName(key)}${equals('=')}${punctuation('{')}${colorValue(value)}${punctuation('}')}`;
};

// Format parentKey={{childKey: value}} with Monokai syntax highlighting
const formatNestedProp = (
	parentKey: string,
	childKey: string,
	value: string,
) => {
	return `${attrName(parentKey)}${equals('=')}${punctuation('{{')}${punctuation(childKey)}${punctuation(':')} ${colorValue(value)}${punctuation('}}')}`;
};

export const formatPropChange = ({
	key,
	oldValueString,
	newValueString,
	defaultValueString,
	removedProps,
	addedProps,
}: {
	key: string;
	oldValueString: string;
	newValueString: string;
	defaultValueString: string | null;
	removedProps: PropDelta[];
	addedProps: PropDelta[];
}) => {
	const suffix = formatSideProps({removedProps, addedProps});

	if (!colorEnabled()) {
		const dotIdx = key.indexOf('.');
		if (dotIdx === -1) {
			return `${key}={${oldValueString}} \u2192 ${key}={${newValueString}}${suffix}`;
		}

		const parent = key.slice(0, dotIdx);
		const child = key.slice(dotIdx + 1);
		return `${parent}={{${child}: ${oldValueString}}} \u2192 ${parent}={{${child}: ${newValueString}}}${suffix}`;
	}

	const dotIndex = key.indexOf('.');
	const formatProp = (value: string) =>
		dotIndex === -1
			? formatSimpleProp(key, value)
			: formatNestedProp(
					key.slice(0, dotIndex),
					key.slice(dotIndex + 1),
					value,
				);

	if (defaultValueString !== null && newValueString === defaultValueString) {
		return `${strikeThrough(formatProp(oldValueString))}${suffix}`;
	}

	if (defaultValueString !== null && oldValueString === defaultValueString) {
		return `${formatProp(newValueString)}${suffix}`;
	}

	return `${formatProp(oldValueString)} \u2192 ${formatProp(newValueString)}${suffix}`;
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
