import {
	startCapturedPointerSession,
	startDeferredCapturedPointerSession,
} from './pointer-session';

export const startEscapeCancelableSession = (
	startSession: (onEnd: () => void) => () => void,
): (() => void) => {
	let ended = false;
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape') {
			return;
		}

		// Cancel before Escape reaches selection or menu shortcuts.
		event.preventDefault();
		event.stopImmediatePropagation();
		stopSession();
	};

	const onEnd = () => {
		ended = true;
		window.removeEventListener('keydown', onKeyDown, true);
	};

	const stopSession = startSession(onEnd);
	if (!ended) {
		window.addEventListener('keydown', onKeyDown, true);
	}

	return () => {
		onEnd();
		stopSession();
	};
};

const withEscapeCancellation = <
	Options extends {
		onEnd: Parameters<typeof startCapturedPointerSession>[0]['onEnd'];
	},
>(
	startSession: (options: Options) => () => void,
) => {
	return (options: Options): (() => void) => {
		return startEscapeCancelableSession((onEnd) =>
			startSession({
				...options,
				onEnd: (reason, event) => {
					onEnd();
					options.onEnd(reason, event);
				},
			}),
		);
	};
};

export const startEscapeCancelableCapturedPointerSession =
	withEscapeCancellation(startCapturedPointerSession);

export const startEscapeCancelableDeferredPointerSession =
	withEscapeCancellation(startDeferredCapturedPointerSession);
