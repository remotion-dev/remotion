import type {LogLevel} from 'remotion';
import type {TransformStyleCache} from './drawing/calculate-transforms';
import {drawDomElement} from './drawing/draw-dom-element';
import type {ProcessNodeReturnValue} from './drawing/process-node';
import {processNode} from './drawing/process-node';
import {handleTextNode} from './drawing/text/handle-text-node';
import type {SvgFontSnapshots} from './drawing/turn-svg-into-drawable';
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
	waitForPageResponsiveness,
	svgFontSnapshots,
	transformStyleCache,
	isolatedElements,
}: {
	node: Node;
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
	if (node instanceof HTMLElement || node instanceof SVGElement) {
		return processNode({
			element: node,
			context,
			draw: drawDomElement(node, svgFontSnapshots),
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
			waitForPageResponsiveness,
			transformStyleCache,
			isolatedElements,
			svgFontSnapshots,
		});
	}

	throw new Error('Unknown node type');
};
