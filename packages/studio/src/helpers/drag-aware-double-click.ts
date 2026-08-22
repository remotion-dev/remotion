export type DragAwareDoubleClickTracker = {
	readonly beginPointerGesture: () => void;
	readonly endPointerGesture: (wasDragged: boolean) => void;
	readonly consumePointerGestureWasDragged: () => boolean;
};

export const createDragAwareDoubleClickTracker =
	(): DragAwareDoubleClickTracker => {
		let pointerGestureWasDragged = false;

		return {
			beginPointerGesture: () => {
				pointerGestureWasDragged = false;
			},
			endPointerGesture: (wasDragged) => {
				pointerGestureWasDragged = wasDragged;
			},
			consumePointerGestureWasDragged: () => {
				const wasDragged = pointerGestureWasDragged;
				pointerGestureWasDragged = false;
				return wasDragged;
			},
		};
	};
