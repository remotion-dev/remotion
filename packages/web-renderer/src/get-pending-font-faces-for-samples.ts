import {NoReactInternals} from 'remotion/no-react';
import {parseFontFamilies} from './drawing/parse-font-families';
import {
	fontFamilyAliases,
	certainNativeFontFamily,
} from './font-family-matching';
import type {FontReadinessSample} from './font-readiness';
import {pendingFontMayAffectSample} from './pending-font-selection';
export const getPendingFontFacesForSamples = (
	ownerDocument: Document,
	samples: readonly Pick<FontReadinessSample, 'style' | 'text'>[],
): ReturnType<typeof NoReactInternals.getPendingFontFaces> => {
	const loaded = Array.from(ownerDocument.fonts ?? []).filter(
		(face) => face.status === 'loaded',
	);
	return NoReactInternals.getPendingFontFaces().filter(
		(font) =>
			font.ownerDocument === ownerDocument &&
			samples.some(({style, text}) => {
				if (!text.trim()) return false;
				const families = parseFontFamilies(style.fontFamily);
				return fontFamilyAliases(font.fontFamily).some(
					(family) =>
						families.includes(family) &&
						pendingFontMayAffectSample(
							font,
							loaded.filter((face) => certainNativeFontFamily(face) === family),
							style,
							text,
						),
				);
			}),
	);
};
