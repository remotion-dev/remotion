import {formatSideProps, type PropDelta} from './format-side-props';
import {
	attrName,
	colorEnabled,
	colorValue,
	equals,
	punctuation,
	strikeThrough,
} from './formatting';

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
	const color = colorEnabled();
	const suffix = formatSideProps({removedProps, addedProps, color});

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
		if (!color) {
			return ['removed: ' + formatProp(oldValueString), suffix]
				.filter(Boolean)
				.join(', ');
		}

		return [strikeThrough(formatProp(oldValueString)), suffix]
			.filter(Boolean)
			.join(', ');
	}

	if (defaultValueString !== null && oldValueString === defaultValueString) {
		return [formatProp(newValueString), suffix].filter(Boolean).join(', ');
	}

	return [
		`${formatProp(oldValueString)} \u2192 ${formatProp(newValueString)}`,
		suffix,
	]
		.filter(Boolean)
		.join(', ');
};
