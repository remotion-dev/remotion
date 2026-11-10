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
	const {fill, color, width, height, opacity} = getComputedStyle(svg);

	// Only direct children can inherit the root opacity. Preserve their computed
	// values before neutralizing the root; descendants then inherit as authored.
	const childOpacities =
		opacity === '1'
			? []
			: Array.from(svg.children, (child) => ({
					child: child as SVGElement,
					opacity: getComputedStyle(child).opacity,
					style: child.getAttribute('style'),
				})).filter((child) => child.opacity !== '1');
	for (const child of childOpacities) {
		child.child.style.setProperty('opacity', child.opacity, 'important');
	}

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

	// Position, transforms, and opacity are applied by the canvas renderer. Remove them
	// from the serialized SVG so they are not applied again inside its viewport.
	svg.style.position = 'static';
	svg.style.inset = 'auto';
	svg.style.transform = 'none';
	svg.style.setProperty('opacity', '1', 'important');
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
	// CSSStyleSheet.disabled is runtime state and is not serialized as markup.
	// Neutralize rules only in a clone, preserving nodes for structural selectors.
	const styles = svg.querySelectorAll('style');
	const hasDisabledStyles = Array.from(styles).some(
		(style) => style.sheet?.disabled,
	);
	const serializationTarget = hasDisabledStyles
		? (svg.cloneNode(true) as SVGSVGElement)
		: svg;
	if (hasDisabledStyles) {
		const clonedStyles = serializationTarget.querySelectorAll('style');
		for (let i = 0; i < styles.length; i++) {
			if (styles[i].sheet?.disabled) {
				const text = styles[i].textContent;
				// Preserve :empty as well as the element's structural position.
				clonedStyles[i].textContent = text?.trim()
					? '/* Disabled stylesheet. */'
					: text;
			}
		}
	}

	const serializedSvg = new XMLSerializer()
		.serializeToString(serializationTarget)
		// eslint-disable-next-line no-control-regex
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

	for (const child of childOpacities) {
		if (child.style === null) {
			child.child.removeAttribute('style');
		} else {
			child.child.setAttribute('style', child.style);
		}
	}

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
		const blob = new Blob(blobParts, {type: 'image/svg+xml;charset=utf-8'});
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
