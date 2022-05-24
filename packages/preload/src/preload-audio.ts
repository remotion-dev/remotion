const resolveRedirect = async (audio: string) => {
	const res = await fetch(audio);
	return res.url;
};

export const preloadAudio = (src: string): (() => void) => {
	const resolved = resolveRedirect(src);

	let cancelled = false;

	if (navigator.userAgent.match(/Firefox\//)) {
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'audio';
		resolved
			.then((realUrl) => {
				if (!cancelled) {
					link.href = realUrl;
					document.head.appendChild(link);
				}
			})
			.catch((err) => {
				console.log(`Failed to preload audio`, err);
			});
		return () => {
			cancelled = true;
			link.remove();
		};
	}

	const vid = document.createElement('audio');
	vid.preload = 'auto';
	vid.controls = true;
	resolved
		.then((realUrl) => {
			if (!cancelled) {
				vid.src = realUrl;
				vid.style.display = 'none';
				document.body.appendChild(vid);
			}
		})
		.catch((err) => {
			console.log('Failed to preload audio', err);
		});

	return () => {
		cancelled = true;
		vid.remove();
	};
};
