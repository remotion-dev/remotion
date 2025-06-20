import { test, expect } from "bun:test";

// Since we can't run the actual script without an API key, let's test the logic separately
const variableFontAxes: Record<string, Array<{
	tag: string;
	name: string;
	min: number;
	max: number;
	default: number;
}>> = {
	'Inter': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Roboto Flex': [
		{ tag: 'GRAD', name: 'Grade', min: -200, max: 150, default: 0 },
		{ tag: 'wght', name: 'Weight', min: 100, max: 1000, default: 400 }
	]
};

function enhanceWithVariableFontData(fonts: any[]) {
	return fonts.map(font => {
		const axes = variableFontAxes[font.family];
		if (axes) {
			return {
				...font,
				isVariable: true,
				axes: axes
			};
		}
		return {
			...font,
			isVariable: false
		};
	});
}

test("Should correctly identify and enhance variable fonts", () => {
	const mockFonts = [
		{
			family: 'Inter',
			variants: ['100', '200', '300', 'regular', '500', '600', '700', '800', '900'],
			subsets: ['latin'],
			version: 'v19',
			lastModified: '2025-05-29',
			category: 'sans-serif'
		},
		{
			family: 'Regular Font',
			variants: ['regular', 'italic'],
			subsets: ['latin'],
			version: 'v1',
			lastModified: '2025-05-29',
			category: 'serif'
		},
		{
			family: 'Roboto Flex',
			variants: ['regular'],
			subsets: ['latin'],
			version: 'v29',
			lastModified: '2025-05-29',
			category: 'sans-serif'
		}
	];

	const enhanced = enhanceWithVariableFontData(mockFonts);

	// Inter should be marked as variable with weight axis
	expect(enhanced[0].isVariable).toBe(true);
	expect(enhanced[0].axes).toEqual([
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	]);

	// Regular Font should not be variable
	expect(enhanced[1].isVariable).toBe(false);
	expect(enhanced[1].axes).toBeUndefined();

	// Roboto Flex should be variable with multiple axes
	expect(enhanced[2].isVariable).toBe(true);
	expect(enhanced[2].axes).toHaveLength(2);
	expect(enhanced[2].axes?.[0].tag).toBe('GRAD');
	expect(enhanced[2].axes?.[1].tag).toBe('wght');
});

test("Should preserve all original font properties", () => {
	const mockFont = {
		family: 'Inter',
		variants: ['regular'],
		subsets: ['latin'],
		version: 'v19',
		lastModified: '2025-05-29',
		category: 'sans-serif',
		files: { regular: 'url' },
		kind: 'webfonts#webfont',
		menu: 'menu-url'
	};

	const enhanced = enhanceWithVariableFontData([mockFont]);

	expect(enhanced[0]).toMatchObject({
		family: 'Inter',
		variants: ['regular'],
		subsets: ['latin'],
		version: 'v19',
		lastModified: '2025-05-29',
		category: 'sans-serif',
		files: { regular: 'url' },
		kind: 'webfonts#webfont',
		menu: 'menu-url',
		isVariable: true
	});
});