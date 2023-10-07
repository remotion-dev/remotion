// Must keep this file in sync with the one in packages/core/src/input-props-serialization.ts!

type SerializedJSONWithCustomFields = {
	serializedString: string;
	customDateUsed: boolean;
	customFileUsed: boolean;
	mapUsed: boolean;
	setUsed: boolean;
};

const DATE_TOKEN = 'remotion-date:';
export const FILE_TOKEN = 'remotion-file:';

export const serializeJSONWithDate = ({
	data,
	indent,
	staticBase,
}: {
	data: Record<string, unknown>;
	indent: number | undefined;
	staticBase: string | null;
}): SerializedJSONWithCustomFields => {
	let customDateUsed = false;
	let customFileUsed = false;
	let mapUsed = false;
	let setUsed = false;

	const serializedString = JSON.stringify(
		data,
		function (key, value) {
			const item = (this as Record<string, unknown>)[key];
			if (item instanceof Date) {
				customDateUsed = true;
				return `${DATE_TOKEN}${item.toISOString()}`;
			}

			if (item instanceof Map) {
				mapUsed = true;
				return value;
			}

			if (item instanceof Set) {
				setUsed = true;
				return value;
			}

			if (
				typeof item === 'string' &&
				staticBase !== null &&
				item.startsWith(staticBase)
			) {
				customFileUsed = true;
				return `${FILE_TOKEN}${item.replace(staticBase + '/', '')}`;
			}

			return value;
		},
		indent,
	);

	return {serializedString, customDateUsed, customFileUsed, mapUsed, setUsed};
};
