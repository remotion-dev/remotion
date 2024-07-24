import type {RefObject} from 'react';
import {getRemotionEnvironment} from './get-remotion-environment';

export const playAndHandleNotAllowedError = (
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>,
	mediaType: 'audio' | 'video',
	onAutoPlayError: null | (() => void),
) => {
	const {current} = mediaRef;
	if (!current) {
		return;
	}

	const prom = current.play();

	if (prom.catch) {
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
			if (
				err.message.includes('request was interrupted by a new load request')
			) {
				return;
			}

			// Audio tag got unmounted
			if (
				err.message.includes('because the media was removed from the document')
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

				// eslint-disable-next-line no-console
				console.log(`The video will be muted and we'll retry playing it.`);
				if (mediaType === 'video' && getRemotionEnvironment().isPlayer) {
					// eslint-disable-next-line no-console
					console.log('Use onAutoPlayError() to handle this error yourself.');
				}

				current.muted = true;
				current.play();
			}
		});
	}
};
