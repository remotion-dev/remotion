// @ts-expect-error
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
	examplesSidebar: [
		'index',
		'suggest-an-example',
		{
			type: 'html',
			value:
				'<hr style="margin-top: 4px; margin-bottom: 4px; border-bottom: none"/>',
			defaultStyle: true,
		},
		{
			type: 'category',
			label: 'Maps',
			link: {type: 'doc', id: 'maps/index'},
			collapsed: false,
			items: ['maps/mapbox-line-from-a-to-b', 'maps/3d-building'],
		},
		{
			type: 'category',
			label: 'Sport',
			link: {type: 'doc', id: 'sport/index'},
			collapsed: false,
			items: ['sport/strava-visualization', 'sport/mapbox-athletes-eye-demo'],
		},
		{
			type: 'category',
			label: 'Storytelling',
			link: {type: 'doc', id: 'storytelling/index'},
			collapsed: false,
			items: [
				'storytelling/paper-js-highlight',
				'storytelling/news-headline',
				'storytelling/bar-chart',
				'storytelling/pie-chart',
				'storytelling/number-wheel',
			],
		},
		{
			type: 'category',
			label: 'Audio',
			link: {type: 'doc', id: 'audio/index'},
			collapsed: false,
			items: ['audio/music-visualizer', 'audio/audiogram'],
		},
		{
			type: 'category',
			label: 'Captions',
			link: {type: 'doc', id: 'captions/index'},
			collapsed: false,
			items: ['captions/tiktok-style-captions', 'captions/lyrics-animation'],
		},
		{
			type: 'category',
			label: 'Motion design system',
			link: {type: 'doc', id: 'motion-design-system/index'},
			collapsed: false,
			items: ['motion-design-system/lower-third', 'motion-design-system/code-example'],
		},
		{
			type: 'category',
			label: 'Effects',
			link: {type: 'doc', id: 'effects/index'},
			collapsed: false,
			items: [
				'effects/greenscreen',
				'effects/wiggle',
				'effects/magnifier',
				'effects/sticker-peel',
			],
		},
		{
			type: 'category',
			label: 'WebGL',
			link: {type: 'doc', id: 'webgl/index'},
			collapsed: false,
			items: ['webgl/chromatic-aberration'],
		},
		{
			type: 'category',
			label: '3D',
			link: {type: 'doc', id: '3d/index'},
			collapsed: false,
			items: ['3d/spinning-object', '3d/video-texture'],
		},
		{
			type: 'category',
			label: 'Remotion best practices',
			link: {type: 'doc', id: 'best-practices/index'},
			collapsed: false,
			items: ['best-practices/drag-and-drop', 'best-practices/jumpcuts-technique'],
		},
	],
};

export default sidebars;
