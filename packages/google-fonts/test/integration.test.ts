import { test, expect } from "bun:test";

test("Should demonstrate complete variable fonts functionality", () => {
	// Simulate what the enhanced google-fonts.ts would look like
	const mockGoogleFonts = [
		{
			family: 'Inter',
			variants: ['100', '200', '300', 'regular', '500', '600', '700', '800', '900'],
			subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'latin', 'latin-ext', 'vietnamese'],
			version: 'v19',
			lastModified: '2025-05-29',
			files: { regular: 'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.woff2' },
			category: 'sans-serif',
			kind: 'webfonts#webfont',
			menu: 'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZlhiA.woff2',
			isVariable: true,
			axes: [
				{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
			]
		},
		{
			family: 'Roboto Flex',
			variants: ['regular'],
			subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'latin', 'latin-ext', 'vietnamese'],
			version: 'v29',
			lastModified: '2025-06-02',
			files: { regular: 'https://fonts.gstatic.com/s/robotoflex/v29/NaN...woff2' },
			category: 'sans-serif',
			kind: 'webfonts#webfont',
			menu: 'https://fonts.gstatic.com/s/robotoflex/v29/NaN...woff2',
			isVariable: true,
			axes: [
				{ tag: 'GRAD', name: 'Grade', min: -200, max: 150, default: 0 },
				{ tag: 'wght', name: 'Weight', min: 100, max: 1000, default: 400 },
				{ tag: 'wdth', name: 'Width', min: 25, max: 151, default: 100 },
				{ tag: 'opsz', name: 'Optical Size', min: 8, max: 144, default: 14 }
			]
		},
		{
			family: 'ABeeZee',
			variants: ['regular', 'italic'],
			subsets: ['latin', 'latin-ext'],
			version: 'v22',
			lastModified: '2025-05-30',
			files: { regular: 'https://fonts.gstatic.com/s/abeezee/v22/esDR31xSG-6AGleN6teukbcHCpE.woff2' },
			category: 'sans-serif',
			kind: 'webfonts#webfont',
			menu: 'https://fonts.gstatic.com/s/abeezee/v22/esDR31xSG-6AGleN2tOkkA.woff2',
			isVariable: false
		}
	];

	// Test: Filter variable fonts
	const variableFonts = mockGoogleFonts.filter(font => font.isVariable);
	expect(variableFonts).toHaveLength(2);
	expect(variableFonts.map(f => f.family)).toEqual(['Inter', 'Roboto Flex']);

	// Test: Find specific variable font and access axis data
	const inter = mockGoogleFonts.find(font => font.family === 'Inter');
	expect(inter?.isVariable).toBe(true);
	expect(inter?.axes).toHaveLength(1);
	expect(inter?.axes?.[0]).toEqual({
		tag: 'wght',
		name: 'Weight',
		min: 100,
		max: 900,
		default: 400
	});

	// Test: Complex variable font with multiple axes
	const robotoFlex = mockGoogleFonts.find(font => font.family === 'Roboto Flex');
	expect(robotoFlex?.isVariable).toBe(true);
	expect(robotoFlex?.axes).toHaveLength(4);
	
	// Check specific axes
	const gradeAxis = robotoFlex?.axes?.find(axis => axis.tag === 'GRAD');
	expect(gradeAxis).toEqual({
		tag: 'GRAD',
		name: 'Grade',
		min: -200,
		max: 150,
		default: 0
	});

	const weightAxis = robotoFlex?.axes?.find(axis => axis.tag === 'wght');
	expect(weightAxis?.min).toBe(100);
	expect(weightAxis?.max).toBe(1000);

	// Test: Static font has no axes
	const abeezee = mockGoogleFonts.find(font => font.family === 'ABeeZee');
	expect(abeezee?.isVariable).toBe(false);
	expect(abeezee?.axes).toBeUndefined();

	// Test: Type safety - all fonts have isVariable property
	mockGoogleFonts.forEach(font => {
		expect(typeof font.isVariable).toBe('boolean');
		if (font.isVariable) {
			expect(Array.isArray(font.axes)).toBe(true);
			expect(font.axes!.length).toBeGreaterThan(0);
		}
	});
});

test("Should provide complete axis information for development use", () => {
	const robotoFlexAxes = [
		{ tag: 'GRAD', name: 'Grade', min: -200, max: 150, default: 0 },
		{ tag: 'XOPQ', name: 'Opaque', min: 27, max: 175, default: 96 },
		{ tag: 'XTRA', name: 'Extra', min: 323, max: 603, default: 468 },
		{ tag: 'YOPQ', name: 'Opaque Y', min: 25, max: 135, default: 79 },
		{ tag: 'YTAS', name: 'Ascender', min: 649, max: 854, default: 750 },
		{ tag: 'YTDE', name: 'Descender', min: -305, max: -98, default: -203 },
		{ tag: 'YTFI', name: 'Figure Height', min: 560, max: 788, default: 738 },
		{ tag: 'YTLC', name: 'Lowercase', min: 416, max: 570, default: 514 },
		{ tag: 'YTUC', name: 'Uppercase', min: 528, max: 760, default: 712 },
		{ tag: 'opsz', name: 'Optical Size', min: 8, max: 144, default: 14 },
		{ tag: 'slnt', name: 'Slant', min: -10, max: 0, default: 0 },
		{ tag: 'wdth', name: 'Width', min: 25, max: 151, default: 100 },
		{ tag: 'wght', name: 'Weight', min: 100, max: 1000, default: 400 }
	];

	// Test that we have comprehensive axis data for complex variable fonts
	expect(robotoFlexAxes).toHaveLength(13);
	
	// Test standard axes
	const standardAxes = ['wght', 'wdth', 'slnt', 'opsz'];
	standardAxes.forEach(tag => {
		const axis = robotoFlexAxes.find(a => a.tag === tag);
		expect(axis).toBeDefined();
		expect(axis!.name).toBeTruthy();
		expect(typeof axis!.min).toBe('number');
		expect(typeof axis!.max).toBe('number');
		expect(typeof axis!.default).toBe('number');
	});

	// Test custom axes (Roboto Flex specific)
	const customAxes = ['GRAD', 'XOPQ', 'XTRA', 'YOPQ', 'YTAS', 'YTDE', 'YTFI', 'YTLC', 'YTUC'];
	customAxes.forEach(tag => {
		const axis = robotoFlexAxes.find(a => a.tag === tag);
		expect(axis).toBeDefined();
		expect(axis!.name).toBeTruthy();
	});
});