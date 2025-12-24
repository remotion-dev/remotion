export type DrawFn = ({
	computedStyle,
	contextToDraw,
	dimensions,
}: {
	dimensions: DOMRect;
	computedStyle: CSSStyleDeclaration;
	contextToDraw: OffscreenCanvasRenderingContext2D;
}) => Promise<void> | void;
