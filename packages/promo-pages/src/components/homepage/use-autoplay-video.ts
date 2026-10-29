import {useEffect, useRef} from 'react';

export const useAutoplayVideo = (src: string | null) => {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video || !src) {
			return;
		}

		const play = () => {
			if (document.hidden) {
				return;
			}

			video.play().catch(() => {
				// Autoplay may still be blocked by the browser.
			});
		};

		const onPageShow = (event: PageTransitionEvent) => {
			if (event.persisted) {
				// A cached page can retain a playing state with a frozen decoder.
				video.load();
			}

			play();
		};

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					play();
				}
			},
			{root: null, threshold: 0.5},
		);
		observer.observe(video);
		// Restoring from the back/forward cache does not remount the video or
		// necessarily change its intersection with the viewport.
		window.addEventListener('pageshow', onPageShow);
		document.addEventListener('visibilitychange', play);
		play();

		return () => {
			observer.disconnect();
			window.removeEventListener('pageshow', onPageShow);
			document.removeEventListener('visibilitychange', play);
		};
	}, [src]);

	return videoRef;
};
