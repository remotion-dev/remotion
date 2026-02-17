import type {LogLevel} from 'remotion';
import {drawDomElement} from './drawing/draw-dom-element';
import type {ProcessNodeReturnValue} from './drawing/process-node';
import {processNode} from './drawing/process-node';
import {handleTextNode} from './drawing/text/handle-text-node';
import type {InternalState} from './internal-state';

export const walkOverNode = ({
	node,
	context,
	logLevel,
	parentRect,
	internalState,
	rootElement,
	onlyBackgroundClipText,
	scale,
}: {
	node: Node;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	rootElement: HTMLElement | SVGElement;
	onlyBackgroundClipText: boolean;
	scale: number;
}): Promise<ProcessNodeReturnValue> => {
	if (node instanceof HTMLElement || node instanceof SVGElement) {
		return processNode({
			element: node,
			context,
			draw: drawDomElement(node),
			logLevel,
			parentRect,
			internalState,
			rootElement,
			scale,
		});
	}

	if (node instanceof Text) {
		return handleTextNode({
			node,
			context,
			logLevel,
			parentRect,
			internalState,
			rootElement,
			onlyBackgroundClipText,
			scale,
		});
	}

	throw new Error('Unknown node type');
};
