export const captureEffectPreviewSnapshot = (
	element: Element | null,
): HTMLCanvasElement | null => {
	if (!element) {
		return null;
	}

	let canvas: HTMLCanvasElement | null = null;
	try {
		const view = element.ownerDocument.defaultView;
		if (!view) {
			return null;
		}

		const directSource = ['CANVAS', 'IMG', 'VIDEO'].includes(element.tagName);
		const candidates = directSource
			? [element]
			: Array.from(element.querySelectorAll('canvas, img, video')).filter(
					(candidate) => {
						// Canvas fallback children are not part of the rendered frame.
						if (candidate.parentElement?.closest('canvas')) {
							return false;
						}

						for (
							let ancestor: Element | null = candidate;
							ancestor && ancestor !== element;
							ancestor = ancestor.parentElement
						) {
							const candidateStyle = view.getComputedStyle(ancestor);
							if (
								candidateStyle.display === 'none' ||
								candidateStyle.visibility === 'hidden' ||
								candidateStyle.opacity === '0'
							) {
								return false;
							}
						}

						return true;
					},
				);
		// A wrapper with several visible sources is not one capturable element.
		if (candidates.length !== 1) {
			return null;
		}

		const source = candidates[0] as
			| HTMLCanvasElement
			| HTMLImageElement
			| HTMLVideoElement;
		let intrinsicWidth: number;
		let intrinsicHeight: number;
		if (source.tagName === 'IMG') {
			const image = source as HTMLImageElement;
			if (!image.complete) {
				return null;
			}

			intrinsicWidth = image.naturalWidth;
			intrinsicHeight = image.naturalHeight;
		} else if (source.tagName === 'VIDEO') {
			const video = source as HTMLVideoElement;
			if (video.readyState < 2) {
				return null;
			}

			intrinsicWidth = video.videoWidth;
			intrinsicHeight = video.videoHeight;
		} else {
			intrinsicWidth = source.width;
			intrinsicHeight = source.height;
		}

		if (intrinsicWidth <= 0 || intrinsicHeight <= 0) {
			return null;
		}

		const style = view.getComputedStyle(source);
		const contentWidth =
			Number.parseFloat(style.width) -
			(style.boxSizing === 'border-box'
				? Number.parseFloat(style.paddingLeft) +
					Number.parseFloat(style.paddingRight) +
					Number.parseFloat(style.borderLeftWidth) +
					Number.parseFloat(style.borderRightWidth)
				: 0);
		const contentHeight =
			Number.parseFloat(style.height) -
			(style.boxSizing === 'border-box'
				? Number.parseFloat(style.paddingTop) +
					Number.parseFloat(style.paddingBottom) +
					Number.parseFloat(style.borderTopWidth) +
					Number.parseFloat(style.borderBottomWidth)
				: 0);
		// Canvas pixels already include the element's authored effect chain. For
		// native media, capture its content box and the displayed object fit.
		const width =
			source.tagName === 'CANVAS'
				? intrinsicWidth
				: Number.isFinite(contentWidth)
					? contentWidth
					: intrinsicWidth;
		const height =
			source.tagName === 'CANVAS'
				? intrinsicHeight
				: Number.isFinite(contentHeight)
					? contentHeight
					: intrinsicHeight;
		if (
			!Number.isFinite(width) ||
			!Number.isFinite(height) ||
			width <= 0 ||
			height <= 0
		) {
			return null;
		}

		canvas = element.ownerDocument.createElement('canvas');
		canvas.width = Math.max(1, Math.round(width));
		canvas.height = Math.max(1, Math.round(height));
		const context = canvas.getContext('2d');
		if (!context) {
			return null;
		}

		let drawWidth = canvas.width;
		let drawHeight = canvas.height;
		if (source.tagName !== 'CANVAS' && style.objectFit !== 'fill') {
			const containScale = Math.min(
				canvas.width / intrinsicWidth,
				canvas.height / intrinsicHeight,
			);
			const scale =
				style.objectFit === 'cover'
					? Math.max(
							canvas.width / intrinsicWidth,
							canvas.height / intrinsicHeight,
						)
					: style.objectFit === 'contain'
						? containScale
						: style.objectFit === 'scale-down'
							? Math.min(1, containScale)
							: style.objectFit === 'none'
								? 1
								: null;
			if (scale !== null) {
				drawWidth = intrinsicWidth * scale;
				drawHeight = intrinsicHeight * scale;
			}
		}

		const position =
			source.tagName === 'CANVAS'
				? ['0px', '0px']
				: style.objectPosition.split(' ');
		const offsets = [canvas.width - drawWidth, canvas.height - drawHeight].map(
			(remaining, index) => {
				const value = position[index] ?? '50%';
				if (value.endsWith('%')) {
					return (remaining * Number.parseFloat(value)) / 100;
				}

				if (value.endsWith('px')) {
					return Number.parseFloat(value);
				}

				return remaining / 2;
			},
		);
		context.drawImage(source, offsets[0], offsets[1], drawWidth, drawHeight);
		// Detect a tainted capture once, before attempting every effect preview.
		context.getImageData(0, 0, 1, 1);
		return canvas;
	} catch {
		if (canvas) {
			canvas.width = 0;
			canvas.height = 0;
		}

		return null;
	}
};
