// Must keep this file in sync with the one in packages/lambda/src/shared/serialize-props.ts!

import {staticFile} from './static-file.js';

export type SerializedJSONWithCustomFields = {
	serializedString: string;
	customDateUsed: boolean;
	customFileUsed: boolean;
	mapUsed: boolean;
	setUsed: boolean;
};

export const DATE_TOKEN = 'remotion-date:';
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

export const deserializeJSONWithCustomFields = <T = Record<string, unknown>>(
	data: string,
): T => {
	return JSON.parse(data, (_, value) => {
		if (typeof value === 'string' && value.startsWith(DATE_TOKEN)) {
			return new Date(value.replace(DATE_TOKEN, ''));
		}

		if (typeof value === 'string' && value.startsWith(FILE_TOKEN)) {
			return staticFile(value.replace(FILE_TOKEN, ''));
		}

		return value;
	});
};
