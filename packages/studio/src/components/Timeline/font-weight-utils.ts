// Shared, DOM-free logic for the font-weight timeline field so it can be unit
// tested without rendering the control.

// CSS keyword weights map to these numbers. The mapping only decides what the
// numeric field shows; the stored string is preserved until the user changes it.
export const FONT_WEIGHT_STRING_PRESET_TO_NUMBER: Record<string, number> = {
	normal: 400,
	bold: 700,
};

export const fontWeightToNumericValue = (value: unknown): number | null => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}

	if (typeof value === 'string') {
		if (value in FONT_WEIGHT_STRING_PRESET_TO_NUMBER) {
			return FONT_WEIGHT_STRING_PRESET_TO_NUMBER[value];
		}

		const parsed = Number(value);
		if (value.trim() !== '' && Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return null;
};

export type FontWeightSaveDecision =
	| {readonly type: 'save'; readonly value: number}
	| {readonly type: 'skip'};

export const resolveFontWeightSave = ({
	stored,
	newValue,
	min,
	max,
}: {
	readonly stored: unknown;
	readonly newValue: number;
	readonly min: number;
	readonly max: number;
}): FontWeightSaveDecision => {
	const clamped = Math.min(max, Math.max(min, newValue));

	// Already the exact number that is written, nothing to do.
	if (clamped === stored) {
		return {type: 'skip'};
	}

	// Preserve a string preset like 'normal'/'bold' when the numeric field
	// resolves to its CSS-equivalent number and the user did not change it.
	if (
		typeof stored === 'string' &&
		clamped === fontWeightToNumericValue(stored)
	) {
		return {type: 'skip'};
	}

	return {type: 'save', value: clamped};
};
