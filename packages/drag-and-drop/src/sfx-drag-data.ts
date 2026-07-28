import {isRecord, isUrl} from './validation';

export type SfxDragData = {
	type: 'remotion-sfx';
	version: 1;
	sfx: {
		name: string;
		url: string;
	};
};

export const makeSfxDragData = ({
	name,
	url,
}: SfxDragData['sfx']): SfxDragData => {
	return {
		type: 'remotion-sfx',
		version: 1,
		sfx: {name, url},
	};
};

export const parseSfxDragData = (value: string): SfxDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (
			!isRecord(parsed) ||
			parsed.type !== 'remotion-sfx' ||
			parsed.version !== 1 ||
			!isRecord(parsed.sfx)
		) {
			return null;
		}

		const {name, url} = parsed.sfx;
		if (
			typeof name !== 'string' ||
			name.length === 0 ||
			typeof url !== 'string' ||
			!isUrl(url)
		) {
			return null;
		}

		return makeSfxDragData({name, url});
	} catch {
		return null;
	}
};
