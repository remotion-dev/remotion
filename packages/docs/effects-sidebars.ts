// @ts-expect-error
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {effectCategories} from './src/components/Effects/effect-library-data';

const sidebars: SidebarsConfig = {
	effectsSidebar: [
		{
			type: 'link',
			label: 'Elements',
			href: '/elements/',
			className: 'catalog-sidebar-root',
		},
		{
			type: 'category',
			label: 'Effects',
			className: 'catalog-sidebar-root',
			link: {type: 'doc', id: 'index'},
			collapsible: false,
			items: [
				...effectCategories.map(({title, headingId, effects}) => ({
					type: 'category' as const,
					label: title,
					customProps: {catalogHref: `/effects/#${headingId}`},
					collapsible: false,
					items: effects.map((effect) => effect.id.slice('effects-'.length)),
				})),
				{type: 'link', label: 'API reference', href: '/docs/effects/api'},
			],
		},
	],
};

export default sidebars;
