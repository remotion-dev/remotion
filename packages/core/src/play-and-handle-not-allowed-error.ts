import type {RefObject} from 'react';
import type {Logger} from './logger.js';

export const playAndHandleNotAllowedError = ({
	mediaRef,
	mediaType,
	onAutoPlayError,
	logger,
	reason,
	isPlayer,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>;
	mediaType: 'audio' | 'video';
	onAutoPlayError: null | (() => void);
	logger: Logger;
	reason: string;
	isPlayer: boolean;
}) => {
	const {current} = mediaRef;
	if (!current) {
		return;
	}

	logger.playback(
		'play',
		`Attempting to play ${current.src}. Reason: ${reason}`,
	);
	const prom = current.play();
	if (!prom.catch) {
		return;
	}

	prom.catch((err: Error) => {
		if (!current) {
			return;
		}

		// Pause was called after play in Chrome
		if (err.message.includes('request was interrupted by a call to pause')) {
			return;
		}

		// Pause was called after play in Safari
		if (err.message.includes('The operation was aborted.')) {
			return;
		}

		// Pause was called after play in Firefox
		if (
			err.message.includes(
				'The fetching process for the media resource was aborted by the user agent',
			)
		) {
			return;
		}

		// Got replaced by a different audio source in Chromium
		if (err.message.includes('request was interrupted by a new load request')) {
			return;
		}

		// Audio tag got unmounted
		if (
			err.message.includes('because the media was removed from the document')
		) {
			return;
		}

		// Audio tag got unmounted
		if (
			err.message.includes("user didn't interact with the document") &&
			current.muted
		) {
			return;
		}

		// eslint-disable-next-line no-console
		console.log(`Could not play ${mediaType} due to following error: `, err);
		if (!current.muted) {
			if (onAutoPlayError) {
				onAutoPlayError();
				return;
			}

			if (mediaType === 'video' && isPlayer) {
				logger.info(
					'<' + mediaType + '>',
					`The video will be muted and we'll retry playing it.`,
				);

				logger.info(
					'<' + mediaType + '>',
					'Use onAutoPlayError() to handle this error yourself.',
				);
				current.muted = true;
				current.play();
			}
		}
	});
};
