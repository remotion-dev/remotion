import {
	equalFontFingerprintKeys,
	getFontFingerprintCache,
	type FontFingerprintKey,
	type FontRaster,
} from './font-fingerprint-cache';
import {parseFontFamilies} from './parse-font-families';

export type CssFontGroupSample = {
	text: string;
	style: CSSStyleDeclaration;
	lang: string;
};
type Group = {name: string; rules: CSSFontFaceRule[]};
type Result = {matches: string[]; reason: string | null};

const genericFamilies = new Set([
	'serif',
	'sans-serif',
	'monospace',
	'cursive',
	'fantasy',
	'system-ui',
	'ui-serif',
	'ui-sans-serif',
	'ui-monospace',
	'ui-rounded',
	'math',
	'fangsong',
]);

const replaceFamilies = (value: string, aliases: Map<string, string>) => {
	const tokens: string[] = [];
	let start = 0;
	let quote: string | null = null;
	for (let index = 0; index <= value.length; index++) {
		const character = value[index];
		if (character === '\\') {
			index++;
			continue;
		}

		if (quote !== null) {
			if (character === quote) quote = null;
			continue;
		}

		if (character === '"' || character === "'") {
			quote = character;
			continue;
		}

		if (character !== ',' && index !== value.length) continue;
		const token = value.slice(start, index).trim();
		const alias = aliases.get(parseFontFamilies(token)[0]);
		tokens.push(alias ? JSON.stringify(alias) : token);
		start = index + 1;
	}

	return tokens.join(',');
};

export const getCssDataFontBytes = (
	source: string,
	ownerWindow: Pick<Window & typeof globalThis, 'atob' | 'Request'>,
) => {
	const match =
		/^url\((?:"(data:[^"]*)"|'(data:[^']*)'|(data:[^)]*))\)(?:\s+format\([^)]*\))?(?:\s+tech\([^)]*\))?$/i.exec(
			source,
		);
	const input = match?.[1] ?? match?.[2] ?? match?.[3];
	if (!input) return null;
	try {
		// This ASCII-only ordinary base64 form has no URL normalization-sensitive
		// characters. Other data URLs use the owning runtime's Request serialization.
		const serialized =
			/^data:[a-z\d.+-]+\/[a-z\d.+-]+;base64,[a-z\d+/=]*$/i.test(input)
				? input
				: new ownerWindow.Request(input).url;
		// Exclude the fragment after Request serialization.
		const data = serialized.split('#', 1)[0];
		const comma = data.indexOf(',');
		if (comma < 0) return null;
		const payload = data.slice(comma + 1);
		// A serialized MIME header permits spaces around the terminal base64 marker.
		const base64Encoded = /; *base64 *$/i.test(data.slice(0, comma));
		if (!payload.includes('%')) {
			if (!base64Encoded) return new TextEncoder().encode(payload);
			return Uint8Array.from(ownerWindow.atob(payload), (character) =>
				character.charCodeAt(0),
			);
		}

		// Data URL percent escapes represent bytes, including invalid UTF-8.
		const encoded = new TextEncoder().encode(payload);
		const decoded = new Uint8Array(encoded.length);
		let length = 0;
		for (let index = 0; index < encoded.length; index++) {
			const hex =
				encoded[index] === 0x25
					? String.fromCharCode(encoded[index + 1], encoded[index + 2])
					: '';
			if (encoded[index] === 0x25 && /^[0-9a-f]{2}$/i.test(hex)) {
				decoded[length++] = parseInt(hex, 16);
				index += 2;
			} else {
				decoded[length++] = encoded[index];
			}
		}

		if (!base64Encoded) return decoded.slice(0, length);
		let base64 = '';
		for (let index = 0; index < length; index++)
			base64 += String.fromCharCode(decoded[index]);
		const binary = ownerWindow.atob(base64);
		return Uint8Array.from(binary, (character) => character.charCodeAt(0));
	} catch {
		return null;
	}
};

type ExtendedDescriptors = FontFaceDescriptors & {sizeAdjust?: string};

