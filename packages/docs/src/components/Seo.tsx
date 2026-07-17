import React from 'react';

// Do not refactor arrays!
// React Helmet does not support arrays
export const Seo = {
	renderTitle: (title: string) => {
		return [
			<title key="title1">{title}</title>,
			<meta key="title2" property="og:title" content={title} />,
		];
	},
	renderDescription: (title: string) => {
		return [
			<meta key="desc" name="description" content={title} />,
			<meta key="desc2" property="og:description" content={title} />,
		];
	},
	renderImage: (
		title: string,
		domain: string,
		dimensions?: {readonly height: number; readonly width: number},
	) => {
		const imgSrc = new URL(title, domain).href;
		const tags = [
			<meta key="img1" property="og:image" content={imgSrc} />,
			<meta key="img2" name="twitter:image" content={imgSrc} />,
		];

		if (dimensions) {
			tags.push(
				<meta
					key="imgw"
					property="og:image:width"
					content={String(dimensions.width)}
				/>,
				<meta
					key="imgh"
					property="og:image:height"
					content={String(dimensions.height)}
				/>,
			);
		}

		return tags;
	},
	renderVideo: ({
		src,
		domain,
		width,
		height,
		durationSeconds,
	}: {
		readonly src: string;
		readonly domain: string;
		readonly width: number;
		readonly height: number;
		readonly durationSeconds?: number;
	}) => {
		const videoSrc = new URL(src, domain).href;
		const tags = [
			<meta key="vid1" property="og:video" content={videoSrc} />,
			<meta key="vid2" property="og:video:secure_url" content={videoSrc} />,
			<meta key="vid3" property="og:video:type" content="video/mp4" />,
			<meta key="vid4" property="og:video:width" content={String(width)} />,
			<meta key="vid5" property="og:video:height" content={String(height)} />,
		];

		if (durationSeconds !== undefined) {
			tags.push(
				<meta
					key="vid6"
					property="og:video:duration"
					content={String(Math.round(durationSeconds))}
				/>,
			);
		}

		return tags;
	},
};
