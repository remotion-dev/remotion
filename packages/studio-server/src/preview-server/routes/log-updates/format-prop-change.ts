import {formatSideProps} from './format-side-props';
import {
	colorEnabled,
	formatAddition,
	formatDeletion,
	formatPropDelta,
	type PropDelta,
} from './formatting';

const formatInnerPropChange = ({
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
	if (defaultValueString !== null && newValueString === defaultValueString) {
		return formatDeletion({valueString: oldValueString, key});
	}

	if (defaultValueString !== null && oldValueString === defaultValueString) {
		return formatAddition({valueString: newValueString, key});
	}

	return `${formatPropDelta({valueString: oldValueString, key})} \u2192 ${formatPropDelta({valueString: newValueString, key})}`;
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

	return [
		formatInnerPropChange({
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
