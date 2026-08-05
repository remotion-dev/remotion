import type {ComboboxValue} from './ComboBox';

const getLabelToMatch = (value: ComboboxValue): string | null => {
	if (value.type !== 'item' || value.disabled) {
		return null;
	}

	if (typeof value.label === 'string') {
		return value.label;
	}

	return null;
};

export const findTypeaheadMenuItem = ({
	query,
	values,
}: {
	query: string;
	values: readonly ComboboxValue[];
}): string | null => {
	const normalizedQuery = query.trim().toLowerCase();

	if (normalizedQuery.length === 0) {
		return null;
	}

	const matched = values.find((value) => {
		const label = getLabelToMatch(value);
		return label ? label.toLowerCase().startsWith(normalizedQuery) : false;
	});

	if (!matched || matched.type !== 'item') {
		return null;
	}

	return matched.id;
};
