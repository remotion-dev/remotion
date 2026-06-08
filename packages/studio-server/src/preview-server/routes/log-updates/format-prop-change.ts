import {formatSideProps} from './format-side-props';
import {
	formatAddition,
	formatDeletion,
	formatPropChangeDelta,
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

	return formatPropChangeDelta({key, oldValueString, newValueString});
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
