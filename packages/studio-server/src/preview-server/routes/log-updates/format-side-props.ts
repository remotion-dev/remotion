import {
	attrName,
	colorValue,
	equals,
	punctuation,
	strikeThrough,
} from './formatting';

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

const formatPropDelta = ({key, valueString}: PropDelta, color: boolean) => {
	if (!color) {
		const dotIndex = key.indexOf('.');
		if (dotIndex === -1) {
			return `${key}={${valueString}}`;
		}

		const parent = key.slice(0, dotIndex);
		const child = key.slice(dotIndex + 1);
		return `${parent}={{${child}: ${valueString}}}`;
	}

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

export const formatSideProps = ({
	removedProps,
	addedProps,
	color,
}: {
	removedProps: PropDelta[];
	addedProps: PropDelta[];
	color: boolean;
}) => {
	const parts: string[] = [];

	for (const prop of removedProps) {
		const formatted = formatPropDelta(prop, color);
		if (color) {
			parts.push(strikeThrough(formatted));
		} else {
			parts.push('removed: ' + formatted);
		}
	}

	for (const prop of addedProps) {
		if (color) {
			parts.push(formatPropDelta(prop, color));
		} else {
			parts.push('added: ' + formatPropDelta(prop, color));
		}
	}

	if (parts.length === 0) {
		return null;
	}

	return parts.join(', ');
};
