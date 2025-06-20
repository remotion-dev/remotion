// bun --env-file=.env scripts/update-font-db.ts
//
// This script updates the Google Fonts database with the latest font information
// from the Google Fonts Web API. It enhances the data with variable font information
// including axis definitions for supported variable fonts.
//
// Features:
// - Fetches font metadata from Google Fonts API
// - Adds variable font axis information (tag, name, min, max, default)
// - Proper error handling for API key issues
// - Supports 30+ popular variable fonts with detailed axis data

import {$} from 'bun';

const response = await fetch(
	`https://content-webfonts.googleapis.com/v1/webfonts?capability=WOFF2&key=${process.env.GOOGLE_FONTS_API_KEY}`,
);

const json = await response.json();

// Check for API errors and stop if necessary
if (json.error) {
	if (json.error.code === 403) {
		console.error('Error: API access denied. Please check your GOOGLE_FONTS_API_KEY.');
	} else if (json.error.code === 400 && json.error.message.includes('API key not valid')) {
		console.error('Error: Invalid API key. Please provide a valid GOOGLE_FONTS_API_KEY.');
	} else {
		console.error('Error: API request failed.');
	}
	console.error(`API Error: ${json.error.message}`);
	process.exit(1);
}

// Check if we have valid data
if (!json.items || !Array.isArray(json.items)) {
	console.error('Error: Invalid response from Google Fonts API.');
	console.error('Response:', json);
	process.exit(1);
}

// Variable font axis definitions for known variable fonts
// Data sourced from Google Fonts variable font specifications
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
	],
	'Recursive': [
		{ tag: 'CASL', name: 'Casual', min: 0, max: 1, default: 0 },
		{ tag: 'CRSV', name: 'Cursive', min: 0, max: 1, default: 0.5 },
		{ tag: 'MONO', name: 'Monospace', min: 0, max: 1, default: 0 },
		{ tag: 'slnt', name: 'Slant', min: -15, max: 0, default: 0 },
		{ tag: 'wght', name: 'Weight', min: 300, max: 1000, default: 400 }
	],
	'Source Sans 3': [
		{ tag: 'wght', name: 'Weight', min: 200, max: 900, default: 400 }
	],
	'Figtree': [
		{ tag: 'wght', name: 'Weight', min: 300, max: 900, default: 400 }
	],
	'Work Sans': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Fira Code': [
		{ tag: 'wght', name: 'Weight', min: 300, max: 700, default: 400 }
	],
	'Crimson Pro': [
		{ tag: 'wght', name: 'Weight', min: 200, max: 900, default: 400 }
	],
	'Playfair Display': [
		{ tag: 'opsz', name: 'Optical Size', min: 5, max: 1200, default: 120 },
		{ tag: 'wght', name: 'Weight', min: 400, max: 900, default: 400 }
	],
	'Source Serif 4': [
		{ tag: 'opsz', name: 'Optical Size', min: 8, max: 60, default: 20 },
		{ tag: 'wght', name: 'Weight', min: 200, max: 900, default: 400 }
	],
	'Commissioner': [
		{ tag: 'FLAR', name: 'Flare', min: 0, max: 100, default: 0 },
		{ tag: 'VOLM', name: 'Volume', min: 0, max: 100, default: 0 },
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Red Hat Display': [
		{ tag: 'wght', name: 'Weight', min: 300, max: 900, default: 400 }
	],
	'Red Hat Text': [
		{ tag: 'wght', name: 'Weight', min: 300, max: 700, default: 400 }
	],
	'Space Grotesk': [
		{ tag: 'wght', name: 'Weight', min: 300, max: 700, default: 400 }
	],
	'Manrope': [
		{ tag: 'wght', name: 'Weight', min: 200, max: 800, default: 400 }
	],
	'JetBrains Mono': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 800, default: 400 }
	],
	'Epilogue': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Plus Jakarta Sans': [
		{ tag: 'wght', name: 'Weight', min: 200, max: 800, default: 400 }
	],
	'DM Sans': [
		{ tag: 'opsz', name: 'Optical Size', min: 9, max: 40, default: 24 },
		{ tag: 'wght', name: 'Weight', min: 100, max: 1000, default: 400 }
	],
	'Open Sans': [
		{ tag: 'wdth', name: 'Width', min: 75, max: 100, default: 100 },
		{ tag: 'wght', name: 'Weight', min: 300, max: 800, default: 400 }
	],
	'Roboto': [
		{ tag: 'wdth', name: 'Width', min: 75, max: 100, default: 100 },
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Poppins': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Montserrat': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Lato': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Source Code Pro': [
		{ tag: 'wght', name: 'Weight', min: 200, max: 900, default: 400 }
	],
	'Lora': [
		{ tag: 'wght', name: 'Weight', min: 400, max: 700, default: 400 }
	],
	'Merriweather': [
		{ tag: 'wght', name: 'Weight', min: 300, max: 900, default: 400 }
	],
	'Nunito': [
		{ tag: 'wght', name: 'Weight', min: 200, max: 1000, default: 400 }
	],
	'Oswald': [
		{ tag: 'wght', name: 'Weight', min: 200, max: 700, default: 400 }
	],
	'PT Sans': [
		{ tag: 'wght', name: 'Weight', min: 400, max: 700, default: 400 }
	],
	'Raleway': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Ubuntu': [
		{ tag: 'wght', name: 'Weight', min: 300, max: 700, default: 400 }
	],
	'Cabin': [
		{ tag: 'wdth', name: 'Width', min: 75, max: 100, default: 100 },
		{ tag: 'wght', name: 'Weight', min: 400, max: 700, default: 400 }
	],
	'Heebo': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Libre Franklin': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'Rubik': [
		{ tag: 'wght', name: 'Weight', min: 300, max: 900, default: 400 }
	],
	'Source Sans Pro': [
		{ tag: 'wght', name: 'Weight', min: 200, max: 900, default: 400 }
	],
	'Titillium Web': [
		{ tag: 'wght', name: 'Weight', min: 200, max: 900, default: 400 }
	],
	'Barlow': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	],
	'IBM Plex Sans': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 700, default: 400 }
	],
	'Roboto Slab': [
		{ tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 }
	]
};

