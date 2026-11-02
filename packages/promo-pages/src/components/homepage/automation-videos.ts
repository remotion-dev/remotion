export const automationVideos = {
	parameterization: {
		videoSrc:
			'https://remotion.media/homepage/parameterization-brand-4b037d1643f4.webm',
		fallbackVideoSrc:
			'https://remotion.media/homepage/parameterization-brand-97e28abb2c0b.mp4',
	},
	batchRendering: {
		videoSrc:
			'https://remotion.media/homepage/render-progress-inset-padded-c2444f4217c0.webm',
		fallbackVideoSrc:
			'https://remotion.media/homepage/render-progress-inset-padded-25b72a686e9d.mp4',
	},
	applications: {
		videoSrc:
			'https://remotion.media/homepage/applications-map-raised-1ea081adebd3.webm',
		fallbackVideoSrc:
			'https://remotion.media/homepage/applications-map-raised-bcb117322f3a.mp4',
		videoStyle: {
			// Display the 840px editor at column width; keep the
			// wider canvas available for the orbiting cursor.
			position: 'absolute',
			top: 0,
			left: `${(-200 / 840) * 100}%`,
			width: `${(1280 / 840) * 100}%`,
			maxWidth: 'none',
			maxHeight: 'none',
			pointerEvents: 'none',
		},
	},
} as const;
