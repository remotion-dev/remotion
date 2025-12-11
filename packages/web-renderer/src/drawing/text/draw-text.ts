import {withResolvers} from '../../with-resolvers';

export const drawTextToCanvas = async (
	parentElement: HTMLElement,
	context: OffscreenCanvasRenderingContext2D,
) => {
	const clientRect = parentElement.getBoundingClientRect();
	const computedStyle = getComputedStyle(parentElement);
	const clonedNode = parentElement.cloneNode(true) as HTMLElement;
	for (let i = 0; i < computedStyle.length; i++) {
		const propertyName = computedStyle[i];
		const value = computedStyle.getPropertyValue(propertyName);
		if (
			propertyName === 'margin-top' ||
			propertyName === 'margin-bottom' ||
			propertyName === 'margin-left' ||
			propertyName === 'margin-right' ||
			propertyName === 'margin'
		) {
			// @ts-expect-error - propertyName is a valid CSS property
			clonedNode.style[propertyName] = '0px';
			continue;
		}

		// @ts-expect-error - propertyName is a valid CSS property
		clonedNode.style[propertyName] = value;
	}

	// Create an SVG that contains the cloned node via a foreignObject
	const svgNS = 'http://www.w3.org/2000/svg';
	const svg = document.createElementNS(svgNS, 'svg');
	svg.setAttribute('width', `${clientRect.width}`);
	svg.setAttribute('height', `${clientRect.height}`);

	const foreignObject = document.createElementNS(svgNS, 'foreignObject');
	foreignObject.setAttribute('x', '0');
	foreignObject.setAttribute('y', '0');
	foreignObject.setAttribute('width', `${clientRect.width}`);
	foreignObject.setAttribute('height', `${clientRect.height}`);

	// The cloned node must be in XHTML namespace to render properly
	const xhtmlNS = 'http://www.w3.org/1999/xhtml';
	const wrappedDiv = document.createElementNS(xhtmlNS, 'div');
	wrappedDiv.style.width = `${clientRect.width}px`;
	wrappedDiv.style.height = `${clientRect.height}px`;
	wrappedDiv.appendChild(clonedNode);

	foreignObject.appendChild(wrappedDiv);
	svg.appendChild(foreignObject);

	// Convert SVG to data URL
	const serializer = new XMLSerializer();
	const svgString = serializer.serializeToString(svg);
	const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

	const {promise, resolve, reject} = withResolvers<HTMLImageElement>();
	// Create image and draw when loaded
	const img = new window.Image();
	img.onload = function () {
		resolve(img);
	};

	img.onerror = function (err) {
		// We may want to add robust error handling here
		reject(err);
	};

	img.src = svgDataUrl;

	await promise;

	console.log(clientRect);
	context.drawImage(
		img,
		clientRect.left,
		clientRect.top,
		clientRect.width,
		clientRect.height,
	);
};
