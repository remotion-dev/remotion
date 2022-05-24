const resolveRedirect = async (video: string) => {
	const res = await fetch(video);
	return res.url;
};

export const preloadVideo = (src: string): (() => void) => {
	const resolved = resolveRedirect(src);

	let cancelled = false;

	if (navigator.userAgent.match(/Firefox\//)) {
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'video';
		resolved
			.then((realUrl) => {
				if (!cancelled) {
					link.href = realUrl;
					document.head.appendChild(link);
				}
			})
			.catch((err) => {
				console.log(`Failed to preload video`, err);
			});
		return () => {
			cancelled = true;
			link.remove();
		};
	}

	const vid = document.createElement('video');
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
			console.log('Failed to preload video', err);
		});

	return () => {
		cancelled = true;
		vid.remove();
	};
};