const fontDescriptors = (
	style: Pick<CSSStyleDeclaration, 'getPropertyValue'>,
): ExtendedDescriptors => {
	const descriptors: ExtendedDescriptors = {};
	for (const [property, descriptor] of [
		['font-style', 'style'],
		['font-weight', 'weight'],
		['font-stretch', 'stretch'],
		['unicode-range', 'unicodeRange'],
		['font-feature-settings', 'featureSettings'],
		['font-variation-settings', 'variationSettings'],
		['font-display', 'display'],
		['ascent-override', 'ascentOverride'],
		['descent-override', 'descentOverride'],
		['line-gap-override', 'lineGapOverride'],
		['size-adjust', 'sizeAdjust'],
	] as const) {
		const value = style.getPropertyValue(property);
		if (value) Object.assign(descriptors, {[descriptor]: value});
	}

	return descriptors;
};

const stretchKeywords: Record<string, CanvasFontStretch> = {
	'50%': 'ultra-condensed',
	'62.5%': 'extra-condensed',
	'75%': 'condensed',
	'87.5%': 'semi-condensed',
	'100%': 'normal',
	'112.5%': 'semi-expanded',
	'125%': 'expanded',
	'150%': 'extra-expanded',
	'200%': 'ultra-expanded',
};

export const fingerprintCssFontGroups = (
	ownerDocument: Document,
	samples: CssFontGroupSample[],
	groups: Group[],
): Result => {
	const ownerWindow = ownerDocument.defaultView;
	if (!ownerWindow)
		return {matches: [], reason: 'Source document has no window.'};
	if (!samples.length || samples.some((sample) => !sample.text.trim()))
		return {matches: [], reason: 'No distinguishing rendered text.'};
	for (const sample of samples) {
		const {style, text} = sample;
		if (/\s{2}|[\r\n\t]/.test(text))
			return {matches: [], reason: 'SVG whitespace shaping is not qualified.'};
		for (const property of [
			'font-feature-settings',
			'font-variation-settings',
			'font-variant-ligatures',
			'font-variant-numeric',
			'font-variant-east-asian',
			'font-variant-alternates',
			'font-variant-position',
		]) {
			const value = style.getPropertyValue(property);
			if (value && value !== 'normal')
				return {matches: [], reason: 'Unqualified text property: ' + property};
		}

		if (style.writingMode !== 'horizontal-tb' || style.textTransform !== 'none')
			return {
				matches: [],
				reason: 'Unqualified text writing or transformation.',
			};
		if (style.fontStretch.endsWith('%') && !stretchKeywords[style.fontStretch])
			return {matches: [], reason: 'Unqualified fractional font stretch.'};
		const queryFont =
			style.fontStyle +
			' ' +
			style.fontWeight +
			' ' +
			(stretchKeywords[style.fontStretch] ?? style.fontStretch) +
			' ' +
			style.fontSize +
			' ' +
			style.fontFamily;
		try {
			if (!ownerDocument.fonts.check(queryFont, text))
				return {
					matches: [],
					reason:
						'Source font query is not loaded; initial used-font readiness is required.',
				};
		} catch {
			return {
				matches: [],
				reason: 'Source font query syntax is not qualified.',
			};
		}
	}

	const originals = Array.from(ownerDocument.fonts);
	const originalPromises = originals.map((face) => face.loaded);
	const originalStatuses = originals.map((face) => face.status);
	const faceDescriptors = (face: FontFace) =>
		[
			'family',
			'style',
			'weight',
			'stretch',
			'unicodeRange',
			'featureSettings',
			'variationSettings',
			'display',
			'ascentOverride',
			'descentOverride',
			'lineGapOverride',
			'sizeAdjust',
		].map((property) => {
			const value = (face as unknown as Record<string, unknown>)[property];
			return typeof value === 'string' ? value : null;
		});
	const originalDescriptors = originals.map(faceDescriptors);
	const originalSetStatus = ownerDocument.fonts.status;
	const originalReady = ownerDocument.fonts.ready;
	const owned = new Set<FontFace>();
	const stable = () => {
		const current = Array.from(ownerDocument.fonts).filter(
			(face) => !owned.has(face),
		);
		return (
			current.length === originals.length &&
			current.every(
				(face, index) =>
					face === originals[index] &&
					face.loaded === originalPromises[index] &&
					face.status === originalStatuses[index] &&
					faceDescriptors(face).every(
						(value, descriptorIndex) =>
							value === originalDescriptors[index]![descriptorIndex],
					),
			) &&
			ownerDocument.fonts.status === originalSetStatus &&
			ownerDocument.fonts.ready === originalReady
		);
	};

	const canvases: HTMLCanvasElement[] = [];
	const draw = (
		sample: CssFontGroupSample,
		fontFamily: string,
		size: {width: number; height: number} | null,
	) => {
		const canvas = ownerDocument.createElement('canvas');
		canvas.lang = sample.lang;
		canvases.push(canvas);
		const apply = (drawingContext: CanvasRenderingContext2D) => {
			const {style} = sample;
			drawingContext.font =
				style.fontStyle +
				' ' +
				style.fontWeight +
				' ' +
				style.fontSize +
				' ' +
				fontFamily;
			drawingContext.fontKerning = style.fontKerning as CanvasFontKerning;
			drawingContext.fontStretch =
				stretchKeywords[style.fontStretch] ??
				(style.fontStretch as CanvasFontStretch);
			drawingContext.fontVariantCaps =
				style.fontVariantCaps as CanvasFontVariantCaps;
			drawingContext.letterSpacing =
				style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
			drawingContext.wordSpacing =
				style.wordSpacing === 'normal' ? '0px' : style.wordSpacing;
			drawingContext.direction = style.direction as CanvasDirection;
			drawingContext.textAlign = 'left';
			drawingContext.textRendering = style.textRendering as CanvasTextRendering;
		};

		const context = canvas.getContext('2d', {willReadFrequently: true})!;
		apply(context);
		const metrics = context.measureText(sample.text);
		const width =
			size?.width ??
			Math.ceil(
				Math.max(metrics.width, metrics.actualBoundingBoxRight) +
					Math.abs(metrics.actualBoundingBoxLeft) +
					64,
			);
		const height =
			size?.height ??
			Math.ceil(
				metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 64,
			);
		if (!Number.isFinite(width + height) || width > 4096 || height > 4096)
			return null;
		canvas.width = width;
		canvas.height = height;
		apply(context);
		context.fillText(
			sample.text,
			32 + Math.abs(metrics.actualBoundingBoxLeft),
			32 + metrics.actualBoundingBoxAscent,
		);
		return {
			width,
			height,
			metrics: [
				metrics.width,
				metrics.actualBoundingBoxLeft,
				metrics.actualBoundingBoxRight,
				metrics.actualBoundingBoxAscent,
				metrics.actualBoundingBoxDescent,
				metrics.fontBoundingBoxAscent,
				metrics.fontBoundingBoxDescent,
			],
			pixels: context.getImageData(0, 0, width, height).data,
		};
	};

	const cache = getFontFingerprintCache(ownerDocument);
	const keyFor = (sources: readonly FontRaster[]): FontFingerprintKey => [
		cache.epoch,
		ownerWindow.devicePixelRatio,
		ownerDocument.documentElement.lang,
		ownerDocument.documentElement.dir,
		ownerDocument.fonts.status,
		cache.identity(ownerDocument.fonts.ready),
		originals.length,
		...originals.flatMap((face, index) => [
			cache.identity(face),
			cache.identity(originalPromises[index]!),
			face.status,
			...faceDescriptors(face),
		]),
		samples.length,
		...samples.flatMap((sample, index) => [
			sample.text,
			sample.lang,
			sources[index]!.width,
			sources[index]!.height,
			sample.style.length,
			...Array.from(sample.style).flatMap((property) => [
				property,
				sample.style.getPropertyValue(property),
			]),
		]),
		groups.length,
		...groups.flatMap((group) => [
			group.name,
			group.rules.length,
			...group.rules.flatMap((rule) => [cache.identity(rule), rule.cssText]),
		]),
	];
	const matchesRaster = (source: FontRaster, candidate: FontRaster | null) =>
		Boolean(
			candidate &&
			source.width === candidate.width &&
			source.height === candidate.height &&
			source.metrics.length === candidate.metrics.length &&
			source.pixels.length === candidate.pixels.length &&
			!source.metrics.some(
				(metric, index) => metric !== candidate.metrics[index],
			) &&
			!source.pixels.some((value, index) => value !== candidate.pixels[index]),
		);
	let pending: {
		key: FontFingerprintKey;
		candidates: FontRaster[][];
		sources: FontRaster[];
	} | null = null;

	const managedFamilies = new Set(
		groups.flatMap((group) =>
			group.rules.map((rule) => parseFontFamilies(rule.style.fontFamily)[0]),
		),
	);
	const matches: string[] = [];
	try {
		const sources = samples.map((sample) =>
			draw(sample, sample.style.fontFamily, null),
		);
		if (sources.some((source) => source === null))
			return {matches: [], reason: 'Text raster exceeds qualified dimensions.'};
		if (!stable())
			return {
				matches: [],
				reason: 'Original font state changed while sampling.',
			};
		const qualifiedSources = sources as FontRaster[];
		const key = keyFor(qualifiedSources);
		const cached = cache.get(key);
		if (cached) {
			const cachedMatches = groups.flatMap((group, index) =>
				qualifiedSources.every((source, sampleIndex) =>
					matchesRaster(source, cached[index]?.[sampleIndex] ?? null),
				)
					? [group.name]
					: [],
			);
			if (cachedMatches.length === 1 && stable())
				return {matches: cachedMatches, reason: null};
			cache.delete(key);
		}

		const candidates: FontRaster[][] = [];
		let completeCandidates = true;
		for (const group of groups) {
			const aliases = new Map(
				Array.from(managedFamilies, (family) => [
					family,
					'Remotion private group ' + ownerWindow.crypto.randomUUID(),
				]),
			);
			const groupFaces: FontFace[] = [];
			const groupRasters: FontRaster[] = [];
			try {
				for (const rule of group.rules) {
					const family = parseFontFamilies(rule.style.fontFamily)[0];
					if (!family || genericFamilies.has(family))
						return {matches: [], reason: 'Unqualified generic face family.'};
					const bytes = getCssDataFontBytes(
						rule.style.getPropertyValue('src'),
						ownerWindow,
					);
					if (!bytes)
						return {
							matches: [],
							reason: 'Font group contains a non-data source.',
						};
					const alias = aliases.get(family)!;
					const face = new ownerWindow.FontFace(
						alias,
						bytes.buffer,
						fontDescriptors(rule.style),
					);
					owned.add(face);
					if (
						rule.style.getPropertyValue('size-adjust') &&
						!('sizeAdjust' in face)
					)
						return {
							matches: [],
							reason: 'FontFace size-adjust is unavailable.',
						};

					groupFaces.push(face);
					if (face.status !== 'loaded')
						return {
							matches: [],
							reason: 'Binary font is not synchronously available.',
						};
					if (!stable())
						return {
							matches: [],
							reason: 'Original font state changed at construction.',
						};
					ownerDocument.fonts.add(face);
					if (!stable())
						return {
							matches: [],
							reason: 'Original font state changed at registration.',
						};
				}

				let matching = true;
				for (const [index, sample] of samples.entries()) {
					const source = sources[index]!;
					const candidate = draw(
						sample,
						replaceFamilies(sample.style.fontFamily, aliases),
						source,
					);
					if (!stable())
						return {
							matches: [],
							reason: 'Original font state changed while sampling.',
						};
					if (candidate) groupRasters.push(candidate);
					else completeCandidates = false;
					if (!matchesRaster(source, candidate)) matching = false;
				}

				if (matching) matches.push(group.name);
				candidates.push(groupRasters);
			} finally {
				for (const face of groupFaces) ownerDocument.fonts.delete(face);
			}

			if (!stable())
				return {matches: [], reason: 'Original font state changed at cleanup.'};
		}

		if (matches.length === 1 && completeCandidates)
			pending = {key, candidates, sources: qualifiedSources};
		return {
			matches,
			reason:
				matches.length === 1 ? null : 'Font group is unresolved or ambiguous.',
		};
	} finally {
		for (const face of owned) ownerDocument.fonts.delete(face);
		for (const canvas of canvases) {
			canvas.width = 0;
			canvas.height = 0;
		}

		if (
			pending &&
			stable() &&
			equalFontFingerprintKeys(pending.key, keyFor(pending.sources))
		)
			cache.put(pending.key, pending.candidates);
	}
};
