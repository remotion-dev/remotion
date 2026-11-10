export const elementCategories = [
	{category: 'audio', label: 'Audio'},
	{category: 'backgrounds', label: 'Backgrounds'},
	{category: 'captions', label: 'Captions'},
	{category: 'data', label: 'Charts & Data'},
	{category: 'commerce', label: 'Effects'},
	{category: 'layouts', label: 'Layouts'},
	{category: 'maps', label: 'Maps'},
	{category: 'overlays', label: 'Overlays'},
	{category: 'storytelling', label: 'Storytelling'},
	{category: 'text', label: 'Text Effects'},
	{category: 'youtube', label: 'YouTube'},
] as const;

export type ElementCategory = (typeof elementCategories)[number]['category'];

export const getElementCategoryHeadingId = (category: ElementCategory) => {
	return `element-category-${category}`;
};

export const elementRegistry = {
	'audio/oscilloscope': {
		category: 'audio',
		displayName: 'Oscilloscope',
		description: 'Suitable for visualizing speech.',
	},
	'audio/waveform-progress': {
		category: 'audio',
		displayName: 'Voice Note',
		description: 'A static audio waveform with playback progress.',
	},
	'audio/mirrored-spectrum': {
		category: 'audio',
		displayName: 'Mirrored Spectrum',
		description: 'Suitable for both music and speech visualization.',
	},
	'backgrounds/liquid-contours': {
		category: 'backgrounds',
		displayName: 'Liquid Contours',
		description:
			'A flowing two-color background made from animated liquid contour bands.',
	},
	'backgrounds/moving-waves': {
		category: 'backgrounds',
		displayName: 'Moving Waves',
		description: 'A seamless wave background that flows upward.',
	},
	'backgrounds/moving-zigzags': {
		category: 'backgrounds',
		displayName: 'Moving Zigzags',
		description: 'A seamless zigzag background that flows upward.',
	},
	'backgrounds/notebook-paper': {
		category: 'backgrounds',
		displayName: 'Notebook Paper',
		description: 'A white paper background with subtle blue gridlines.',
	},
	'backgrounds/paper-texture': {
		category: 'backgrounds',
		displayName: 'Paper Texture',
		description:
			'A white paper texture background with a slowly changing posterized seed.',
	},
	'backgrounds/rotating-starburst': {
		category: 'backgrounds',
		displayName: 'Rotating Starburst',
		description: 'A solid background with a slowly rotating starburst effect.',
	},
	'captions/basic-captions': {
		category: 'captions',
		displayName: 'Basic Captions',
		description:
			'Simple synchronized captions with white text on a translucent gray background.',
	},
	'captions/rounded-captions': {
		category: 'captions',
		displayName: 'Rounded Captions',
		description:
			'Static synchronized captions with a rounded background that follows each line.',
	},
	'captions/moving-pill-captions': {
		category: 'captions',
		displayName: 'Moving Pill Captions',
		description:
			'Synchronized captions with a pill that moves between spoken words.',
	},
	'captions/popping-word-captions': {
		category: 'captions',
		displayName: 'Popping Word Captions',
		description: 'Synchronized captions that pop each spoken word into focus.',
	},
	'captions/word-highlight-captions': {
		category: 'captions',
		displayName: 'Word Highlight Captions',
		description: 'Synchronized captions that highlight each spoken word.',
	},
	'commerce/product-collection': {
		category: 'layouts',
		displayName: 'Rotating Cards',
		description: 'Three cards which each take center once.',
	},
	'commerce/product-discount-callout': {
		category: 'commerce',
		displayName: 'Wiggling Callout',
		description: 'An attention-grabbing speech bubble.',
	},
	'commerce/peel': {
		category: 'commerce',
		displayName: 'Peel',
		description: 'Peels any content away with a curled paper edge.',
	},
	'commerce/shine': {
		category: 'commerce',
		displayName: 'Shine',
		description: 'Adds a diagonal shine sweep to any content.',
	},
	'commerce/tear': {
		category: 'commerce',
		displayName: 'Tear apart',
		description: 'A tear effect that can be applied to any content.',
	},
	'data/horizontal-bar-chart': {
		category: 'data',
		displayName: 'Horizontal Bar Chart',
		description: 'A bold bar chart with three directly labeled data points.',
	},
	'data/line-chart': {
		category: 'data',
		displayName: 'Line Chart',
		description: 'A bold animated line chart with a directly labeled trend.',
	},
	'data/number-counter': {
		category: 'data',
		displayName: 'Number Counter',
		description:
			'A simple animated counter that smoothly counts from a start value to an end value.',
	},
	'data/pie-chart': {
		category: 'data',
		displayName: 'Pie Chart',
		description:
			'A bold animated pie chart with four directly labeled data points.',
	},
	'data/vertical-bar-chart': {
		category: 'data',
		displayName: 'Vertical Bar Chart',
		description:
			'A bold vertical bar chart with three directly labeled data points.',
	},
	'layouts/picture-in-picture-transition': {
		category: 'layouts',
		displayName: 'Picture in Picture Transition',
		description:
			'Animates an element from being fullscreen to being displayed in a box.',
	},
	'layouts/slide-to-split-screen': {
		category: 'layouts',
		displayName: 'Slide to Split Screen',
		description:
			'A fullscreen scene that opens into a 60/40 split-screen layout.',
	},
	'maps/map-flyover': {
		category: 'maps',
		displayName: 'A-to-B Map Flyover',
		description:
			'An animated map flyover from point A to point B, with editable coordinates, location labels, and a camera that follows the route.',
	},
	'maps/spinning-globe': {
		category: 'maps',
		displayName: 'Spinning Globe',
		description:
			'A globe rotating around its vertical axis, with editable speed, longitude, and shading.',
	},
	'maps/watercolor-map': {
		category: 'maps',
		displayName: 'Watercolor Map',
		description:
			'A watercolor map journey between two editable locations, with animated labels, markers, and a hand-drawn route.',
	},
	'overlays/location-lower-third': {
		category: 'overlays',
		displayName: 'Location Lower Third',
		description: 'An animated lower third for an event location and venue.',
	},
	'overlays/name-lower-third': {
		category: 'overlays',
		displayName: 'Name Lower Third',
		description:
			'A clean animated lower third for introducing a speaker, guest, or host.',
	},
	'overlays/social-safe-zones': {
		category: 'overlays',
		displayName: 'Social Safe Zones',
		description:
			'Preview TikTok and Instagram Reels interfaces to keep important content visible.',
	},
	'storytelling/on-screen-messages': {
		category: 'storytelling',
		displayName: 'On-Screen Messages',
		description:
			'An iMessage-inspired text exchange with staggered reveals and familiar blue and gray chat bubbles.',
	},
	'storytelling/polaroid-pictures': {
		category: 'storytelling',
		displayName: 'Polaroid Pictures',
		description:
			'A staggered instant-photo montage with handwritten captions, paper shadows, and developing-photo accents.',
	},
	'storytelling/speed-lines': {
		category: 'storytelling',
		displayName: 'Speed Lines',
		description: 'A burst of animated radial speed lines around a subject.',
	},
	'text/news-article-highlight': {
		category: 'storytelling',
		displayName: 'News Article Highlight',
		description: 'A centered news headline with animated passage highlights.',
	},
	'text/circle-marker': {
		category: 'text',
		displayName: 'Circle Marker',
		description:
			'An animated hand-drawn circle with posterized drawing progress and shape changes.',
	},
	'text/crossed-off': {
		category: 'text',
		displayName: 'Crossed Off',
		description:
			'An animated hand-drawn cross for removing a word or phrase with emphasis.',
	},
	'text/cylinder-text': {
		category: 'text',
		displayName: 'Cylinder Text',
		description:
			'Editable text spinning around a tilted cylinder using WebGPU.',
	},
	'text/spinning-text-wheel': {
		category: 'text',
		displayName: 'Spinning Text Wheel',
		description:
			'A 3D text wheel that spins through options and decelerates onto a highlighted selection.',
	},
	'text/strike-through': {
		category: 'text',
		displayName: 'Strike Through',
		description:
			'An animated hand-drawn line for striking through a word or phrase.',
	},
	'text/text-marker': {
		category: 'text',
		displayName: 'Text Marker',
		description:
			'A hand-drawn animated text marker for calling attention to one phrase.',
	},
	'youtube/youtube-comment-highlight': {
		category: 'youtube',
		displayName: 'YouTube Comment Highlight',
		description: 'A YouTube-style card for featuring a viewer comment.',
	},
	'youtube/youtube-end-card': {
		category: 'youtube',
		displayName: 'YouTube End Card',
		description:
			'A clean YouTube endcard with social links and space for recommended videos.',
	},
	'youtube/youtube-subscribe-nudge': {
		category: 'youtube',
		displayName: 'YouTube Subscribe Nudge',
		description:
			'An animated creator-branded subscribe prompt with a subscribed-state confirmation.',
	},
} as const satisfies Record<
	string,
	{
		readonly category: ElementCategory;
		readonly description: string;
		readonly displayName: string;
	}
>;

export type ElementSlug = keyof typeof elementRegistry;
