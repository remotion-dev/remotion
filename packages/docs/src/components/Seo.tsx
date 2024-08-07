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
};
