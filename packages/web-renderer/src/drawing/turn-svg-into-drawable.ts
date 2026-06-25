const stripInvalidXmlCharacters = (value: string) => {
	let sanitized = '';

	for (let i = 0; i < value.length; i++) {
		const charCode = value.charCodeAt(i);
		const isInvalidControlCharacter =
			charCode <= 8 || charCode === 11 || charCode === 12 || charCode === 14;

		if (isInvalidControlCharacter || (charCode >= 15 && charCode <= 31)) {
			continue;
		}

		sanitized += value[i];
	}

	return sanitized;
};

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
	const svgData = stripInvalidXmlCharacters(
		new XMLSerializer().serializeToString(svg),
	);

	svg.style.marginLeft = originalMarginLeft;
	svg.style.marginRight = originalMarginRight;
	svg.style.marginTop = originalMarginTop;
	svg.style.marginBottom = originalMarginBottom;
	svg.style.transform = originalTransform;
	svg.style.transformOrigin = originalTransformOrigin;
	svg.style.fill = originalFill;
	svg.style.color = originalColor;

	return new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;

		image.onload = function () {
			resolve(image);
		};

		image.onerror = () => {
			reject(new Error('Failed to convert SVG to image'));
		};

		image.src = url;
	});
};
