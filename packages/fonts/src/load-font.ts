import {cancelRender, continueRender, delayRender} from 'remotion';
import type {FontFormat} from './get-font-format';
import {getFontFormat} from './get-font-format';

export type LoadFontOptions = {
	family: string;
	url: string;
	ascentOverride?: string;
	descentOverride?: string;
	display?: 'auto' | 'block' | 'fallback' | 'optional' | 'swap';
	featureSettings?: string;
	lineGapOverride?: string;
	stretch?: string;
	style?: string;
	unicodeRange?: string;
	variant?: string;
	weight?: string;
	format?: FontFormat;
};

export const loadFont = async ({
	family,
	url,
	ascentOverride,
	descentOverride,
	display,
	featureSettings,
	lineGapOverride,
	stretch,
	style,
	unicodeRange,
	weight,
	format,
	variant,
}: LoadFontOptions): Promise<void> => {
	const waitForFont = delayRender();
	try {
		const fontFormat = format ?? getFontFormat(url);
		const font = new FontFace(family, `url('${url}') format('${fontFormat}')`, {
			ascentOverride,
			descentOverride,
			display,
			featureSettings,
			lineGapOverride,
			stretch,
			style,
			unicodeRange,
			weight,
			// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
			// @ts-ignore variant is not in the FontFace constructor
			variant,
		});
		await font.load();
		document.fonts.add(font);
		continueRender(waitForFont);
	} catch (err) {
		cancelRender(err);
	}
};
