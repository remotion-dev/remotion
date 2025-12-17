import type {DrawElementToCanvasReturnValue} from '../draw-element-to-canvas';
import {drawElementToCanvas} from '../draw-element-to-canvas';
import {drawText} from './draw-text';

export const handleTextNode = async (
	node: Text,
	context: OffscreenCanvasRenderingContext2D,
): Promise<DrawElementToCanvasReturnValue> => {
	const span = document.createElement('span');

	const parent = node.parentNode;
	if (!parent) {
		throw new Error('Text node has no parent');
	}

	parent.insertBefore(span, node);
	span.appendChild(node);

	const value = await drawElementToCanvas({
		context,
		element: span,
		draw: drawText(span),
	});

	// Undo the layout manipulation
	parent.insertBefore(node, span);
	parent.removeChild(span);

	return value;
};
