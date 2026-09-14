import {NoReactInternals} from 'remotion/no-react';

const base64ByUrl = new Map<string, Promise<string>>();

const getBase64 = (url: string): Promise<string> => {
	const cached = base64ByUrl.get(url);
	if (cached) {
		return cached;
	}

	const promise = fetch(url)
		.then((response) => {
			if (!response.ok) {
				throw new Error(
					`Failed to load font ${JSON.stringify(url)} for SVG: ${response.status} ${response.statusText}`,
				);
			}

			return response.arrayBuffer();
		})
		.then((arrayBuffer) => {
			const bytes = new Uint8Array(arrayBuffer);
			let binary = '';
			for (let offset = 0; offset < bytes.length; offset += 0x8000) {
				binary += String.fromCharCode(
					...bytes.subarray(offset, offset + 0x8000),
				);
			}

			return btoa(binary);
		})
		.catch((error) => {
			base64ByUrl.delete(url);
			throw error;
		});

	base64ByUrl.set(url, promise);
	return promise;
};

export const embedRegisteredFontsInSvg = async ({
	svg,
	svgData,
}: {
	svg: SVGSVGElement;
	svgData: string;
}): Promise<string> => {
	const textElements = svg.querySelectorAll('text, tspan, textPath');
	if (textElements.length === 0) {
		return svgData;
	}

	const usedFontFamilies = new Set<string>();
	for (const textElement of textElements) {
		for (const family of getComputedStyle(textElement).fontFamily.split(',')) {
			usedFontFamilies.add(
				family
					.trim()
					.replace(/^(['"])(.*)\1$/, '$2')
					.toLowerCase(),
			);
		}
	}

	const fonts = NoReactInternals.getRegisteredFontFaces().filter((font) =>
		usedFontFamilies.has(font.fontFamily.toLowerCase()),
	);
	if (fonts.length === 0) {
		return svgData;
	}

	const mimeTypes = {
		opentype: 'font/otf',
		truetype: 'font/ttf',
		woff: 'font/woff',
		woff2: 'font/woff2',
	} as const;
	const fontRules = await Promise.all(
		fonts.map(async (font) => {
			const declarations = [
				`font-family:${JSON.stringify(font.fontFamily)}`,
				`src:url(data:${mimeTypes[font.format]};base64,${await getBase64(font.fontUrl)}) format(${JSON.stringify(font.format)})`,
			];
			if (font.style !== null) {
				declarations.push(`font-style:${font.style}`);
			}

			if (font.weight !== null) {
				declarations.push(`font-weight:${font.weight}`);
			}

			if (font.stretch !== null) {
				declarations.push(`font-stretch:${font.stretch}`);
			}

			if (font.unicodeRange !== null) {
				declarations.push(`unicode-range:${font.unicodeRange}`);
			}

			return `@font-face{${declarations.join(';')}}`;
		}),
	);
	const openingTagEnd = svgData.indexOf('>');
	if (openingTagEnd === -1) {
		return svgData;
	}

	const css = fontRules.join('').replace(/]]>/g, ']]]]><![CDATA[>');
	const style = `<style type="text/css"><![CDATA[${css}]]></style>`;

	return (
		svgData.slice(0, openingTagEnd + 1) +
		style +
		svgData.slice(openingTagEnd + 1)
	);
};
