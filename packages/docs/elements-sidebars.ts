// @ts-expect-error
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
	elementsSidebar: [
		'index',
		'guidelines',
		'submit-an-element',
		{
			type: 'html',
			value:
				'<hr style="margin-top: 4px; margin-bottom: 4px; border-bottom: none"/>',
			defaultStyle: true,
		},
		{
			type: 'category',
			label: 'Backgrounds',
			link: {type: 'doc', id: 'backgrounds/index'},
			collapsed: false,
			items: [
				'backgrounds/liquid-contours/index',
				'backgrounds/notebook-paper/index',
				'backgrounds/paper-texture/index',
				'backgrounds/rotating-starburst/index',
			],
		},
		{
			type: 'category',
			label: 'Data',
			link: {type: 'doc', id: 'data/index'},
			collapsed: false,
			items: ['data/number-counter/index'],
		},
		{
			type: 'category',
			label: 'Overlays',
			link: {type: 'doc', id: 'overlays/index'},
			collapsed: false,
			items: [
				'overlays/corner-channel-bug/index',
				'overlays/lower-third/index',
			],
		},
		{
			type: 'category',
			label: 'Text',
			link: {type: 'doc', id: 'text/index'},
			collapsed: false,
			items: [
				'text/circle-marker/index',
				'text/crossed-off/index',
				'text/strike-through/index',
				'text/text-marker/index',
			],
		},
	],
};

export default sidebars;
