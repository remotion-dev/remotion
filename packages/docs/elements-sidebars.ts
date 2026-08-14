// @ts-expect-error
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {
	elementCategories,
	elementRegistry,
} from './src/components/Elements/element-registry';

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
		'index',
		'contributing',
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
			collapsed: false,
			items: Object.entries(elementRegistry)
				.filter(([, metadata]) => metadata.category === category)
				.sort(([, a], [, b]) => compareStrings(a.displayName, b.displayName))
				.map(([slug]) => `${slug}/index`),
		})),
	],
};

export default sidebars;
