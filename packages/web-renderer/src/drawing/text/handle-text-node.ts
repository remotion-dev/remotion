import type {LogLevel} from 'remotion';
import type {InternalState} from '../../internal-state';
import type {TransformStyleCache} from '../calculate-transforms';
import type {ProcessNodeReturnValue} from '../process-node';
import {processNode} from '../process-node';
import type {SvgFontSnapshots} from '../turn-svg-into-drawable';
import {drawText} from './draw-text';

export const handleTextNode = async ({
	node,
	context,
	logLevel,
	parentRect,
	internalState,
	rootElement,
	onlyBackgroundClipText,
	scale,
	waitForPageResponsiveness,
	svgFontSnapshots,
	transformStyleCache,
	isolatedElements,
}: {
	node: Text;
	context: OffscreenCanvasRenderingContext2D;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	rootElement: HTMLElement | SVGElement;
	onlyBackgroundClipText: boolean;
	scale: number;
	waitForPageResponsiveness: (() => Promise<void>) | null;
	svgFontSnapshots: SvgFontSnapshots;
	transformStyleCache: TransformStyleCache;
	isolatedElements: WeakSet<Element>;
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
		rootElement,
		scale,
		waitForPageResponsiveness,
		transformStyleCache,
		isolatedElements,
		svgFontSnapshots,
	});

	// Undo the layout manipulation
	parent.insertBefore(node, span);
	parent.removeChild(span);

	return value;
};
