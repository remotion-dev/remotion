import * as z from 'zod/mini';
import {isUrl} from './validation';

export type SfxDragData = {
	type: 'remotion-sfx';
	version: 1;
	sfx: {
		name: string;
		url: string;
	};
};

const sfxDragDataSchema = z.object({
	type: z.literal('remotion-sfx'),
	version: z.literal(1),
	sfx: z.object({
		name: z.string().check(z.minLength(1)),
		url: z.string().check(z.refine(isUrl)),
	}),
});

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
		const parsed = z.safeParse(sfxDragDataSchema, JSON.parse(value));
		return parsed.success
			? makeSfxDragData({
					name: parsed.data.sfx.name,
					url: parsed.data.sfx.url,
				})
			: null;
	} catch {
		return null;
	}
};
