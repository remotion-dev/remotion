import {RenderInternals} from '@remotion/renderer';

export const colorEnabled = () => RenderInternals.chalk.enabled();

export const colorValue = (str: string) => {
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

// eslint-disable-next-line no-control-regex
const stripAnsi = (str: string) => str.replace(/\u001b\[[0-9;]*m/g, '');

// 24-bit ANSI helpers
export const fg = (r: number, g: number, b: number, str: string) =>
	colorEnabled() ? `\u001b[38;2;${r};${g};${b}m${str}\u001b[39m` : str;
export const bg = (r: number, g: number, b: number, str: string) =>
	colorEnabled() ? `\u001b[48;2;${r};${g};${b}m${str}\u001b[49m` : str;

// Monokai-inspired syntax colors
export const attrName = (str: string) => fg(166, 226, 46, str);
export const equals = (str: string) => fg(249, 38, 114, str);
export const punctuation = (str: string) => fg(248, 248, 242, str);
export const stringValue = (str: string) => fg(230, 219, 116, str);
export const numberValue = (str: string) => fg(174, 129, 255, str);
export const strikeThrough = (str: string) =>
	`\u001b[9m\u001b[38;2;255;85;85m${stripAnsi(str)}\u001b[39m\u001b[29m`;
export const strikeThroughOrRemovedPrefix = (str: string) =>
	colorEnabled() ? strikeThrough(str) : 'removed: ' + str;
export const addedPrefixIfNoColor = (str: string) =>
	colorEnabled() ? 'added: ' + stripAnsi(str) : str;

export type PropDelta = {
	key: string;
	valueString: string;
};

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

export const formatPropDelta = ({key, valueString}: PropDelta) => {
	const dotIdx = key.indexOf('.');
	if (dotIdx === -1) {
		return formatSimpleProp(key, valueString);
	}

	return formatNestedProp(
		key.slice(0, dotIdx),
		key.slice(dotIdx + 1),
		valueString,
	);
};

export const formatDeletion = (prop: PropDelta) => {
	const formatted = formatPropDelta(prop);
	return strikeThroughOrRemovedPrefix(formatted);
};

export const formatAddition = (prop: PropDelta) => {
	const formatted = formatPropDelta(prop);
	return addedPrefixIfNoColor(formatted);
};
