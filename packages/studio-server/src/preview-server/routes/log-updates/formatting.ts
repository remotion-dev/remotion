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
// Use the terminal's default foreground color so punctuation is visible in both
// light and dark terminal themes.
export const punctuation = (str: string) => str;
export const stringValue = (str: string) => fg(230, 219, 116, str);
export const numberValue = (str: string) => fg(174, 129, 255, str);
export const strikeThrough = (str: string) =>
	`\u001b[9m\u001b[38;2;255;85;85m${stripAnsi(str)}\u001b[39m\u001b[29m`;
export const strikeThroughOrRemovedPrefix = (str: string) =>
	colorEnabled() ? strikeThrough(str) : 'removed: ' + str;
export const addedPrefixIfNoColor = (str: string) =>
	colorEnabled() ? str : 'added: ' + stripAnsi(str);

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

const formatValueDelta = ({
	oldValueString,
	newValueString,
}: {
	oldValueString: string;
	newValueString: string;
}) => {
	const shortened = shortenUnchangedInterpolateOptions({
		oldValueString,
		newValueString,
	});

	return `${colorValue(shortened.oldValueString)} ${punctuation('→')} ${colorValue(shortened.newValueString)}`;
};

const formatSimplePropChange = ({
	key,
	oldValueString,
	newValueString,
}: {
	key: string;
	oldValueString: string;
	newValueString: string;
}) => {
	return `${attrName(key)}${equals('=')}${punctuation('{')}${formatValueDelta({oldValueString, newValueString})}${punctuation('}')}`;
};

const formatNestedPropChange = ({
	key,
	oldValueString,
	newValueString,
}: {
	key: string;
	oldValueString: string;
	newValueString: string;
}) => {
	const dotIdx = key.indexOf('.');
	return `${attrName(key.slice(0, dotIdx))}${equals('=')}${punctuation('{{')}${punctuation(key.slice(dotIdx + 1))}${punctuation(':')} ${formatValueDelta({oldValueString, newValueString})}${punctuation('}}')}`;
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

export const formatPropChangeDelta = ({
	key,
	oldValueString,
	newValueString,
}: {
	key: string;
	oldValueString: string;
	newValueString: string;
}) => {
	const dotIdx = key.indexOf('.');
	if (dotIdx === -1) {
		return formatSimplePropChange({key, oldValueString, newValueString});
	}

	return formatNestedPropChange({key, oldValueString, newValueString});
};

export const formatDeletion = (prop: PropDelta) => {
	const formatted = formatPropDelta(prop);
	return strikeThroughOrRemovedPrefix(formatted);
};

export const formatAddition = (prop: PropDelta) => {
	const formatted = formatPropDelta(prop);
	return addedPrefixIfNoColor(formatted);
};

const callStart = 'interpolate(';

type InterpolateCall = {
	args: string[];
};

const normalizeArg = (arg: string) => {
	return arg
		.replace(/\s+/g, ' ')
		.replace(/,(\s*[}\]])/g, '$1')
		.trim();
};

const splitTopLevelArgs = (argsSource: string) => {
	const args: string[] = [];
	let depth = 0;
	let quote: "'" | '"' | '`' | null = null;
	let start = 0;

	for (let i = 0; i < argsSource.length; i++) {
		const char = argsSource[i];
		const previous = argsSource[i - 1];

		if (quote) {
			if (char === quote && previous !== '\\') {
				quote = null;
			}

			continue;
		}

		if (char === "'" || char === '"' || char === '`') {
			quote = char;
			continue;
		}

		if (char === '(' || char === '[' || char === '{') {
			depth++;
			continue;
		}

		if (char === ')' || char === ']' || char === '}') {
			depth--;
			continue;
		}

		if (char === ',' && depth === 0) {
			args.push(argsSource.slice(start, i).trim());
			start = i + 1;
		}
	}

	args.push(argsSource.slice(start).trim());
	return args;
};

const parseInterpolateCall = (valueString: string): InterpolateCall | null => {
	const trimmed = valueString.trim();
	if (!trimmed.startsWith(callStart) || !trimmed.endsWith(')')) {
		return null;
	}

	let depth = 0;
	let quote: "'" | '"' | '`' | null = null;

	for (let i = 'interpolate'.length; i < trimmed.length; i++) {
		const char = trimmed[i];
		const previous = trimmed[i - 1];

		if (quote) {
			if (char === quote && previous !== '\\') {
				quote = null;
			}

			continue;
		}

		if (char === "'" || char === '"' || char === '`') {
			quote = char;
			continue;
		}

		if (char === '(' || char === '[' || char === '{') {
			depth++;
			continue;
		}

		if (char === ')' || char === ']' || char === '}') {
			depth--;
			if (depth === 0 && i !== trimmed.length - 1) {
				return null;
			}
		}
	}

	if (depth !== 0) {
		return null;
	}

	return {
		args: splitTopLevelArgs(trimmed.slice(callStart.length, -1)),
	};
};

const shortenUnchangedInterpolateOptions = ({
	oldValueString,
	newValueString,
}: {
	oldValueString: string;
	newValueString: string;
}) => {
	const oldCall = parseInterpolateCall(oldValueString);
	const newCall = parseInterpolateCall(newValueString);

	if (
		!oldCall ||
		!newCall ||
		oldCall.args.length <= 3 ||
		newCall.args.length <= 3
	) {
		return {oldValueString, newValueString};
	}

	const oldOptions = oldCall.args.slice(3).map(normalizeArg);
	const newOptions = newCall.args.slice(3).map(normalizeArg);
	if (
		oldOptions.length !== newOptions.length ||
		oldOptions.some((option, index) => option !== newOptions[index])
	) {
		return {oldValueString, newValueString};
	}

	return {
		oldValueString: `interpolate(${oldCall.args.slice(0, 3).join(', ')})`,
		newValueString: `interpolate(${newCall.args.slice(0, 3).join(', ')})`,
	};
};
