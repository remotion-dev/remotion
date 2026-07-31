import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import React from 'react';
import {Seo} from '../Seo';
import {
	getElementCategoryLabel,
	type ElementCategory,
} from './element-library-data';

const SOCIAL_IMAGE = '/img/social-preview.png';

const getTitle = (category: ElementCategory | null) => {
	if (category === null) {
		return 'Remotion Elements | Remotion';
	}

	return `${getElementCategoryLabel(category)} | Remotion Elements`;
};

const getDescription = (category: ElementCategory | null) => {
	if (category === null) {
		return 'Drop-in, remixable video building blocks for Remotion.';
	}

	return `Browse ${getElementCategoryLabel(
		category,
	).toLowerCase()} Elements in Remotion's library.`;
};

const getCanonicalPath = (category: ElementCategory | null) => {
	return category === null ? '/elements/' : `/elements/${category}/`;
};

export const ElementHead: React.FC<{
	readonly category: ElementCategory | null;
}> = ({category}) => {
	const context = useDocusaurusContext();
	const canonicalPath = getCanonicalPath(category);
	const canonicalUrl = new URL(canonicalPath, context.siteConfig.url).href;

	return (
		<Head>
			{Seo.renderTitle(getTitle(category))}
			{Seo.renderDescription(getDescription(category))}
			<link rel="canonical" href={canonicalUrl} />
			{Seo.renderImage(SOCIAL_IMAGE, context.siteConfig.url)}
			<meta name="twitter:card" content="summary_large_image" />
		</Head>
	);
};