// Function to detect if a font is variable and add axis data
function enhanceWithVariableFontData(fonts: any[]) {
	let variableFontCount = 0;
	
	const enhanced = fonts.map(font => {
		const axes = variableFontAxes[font.family];
		if (axes) {
			variableFontCount++;
			console.log(`✓ Enhanced variable font: ${font.family} (${axes.length} axes)`);
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
	
	console.log(`\nEnhanced ${variableFontCount} variable fonts out of ${fonts.length} total fonts.`);
	return enhanced;
}

// Enhance the fonts data with variable font information
const enhancedFonts = enhanceWithVariableFontData(json.items);

const contents = `
// Auto-generated by scripts/update-font-db.ts

export type FontAxis = {
  tag: string;
  name: string;
  min: number;
  max: number;
  default: number;
};

export type Font = {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  category: string;
  files?: unknown;
  kind?: unknown;
  menu?: unknown;
  isVariable: boolean;
  axes?: FontAxis[];
};

export const googleFonts: Font[] = ${JSON.stringify(enhancedFonts, null, 2)};
`.trimStart();

await Bun.write(__dirname + '/google-fonts.ts', contents);
await $`bunx prettier --write ${__dirname}/google-fonts.ts`;

const packageJson = JSON.parse(await Bun.file('package.json').text());
packageJson.typesVersions['>=1.0'] = {};
await Bun.write('package.json', JSON.stringify(packageJson, null, 2));

await $`bun scripts/generate.ts && bun scripts/generate-index.ts`;
await $`bunx prettier --write src`;
await $`bun run make`;
await $`bun ensure-generation.ts`;

export {};
