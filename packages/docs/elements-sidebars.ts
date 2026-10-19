// @ts-expect-error
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {
	elementCategories,
	elementRegistry,
} from './src/components/Elements/element-registry';

// Keep navigation alphabetical; the library uses the curated definitions array order.
const compareStrings = (a: string, b: string) => {
	if (a < b) {
		return -1;
	}

	if (a > b) {
		return 1;
	}

	return 0;
};

const sidebars: SidebarsConfig = {
	elementsSidebar: [
		{
			type: 'category',
			label: 'All Elements',
			className: 'elements-sidebar-root',
			link: {type: 'doc', id: 'index'},
			collapsible: false,
			items: [
				...elementCategories.map(({category, label}) => ({
					type: 'category' as const,
					label,
					link: {type: 'doc' as const, id: `${category}/index`},
					className: 'elements-sidebar-category',
					collapsible: false,
					// Keep membership for breadcrumbs, sidebar assignment, and active highlighting.
					// The category renderer displays only the link, not these children.
					items: Object.entries(elementRegistry)
						.filter(([, metadata]) => metadata.category === category)
						.sort(([, a], [, b]) =>
							compareStrings(a.displayName, b.displayName),
						)
						.map(([slug]) => `${slug}/index`),
				})),
				{
					type: 'html',
					value:
						'<hr style="margin-top: 4px; margin-bottom: 4px; border-bottom: none"/>',
					defaultStyle: true,
				},
				{
					type: 'doc',
					id: 'guidelines',
					className: 'elements-sidebar-standalone-only',
				},
				'libraries',
			],
		},
	],
};

export default sidebars;
