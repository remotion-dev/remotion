/* eslint-disable no-console */
/* eslint-disable react/require-default-props */
import Hls from 'hls.js';
import type Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import type {MutableRefObject} from 'react';
import {forwardRef, useCallback, useEffect, useRef, useState} from 'react';
import './video-player.css';

export interface HTMLVideoElementWithPlyr extends HTMLVideoElement {
	plyr: Plyr;
}

const useCombinedRefs = function (
	...refs: (
		| ((instance: HTMLVideoElementWithPlyr | null) => void)
		| MutableRefObject<HTMLVideoElementWithPlyr | null>
		| null
	)[]
): MutableRefObject<HTMLVideoElementWithPlyr | null> {
	const targetRef = useRef(null);

	useEffect(() => {
		refs.forEach((ref) => {
			if (!ref) return;

			if (typeof ref === 'function') {
				ref(targetRef.current);
			} else {
				ref.current = targetRef.current;
			}
		});
	}, [refs]);

	return targetRef;
};

/*
 * We need to set the width/height of the player depending on what the dimensions of
 * the underlying video source is.
 *
 * On most platforms we know the dimensions on 'loadedmetadata'
 * On Desktop Safari we don't know the dimensions until 'canplay'
 *
 * At first, I tried to get the dimensions of the video from these callbacks, that worked
 * great except for on moble Safari. On Mobile Safari none of those callbacks fire until
 * there is some user interaction :(
 *
 * BUT! There is a brilliant hack here. We can create a `display: none` `img` element in the
 * DOM, load up the poster image.
 *
 * Since the poster image will have the same dimensions of the video, now we know if the video
 * is vertical and now we can style the proper width/height so the layout doesn't have a sudden
 * jump or resize.
 *
 */

type Props = {
	readonly playbackId: string;
	readonly poster: string;
	readonly currentTime?: number;
	readonly onLoaded: () => void;
	readonly onError: (error: ErrorEvent) => void;
	readonly onSize: (dim: {width: number; height: number}) => void;
	readonly autoPlay?: boolean;
};

type SizedEvent = {
	target: {
		width: number;
		height: number;
	};
};

export const VideoPlayerWithControls = forwardRef<
	HTMLVideoElementWithPlyr,
	Props
>(
	(
		{playbackId, poster, currentTime, onLoaded, onError, onSize, autoPlay},
		ref,
	) => {
		const videoRef = useRef<HTMLVideoElementWithPlyr>(null);
		const metaRef = useCombinedRefs(ref, videoRef);
		const playerRef = useRef<Plyr | null>(null);
		const [playerInitTime] = useState(Date.now());

		const videoError = useCallback(
			(event: ErrorEvent) => onError(event),
			[onError],
		);

		const onImageLoad = useCallback(
			(event: SizedEvent) => {
				const [w, h] = [event.target.width, event.target.height];
				if (w && h) {
					onSize({width: w, height: h});
					onLoaded();
				} else {
					onLoaded();

					console.error('Error getting img dimensions', event);
				}
			},
			[onLoaded, onSize],
		);

		/*
		 * See comment above -- we're loading the poster image just so we can grab the dimensions
		 * which determines styles for the player
		 */
		useEffect(() => {
			const img = new Image();
			img.onload = (evt) => onImageLoad(evt as unknown as SizedEvent);
			img.src = poster;
		}, [onImageLoad, poster]);

		useEffect(() => {
			const video = videoRef.current;
			const src = `https://stream.mux.com/${playbackId}.m3u8`;
			let hls: Hls | null;
			hls = null;
			if (video) {
				video.addEventListener('error', videoError);
				const Plyr = require('plyr');
				playerRef.current = new Plyr(video, {
					previewThumbnails: {
						enabled: true,
						src: `https://image.mux.com/${playbackId}/storyboard.vtt`,
					},
					storage: {enabled: false},
					fullscreen: {
						iosNative: true,
					},
					captions: {active: true, language: 'auto', update: true},
				});

				if (video.canPlayType('application/vnd.apple.mpegurl')) {
					// This will run in safari, where HLS is supported natively
					video.src = src;
				} else if (Hls.isSupported()) {
					// This will run in all other modern browsers
					hls = new Hls();
					hls.loadSource(src);
					hls.attachMedia(video);
					hls.on(Hls.Events.ERROR, (_event, data) => {
						if (data.fatal) {
							videoError(new ErrorEvent('HLS.js fatal error'));
						}
					});
				} else {
					console.error(
						'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API',
					);
				}
			}

			return () => {
				if (video) {
					video.removeEventListener('error', videoError);
				}

				if (hls) {
					hls.destroy();
				}
			};
		}, [playbackId, playerInitTime, videoError, videoRef]);

		useEffect(() => {
			const video = videoRef.current;
			if (currentTime && video) {
				video.currentTime = currentTime;
			}
		}, [currentTime]);

		return (
			<div className="video-container">
				<video
					ref={metaRef}
					autoPlay={autoPlay}
					poster={poster}
					controls
					playsInline
				/>
			</div>
		);
	},
);
