// @ts-expect-error
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
	examplesSidebar: [
		'index',
		{
			type: 'category',
			label: 'Maps',
			link: {type: 'doc', id: 'maps/index'},
			items: [],
		},
		{
			type: 'category',
			label: 'Sport',
			link: {type: 'doc', id: 'sport/index'},
			items: [],
		},
		{
			type: 'category',
			label: 'Storytelling',
			link: {type: 'doc', id: 'storytelling/index'},
			items: [],
		},
		{
			type: 'category',
			label: 'Audio',
			link: {type: 'doc', id: 'audio/index'},
			items: [],
		},
		{
			type: 'category',
			label: 'Captions',
			link: {type: 'doc', id: 'captions/index'},
			items: [],
		},
		{
			type: 'category',
			label: 'Motion design system',
			link: {type: 'doc', id: 'motion-design-system/index'},
			items: [],
		},
		{
			type: 'category',
			label: 'Effects',
			link: {type: 'doc', id: 'effects/index'},
			items: [],
		},
		{
			type: 'category',
			label: 'WebGL',
			link: {type: 'doc', id: 'webgl/index'},
			items: [],
		},
		{
			type: 'category',
			label: '3D',
			link: {type: 'doc', id: '3d/index'},
			items: [],
		},
		{
			type: 'category',
			label: 'Remotion best practices',
			link: {type: 'doc', id: 'best-practices/index'},
			items: [],
		},
	],
};

export default sidebars;
