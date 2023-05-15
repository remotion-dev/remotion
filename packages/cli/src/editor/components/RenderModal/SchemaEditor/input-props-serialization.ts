export type SerializedJSONWithDate = {
	serializedString: string;
	customDateUsed: boolean;
};

export const serializeJSONWithDate = (
	data: unknown,
	indent: number | undefined
): SerializedJSONWithDate => {
	let customDateUsed = false;
	const serializedString = JSON.stringify(
		data,
		function (key, value) {
			if (this[key] instanceof Date) {
				customDateUsed = true;
				return `remotion-date:${this[key].toISOString()}`;
			}

			return value;
		},
		indent
	);
	return {serializedString, customDateUsed};
};

export const deserializeJSONWithDate = (data: string) => {
	return JSON.parse(data, (_, value) => {
		if (typeof value === 'string' && value.startsWith('remotion-date:')) {
			return new Date(value.replace('remotion-date:', ''));
		}

		return value;
	});
};
