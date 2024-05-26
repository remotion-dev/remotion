import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {getFontFormat} from './get-font-format';

interface LoadFontOptions extends FontFaceDescriptors {
	family: string;
	url: string;
}

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
  weight
}: LoadFontOptions): Promise<void> => {
	const waitForFont = delayRender();
	try {
		const fontFormat = getFontFormat(url);
		const font = new FontFace(
			family,
			`url('${staticFile(url)}') format('${fontFormat}')`,
			{
        ascentOverride,
        descentOverride,
        display,
        featureSettings,
        lineGapOverride,
        stretch,
        style,
        unicodeRange,
        weight
      },
		);
		await font.load();
		document.fonts.add(font);
		continueRender(waitForFont);
	} catch (err) {
		cancelRender(err);
	}
};
