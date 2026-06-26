// @ts-expect-error
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
	elementsSidebar: [
		'index',
		'submit-an-element',
		{
			type: 'html',
			value:
				'<hr style="margin-top: 4px; margin-bottom: 4px; border-bottom: none"/>',
			defaultStyle: true,
		},
		{
			type: 'category',
			label: 'Overlays',
			link: {type: 'doc', id: 'overlays/index'},
			collapsed: false,
			items: ['overlays/lower-third/index'],
		},
	],
};

export default sidebars;
