import type {CanUpdateSequencePropStatus} from 'remotion';

export const BORDER_RADIUS_SHORTHAND_KEY = 'style.borderRadius';
export const BORDER_RADIUS_LONGHAND_KEYS = [
	'style.borderTopLeftRadius',
	'style.borderTopRightRadius',
	'style.borderBottomRightRadius',
	'style.borderBottomLeftRadius',
] as const;

export type BorderRadiusConversion =
	| {readonly type: 'individual'; readonly value: number}
	| {readonly type: 'shorthand'; readonly value: number};

export const getBorderRadiusConversion = (
	props: Record<string, CanUpdateSequencePropStatus> | undefined,
): BorderRadiusConversion | null => {
	const shorthand = props?.[BORDER_RADIUS_SHORTHAND_KEY];
	if (
		shorthand?.status === 'static' &&
		typeof shorthand.codeValue === 'number'
	) {
		return {type: 'individual', value: shorthand.codeValue};
	}

	const longhands = BORDER_RADIUS_LONGHAND_KEYS.map((key) => props?.[key]);
	if (
		longhands.every(
			(status) =>
				status?.status === 'static' && typeof status.codeValue === 'number',
		)
	) {
		const values = longhands.map((status) =>
			status?.status === 'static' ? status.codeValue : undefined,
		);
		if (values.every((value) => value === values[0])) {
			return {type: 'shorthand', value: values[0] as number};
		}
	}

	return null;
};
