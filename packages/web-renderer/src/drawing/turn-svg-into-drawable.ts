import {getEmbeddedFontStyleForSvg} from './embed-registered-fonts-in-svg';

const drawableBySvg = new WeakMap<
	SVGSVGElement,
	{
		fontStyleKey: string | null;
		serializedSvg: string;
		drawable: Promise<HTMLImageElement>;
	}
>();

export const turnSvgIntoDrawable = (svg: SVGSVGElement) => {
	const {fill, color} = getComputedStyle(svg);

	const originalTransform = svg.style.transform;
	const originalTransformOrigin = svg.style.transformOrigin;
	const originalMarginLeft = svg.style.marginLeft;
	const originalMarginRight = svg.style.marginRight;
	const originalMarginTop = svg.style.marginTop;
	const originalMarginBottom = svg.style.marginBottom;
	const originalFill = svg.style.fill;
	const originalColor = svg.style.color;

	svg.style.transform = 'none';
	svg.style.transformOrigin = '';
	// Margins were already included in the positioning calculation,
	// so we need to remove them to avoid double counting.
	svg.style.marginLeft = '0';
	svg.style.marginRight = '0';
	svg.style.marginTop = '0';
	svg.style.marginBottom = '0';
	svg.style.fill = fill;
	svg.style.color = color;
	const serializedSvg = new XMLSerializer()
		.serializeToString(svg)
		// eslint-disable-next-line no-control-regex
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

	svg.style.marginLeft = originalMarginLeft;
	svg.style.marginRight = originalMarginRight;
	svg.style.marginTop = originalMarginTop;
	svg.style.marginBottom = originalMarginBottom;
	svg.style.transform = originalTransform;
	svg.style.transformOrigin = originalTransformOrigin;
	svg.style.fill = originalFill;
	svg.style.color = originalColor;
	const embeddedFontStyle = getEmbeddedFontStyleForSvg(svg);
	const fontStyleKey = embeddedFontStyle?.cacheKey ?? null;
	const cached = drawableBySvg.get(svg);
	if (
		cached?.serializedSvg === serializedSvg &&
		cached.fontStyleKey === fontStyleKey
	) {
		return cached.drawable;
	}

	const drawable = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		const openingTagEnd = serializedSvg.indexOf('>');
		const blobParts: BlobPart[] =
			embeddedFontStyle === null || openingTagEnd === -1
				? [serializedSvg]
				: [
						serializedSvg.slice(0, openingTagEnd + 1),
						embeddedFontStyle.blob,
						serializedSvg.slice(openingTagEnd + 1),
					];
		const url = URL.createObjectURL(
			new Blob(blobParts, {type: 'image/svg+xml;charset=utf-8'}),
		);

		image.onload = function () {
			URL.revokeObjectURL(url);
			resolve(image);
		};

		image.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to convert SVG to image'));
		};

		image.src = url;
	});
	drawableBySvg.set(svg, {fontStyleKey, serializedSvg, drawable});
	drawable.catch(() => {
		if (drawableBySvg.get(svg)?.drawable === drawable) {
			drawableBySvg.delete(svg);
		}
	});
	return drawable;
};
