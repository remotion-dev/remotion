import type {LogLevel} from 'remotion';
import type {InternalState} from '../../internal-state';
import type {ProcessNodeReturnValue} from '../process-node';
import {processNode} from '../process-node';
import {drawText} from './draw-text';

export const handleTextNode = async ({
	node,
	context,
	logLevel,
	parentRect,
	internalState,
	transformRoot,
	onlyBackgroundClipText,
	scale,
}: {
	node: Text;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	transformRoot: HTMLElement | SVGElement;
	onlyBackgroundClipText: boolean;
	scale: number;
}): Promise<ProcessNodeReturnValue> => {
	const span = document.createElement('span');

	const parent = node.parentNode;
	if (!parent) {
		throw new Error('Text node has no parent');
	}

	parent.insertBefore(span, node);
	span.appendChild(node);

	const value = await processNode({
		context,
		element: span,
		draw: drawText({span, logLevel, onlyBackgroundClipText, parentRect}),
		logLevel,
		parentRect,
		internalState,
		transformRoot,
		scale,
	});

	// Undo the layout manipulation
	parent.insertBefore(node, span);
	parent.removeChild(span);

	return value;
};
