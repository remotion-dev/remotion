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

	const originalStyle = svg.getAttribute('style');

	// Position and transforms are applied by the canvas renderer. Remove them
	// from the serialized SVG so they are not applied again inside its viewport.
	svg.style.position = 'static';
	svg.style.inset = 'auto';
	svg.style.transform = 'none';
	svg.style.translate = 'none';
	svg.style.scale = 'none';
	svg.style.rotate = 'none';
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

	if (originalStyle === null) {
		svg.removeAttribute('style');
	} else {
		svg.setAttribute('style', originalStyle);
	}

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
