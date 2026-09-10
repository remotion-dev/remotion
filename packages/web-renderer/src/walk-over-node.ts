import type {LogLevel} from 'remotion';
import type {TransformStyleCache} from './drawing/calculate-transforms';
import {drawDomElement} from './drawing/draw-dom-element';
import type {ProcessNodeReturnValue} from './drawing/process-node';
import {processNode} from './drawing/process-node';
import {handleTextNode} from './drawing/text/handle-text-node';
import type {InternalState} from './internal-state';
import type {SvgFonts} from './svg-fonts';

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
	svgFonts,
	transformStyleCache,
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
	svgFonts: SvgFonts | null;
	transformStyleCache: TransformStyleCache;
}): Promise<ProcessNodeReturnValue> => {
	if (node instanceof HTMLElement || node instanceof SVGElement) {
		return processNode({
			element: node,
			context,
			draw: drawDomElement({node, svgFonts}),
			logLevel,
			parentRect,
			internalState,
			rootElement,
			scale,
			waitForPageResponsiveness,
			svgFonts,
			transformStyleCache,
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
			svgFonts,
			transformStyleCache,
		});
	}

	throw new Error('Unknown node type');
};
