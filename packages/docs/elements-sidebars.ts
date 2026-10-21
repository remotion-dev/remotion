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
			label: 'All Elements',
			className: 'elements-sidebar-root',
			link: {type: 'doc', id: 'index'},
			collapsible: false,
			items: [
				{
					type: 'html',
					value:
						'<hr style="margin-top: 4px; margin-bottom: 4px; border-bottom: none"/>',
					defaultStyle: true,
				},
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
			value:
				'<hr style="margin-top: 4px; margin-bottom: 4px; border-bottom: none"/>',
			defaultStyle: true,
		},
		'libraries',
	],
};

export default sidebars;
