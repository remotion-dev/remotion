// @ts-expect-error
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
	examplesSidebar: [
		'index',
		'submit-an-example',
		{
			type: 'html',
			value:
				'<hr style="margin-top: 4px; margin-bottom: 4px; border-bottom: none"/>',
			defaultStyle: true,
		},
		{
			type: 'category',
			label: 'Motion design system',
			link: {type: 'doc', id: 'motion-design-system/index'},
			collapsed: false,
			items: ['motion-design-system/lower-third/index'],
		},
	],
};

export default sidebars;
