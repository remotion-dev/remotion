import {RenderInternals} from '@remotion/renderer';
import type {LogLevel} from '@remotion/renderer';

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

// 24-bit ANSI helpers
export const fg = (r: number, g: number, b: number, str: string) =>
	`\u001b[38;2;${r};${g};${b}m${str}\u001b[39m`;
export const bg = (r: number, g: number, b: number, str: string) =>
	`\u001b[48;2;${r};${g};${b}m${str}\u001b[49m`;
// eslint-disable-next-line no-control-regex
const stripAnsi = (str: string) => str.replace(/\u001b\[[0-9;]*m/g, '');
export const strikeThrough = (str: string) =>
	`\u001b[9m\u001b[38;2;255;85;85m${stripAnsi(str)}\u001b[39m\u001b[29m`;

// Monokai-inspired syntax colors
const attrName = (str: string) => fg(166, 226, 46, str);
const equals = (str: string) => fg(249, 38, 114, str);
const punctuation = (str: string) => fg(248, 248, 242, str);
const stringValue = (str: string) => fg(230, 219, 116, str);
const numberValue = (str: string) => fg(174, 129, 255, str);

const colorValue = (str: string) => {
	if (
		(str.startsWith("'") && str.endsWith("'")) ||
		(str.startsWith('"') && str.endsWith('"'))
	) {
		return stringValue(str);
	}

	if (/^-?\d+(\.\d+)?$/.test(str)) {
		return numberValue(str);
	}

	return punctuation(str);
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

export type PropDelta = {
	key: string;
	valueString: string;
};

const formatSideProps = ({
	removedProps,
	addedProps,
}: {
	removedProps: PropDelta[];
	addedProps: PropDelta[];
}) => {
	const parts: string[] = [];

	for (const {valueString} of removedProps) {
		parts.push(
			colorEnabled() ? strikeThrough(valueString) : `~~${valueString}~~`,
		);
	}

	for (const {valueString} of addedProps) {
		parts.push(valueString);
	}

	if (parts.length === 0) {
		return '';
	}

	return `, ${parts.join(', ')}`;
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
