import {
	getEmbeddedFontStyleForSvg,
	insertFontStyleInSvg,
} from './embed-registered-fonts-in-svg';

const textFontProperties = [
	'font-family',
	'font-size',
	'font-style',
	'font-weight',
	'font-stretch',
] as const;

const getReferencedTemplates = (svg: SVGSVGElement) => {
	const documentUrl = new URL(svg.ownerDocument.URL);
	documentUrl.hash = '';
	const templates = new Set<Element>();
	for (const use of svg.querySelectorAll('use')) {
		try {
			const url = new URL(use.href.baseVal, use.baseURI);
			const id = decodeURIComponent(url.hash.slice(1));
			url.hash = '';
			if (url.href !== documentUrl.href) continue;
			const template = svg.getElementById(id);
			if (template) templates.add(template);
		} catch {
			// Invalid authored references do not instantiate a template.
			continue;
		}
	}

	return templates;
};

const drawableBySvg = new WeakMap<
	SVGSVGElement,
	{
		fontStyleKey: string | null;
		serializedSvg: string;
		drawable: Promise<HTMLImageElement>;
	}
>();

export const turnSvgIntoDrawable = (svg: SVGSVGElement) => {
	const {fill, color, width, height} = getComputedStyle(svg);
	const textElements = Array.from(
		svg.querySelectorAll('text, tspan, textPath'),
	);
	const referencedTemplates = textElements.length
		? getReferencedTemplates(svg)
		: new Set<Element>();
	const textStyles = textElements.map((element) => {
		// Templates inherit font selection from each <use> instance.
		if (element.closest('defs, symbol')) return null;
		let ancestor: Element = element;
		while (ancestor !== svg) {
			if (referencedTemplates.has(ancestor)) return null;
			ancestor = ancestor.parentElement!;
		}

		const style = getComputedStyle(element);
		return textFontProperties.map((property) =>
			style.getPropertyValue(property),
		);
	});

	const embeddedFontStyle = getEmbeddedFontStyleForSvg(svg);
	// Non-CSS style elements do not parse carried font rules. Clone sheets are detached.
	const fontStyleIndex = Array.from(svg.querySelectorAll('style'), (style) =>
		Boolean(style.sheet),
	).lastIndexOf(true);
	const originalStyle = svg.getAttribute('style');
	const originalWidth = svg.getAttribute('width');
	const originalHeight = svg.getAttribute('height');
	const needsExplicitDimensions =
		svg.preserveAspectRatio.baseVal.align ===
		SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_NONE;

	// SVG images need explicit dimensions to preserve their viewport when
	// preserveAspectRatio="none" removes the intrinsic aspect ratio.
	if (needsExplicitDimensions) {
		svg.setAttribute('width', width);
		svg.setAttribute('height', height);
	}

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
	// External stylesheet rules disappear when the SVG becomes an image.
	// Preserve resolved font selection without mutating mounted text elements.
	const svgForSerialization =
		textStyles.length === 0 && embeddedFontStyle === null
			? svg
			: (svg.cloneNode(true) as SVGSVGElement);
	svgForSerialization
		.querySelectorAll<SVGTextContentElement>('text, tspan, textPath')
		.forEach((element, index) => {
			const fontStyle = textStyles[index];
			if (fontStyle === null) return;
			textFontProperties.forEach((property, propertyIndex) => {
				element.style.setProperty(
					property,
					fontStyle[propertyIndex],
					'important',
				);
			});
		});
	if (embeddedFontStyle)
		insertFontStyleInSvg(
			svgForSerialization,
			embeddedFontStyle.css,
			fontStyleIndex,
		);
	const serializedSvg = new XMLSerializer()
		.serializeToString(svgForSerialization)
		// eslint-disable-next-line no-control-regex
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

	if (originalStyle === null) {
		svg.removeAttribute('style');
	} else {
		svg.setAttribute('style', originalStyle);
	}

	if (needsExplicitDimensions) {
		if (originalWidth === null) {
			svg.removeAttribute('width');
		} else {
			svg.setAttribute('width', originalWidth);
		}

		if (originalHeight === null) {
			svg.removeAttribute('height');
		} else {
			svg.setAttribute('height', originalHeight);
		}
	}

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
		const blob = new Blob([serializedSvg], {
			type: 'image/svg+xml;charset=utf-8',
		});
		// Chromium taints canvases drawn from blob SVGs containing foreignObject.
		const url = svg.querySelector('foreignObject')
			? null
			: URL.createObjectURL(blob);

		image.onload = function () {
			if (url !== null) URL.revokeObjectURL(url);
			resolve(image);
		};

		image.onerror = () => {
			if (url !== null) URL.revokeObjectURL(url);
			reject(new Error('Failed to convert SVG to image'));
		};

		if (url !== null) {
			image.src = url;
		} else {
			blob
				.text()
				.then((markup) => {
					image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
				})
				.catch(reject);
		}
	});
	drawableBySvg.set(svg, {fontStyleKey, serializedSvg, drawable});
	drawable.catch(() => {
		if (drawableBySvg.get(svg)?.drawable === drawable) {
			drawableBySvg.delete(svg);
		}
	});
	return drawable;
};
