// @ts-expect-error
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {
	elementCategories,
	elementRegistry,
	getElementCategoryHeadingId,
} from './src/components/Elements/element-registry';

const sidebars: SidebarsConfig = {
	elementsSidebar: [
		{
			type: 'category',
			label: 'Elements',
			className: 'elements-sidebar-root catalog-sidebar-root',
			link: {type: 'doc', id: 'index'},
			collapsible: false,
			items: [
				...elementCategories.map(({category, label}) => ({
					type: 'category' as const,
					label,
					link: {type: 'doc' as const, id: `${category}/index`},
					className: 'elements-sidebar-category',
					customProps: {
						catalogHref: `/elements/#${getElementCategoryHeadingId(category)}`,
					},
					collapsible: false,
					// Keep membership for breadcrumbs, sidebar assignment, and active highlighting.
					// The sidebar renderer displays only the category link.
					items: Object.entries(elementRegistry)
						.filter(([, metadata]) => metadata.category === category)
						.map(([slug]) => `${slug}/index`),
				})),
			],
		},
		{
			type: 'html',
			value: '<hr />',
			className: 'catalog-sidebar-divider',
			defaultStyle: true,
		},
		{
			type: 'doc',
			id: 'libraries',
			className: 'catalog-sidebar-libraries',
		},
	],
};

export default sidebars;
