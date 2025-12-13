export const handleTextNode = (
	node: Text,
	context: OffscreenCanvasRenderingContext2D,
) => {
	// Save the canvas context state
	context.save();

	// Create a new span element
	const span = document.createElement('span');
	const parent = node.parentNode;
	if (!parent) {
		throw new Error('Text node has no parent');
	}

	parent.insertBefore(span, node);
	span.appendChild(node);
	const rect = span.getBoundingClientRect();
	const style = getComputedStyle(span);
	const {fontFamily, fontSize, color} = style;

	context.font = `${fontSize} ${fontFamily}`;
	context.fillStyle = color;
	context.fillText(node.textContent, rect.left, rect.top);

	// Undo the layout manipulation
	parent.insertBefore(node, span);
	parent.removeChild(span);

	// Restore the canvas context state
	context.restore();
};
