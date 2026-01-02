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
	rootElement,
}: {
	node: Text;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	rootElement: HTMLElement | SVGElement;
	onlyBackgroundClip: boolean;
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
		draw: drawText({span, logLevel}),
		logLevel,
		parentRect,
		internalState,
		rootElement,
		onlyBackgroundClip: false,
	});

	// Undo the layout manipulation
	parent.insertBefore(node, span);
	parent.removeChild(span);

	return value;
};
