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
	renderImage: (title: string, domain: string) => {
		const imgSrc = new URL(title, domain).href;

		return [
			<meta key="img1" property="og:image" content={imgSrc} />,
			<meta key="img2" name="twitter:image" content={imgSrc} />,
		];
	},
	renderVideo: ({
		height,
		url,
		width,
	}: {
		readonly height: number;
		readonly url: string;
		readonly width: number;
	}) => {
		return [
			<meta key="video1" property="og:video" content={url} />,
			<meta key="video2" property="og:video:secure_url" content={url} />,
			<meta key="video3" property="og:video:type" content="video/mp4" />,
			<meta key="video4" property="og:video:width" content={String(width)} />,
			<meta key="video5" property="og:video:height" content={String(height)} />,
		];
	},
};
