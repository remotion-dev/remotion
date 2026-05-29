import {formatSideProps} from './format-side-props';
import {
	addedPrefixIfNoColor,
	attrName,
	colorValue,
	punctuation,
	strikeThroughOrRemovedPrefix,
	type PropDelta,
} from './formatting';

const formatEffectPropBody = (key: string, valueString: string) => {
	return `${punctuation(key)}${punctuation(': ')}${colorValue(valueString)}`;
};

const formatEffectCall = (
	effectName: string,
	key: string,
	valueString: string,
) => {
	return `${attrName(effectName)}${punctuation('(')}${punctuation('{')}${formatEffectPropBody(key, valueString)}${punctuation('}')}${punctuation(')')}`;
};

const formatEffectDeletion = ({
	effectName,
	key,
	valueString,
}: {
	effectName: string;
	key: string;
	valueString: string;
}) => {
	const inner = formatEffectPropBody(key, valueString);
	return `${attrName(effectName)}${punctuation('(')}${punctuation('{')}${strikeThroughOrRemovedPrefix(inner)}${punctuation('}')}${punctuation(')')}`;
};

const formatEffectAddition = ({
	effectName,
	key,
	valueString,
}: {
	effectName: string;
	key: string;
	valueString: string;
}) => {
	return addedPrefixIfNoColor(formatEffectCall(effectName, key, valueString));
};

const formatEffectInnerPropChange = ({
	effectName,
	key,
	oldValueString,
	newValueString,
	defaultValueString,
}: {
	effectName: string;
	key: string;
	oldValueString: string;
	newValueString: string;
	defaultValueString: string | null;
}) => {
	if (defaultValueString !== null && newValueString === defaultValueString) {
		return formatEffectDeletion({
			effectName,
			key,
			valueString: oldValueString,
		});
	}

	if (defaultValueString !== null && oldValueString === defaultValueString) {
		return formatEffectAddition({
			effectName,
			key,
			valueString: newValueString,
		});
	}

	return `${formatEffectCall(effectName, key, oldValueString)} \u2192 ${formatEffectCall(effectName, key, newValueString)}`;
};

export const formatEffectPropChange = ({
	effectName,
	key,
	oldValueString,
	newValueString,
	defaultValueString,
	removedProps,
	addedProps,
}: {
	effectName: string;
	key: string;
	oldValueString: string;
	newValueString: string;
	defaultValueString: string | null;
	removedProps: PropDelta[];
	addedProps: PropDelta[];
}) => {
	const suffix = formatSideProps({removedProps, addedProps});

	return [
		formatEffectInnerPropChange({
			effectName,
			key,
			oldValueString,
			newValueString,
			defaultValueString,
		}),
		suffix,
	]
		.filter(Boolean)
		.join(', ');
};
