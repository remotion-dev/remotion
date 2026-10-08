import {defineUnlistedScript} from 'wxt/utils/define-unlisted-script';
import {
	disableDragImageCaptureEvent,
	dragImageCaptureEvent,
	enableDragImageCaptureEvent,
} from '../drag-image-events';

export default defineUnlistedScript(() => {
	const bridgeKey = '__remotionCanvasCaptureDragImageBridgeInstalled';
	if (Reflect.get(window, bridgeKey)) {
		return;
	}

	Reflect.set(window, bridgeKey, true);
	let originalSetDragImage: DataTransfer['setDragImage'] | null = null;
	let wrappedSetDragImage: DataTransfer['setDragImage'] | null = null;

	document.addEventListener(enableDragImageCaptureEvent, () => {
		if (wrappedSetDragImage !== null) {
			return;
		}

		const original = DataTransfer.prototype.setDragImage;
		const setDragImage = function (
			this: DataTransfer,
			...args: Parameters<DataTransfer['setDragImage']>
		) {
			const result = original.apply(this, args);
			if (wrappedSetDragImage !== setDragImage) {
				return result;
			}

			try {
				document.dispatchEvent(
					new DragEvent(dragImageCaptureEvent, {
						relatedTarget: args[0],
						clientX: args[1],
						clientY: args[2],
						dataTransfer: this,
					}),
				);
			} catch {
				// Recording must not change the page's native drag behavior.
			}

			return result;
		};

		originalSetDragImage = original;
		wrappedSetDragImage = setDragImage;
		DataTransfer.prototype.setDragImage = setDragImage;
	});

	document.addEventListener(disableDragImageCaptureEvent, () => {
		if (
			wrappedSetDragImage !== null &&
			originalSetDragImage !== null &&
			DataTransfer.prototype.setDragImage === wrappedSetDragImage
		) {
			DataTransfer.prototype.setDragImage = originalSetDragImage;
		}

		originalSetDragImage = null;
		wrappedSetDragImage = null;
	});
});
