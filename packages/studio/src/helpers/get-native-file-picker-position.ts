import type {PickOpenTimelineRequest} from '@remotion/studio-shared';

export const getNativeFilePickerPosition =
	(): PickOpenTimelineRequest['position'] => {
		const {screenX, screenY, outerWidth, outerHeight} = window;
		if (
			![screenX, screenY, outerWidth, outerHeight].every(Number.isFinite) ||
			outerWidth <= 0 ||
			outerHeight <= 0
		) {
			return null;
		}

		return {x: screenX + outerWidth / 2, y: screenY + outerHeight / 2};
	};
