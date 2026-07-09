import {isUrl} from './url';

export {SFX_DRAG_MIME_TYPE} from './drag-mime-types';

export type SfxDragData = {
	type: 'remotion-sfx';
	version: 1;
	sfx: {
		name: string;
		url: string;
	};
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const parseSfxDragData = (value: string): SfxDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed)) {
			return null;
		}

		if (parsed.type !== 'remotion-sfx' || parsed.version !== 1) {
			return null;
		}

		if (!isRecord(parsed.sfx)) {
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

		return {
			type: 'remotion-sfx',
			version: 1,
			sfx: {
				name,
				url,
			},
		};
	} catch {
		return null;
	}
};
