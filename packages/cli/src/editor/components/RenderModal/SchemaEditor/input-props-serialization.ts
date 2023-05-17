export type SerializedJSONWithCustomFields = {
	serializedString: string;
	customDateUsed: boolean;
	customFileUsed: boolean;
	mapUsed: boolean;
};

const DATE_TOKEN = 'remotion-date:';
export const FILE_TOKEN = 'remotion-file:';

export const serializeJSONWithDate = ({
	data,
	indent,
	staticBase,
}: {
	data: unknown;
	indent: number | undefined;
	staticBase: string;
}): SerializedJSONWithCustomFields => {
	let customDateUsed = false;
	let customFileUsed = false;
	let mapUsed = false;

	const serializedString = JSON.stringify(
		data,
		function (key, value) {
			const item = this[key];
			if (item instanceof Date) {
				customDateUsed = true;
				return `${DATE_TOKEN}${item.toISOString()}`;
			}

			if (item instanceof Map) {
				mapUsed = true;
				return value;
			}

			if (typeof item === 'string' && item.startsWith(staticBase)) {
				customFileUsed = true;
				return `${FILE_TOKEN}${item.replace(staticBase + '/', '')}`;
			}

			return value;
		},
		indent
	);
	return {serializedString, customDateUsed, customFileUsed, mapUsed};
};

export const deserializeJSONWithCustomFields = (data: string) => {
	return JSON.parse(data, (_, value) => {
		if (typeof value === 'string' && value.startsWith(DATE_TOKEN)) {
			return new Date(value.replace(DATE_TOKEN, ''));
		}

		return value;
	});
};
