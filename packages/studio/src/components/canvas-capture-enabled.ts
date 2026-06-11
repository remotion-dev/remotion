export type CanvasCaptureTarget =
	| 'canvas'
	| 'timeline-list'
	| 'timeline-tracks'
	| 'timeline'
	| 'undo-redo'
	| 'full-studio'
	| 'off';

export const CANVAS_CAPTURE_TARGET: CanvasCaptureTarget = 'off';
