export const elementCategories = [
	{category: 'backgrounds', label: 'Backgrounds'},
	{category: 'captions', label: 'Captions'},
	{category: 'commerce', label: 'Commerce'},
	{category: 'data', label: 'Data'},
	{category: 'maps', label: 'Maps'},
	{category: 'overlays', label: 'Overlays'},
	{category: 'storytelling', label: 'Storytelling'},
	{category: 'text', label: 'Text'},
	{category: 'youtube', label: 'YouTube'},
] as const;

export type ElementCategory = (typeof elementCategories)[number]['category'];

export const elementRegistry = {
	'backgrounds/liquid-contours': {
		category: 'backgrounds',
		displayName: 'Liquid Contours',
	},
	'backgrounds/notebook-paper': {
		category: 'backgrounds',
		displayName: 'Notebook Paper',
	},
	'backgrounds/paper-texture': {
		category: 'backgrounds',
		displayName: 'Paper Texture',
	},
	'backgrounds/rotating-starburst': {
		category: 'backgrounds',
		displayName: 'Rotating Starburst',
	},
	'captions/moving-pill-captions': {
		category: 'captions',
		displayName: 'Moving Pill Captions',
	},
	'captions/popping-word-captions': {
		category: 'captions',
		displayName: 'Popping Word Captions',
	},
	'captions/word-highlight-captions': {
		category: 'captions',
		displayName: 'Word Highlight Captions',
	},
	'commerce/product-discount-callout': {
		category: 'commerce',
		displayName: 'Product Discount Callout',
	},
	'commerce/product-offer': {
		category: 'commerce',
		displayName: 'Product Offer',
	},
	'data/horizontal-bar-chart': {
		category: 'data',
		displayName: 'Horizontal Bar Chart',
	},
	'data/line-chart': {
		category: 'data',
		displayName: 'Line Chart',
	},
	'data/number-counter': {
		category: 'data',
		displayName: 'Number Counter',
	},
	'data/pie-chart': {
		category: 'data',
		displayName: 'Pie Chart',
	},
	'data/vertical-bar-chart': {
		category: 'data',
		displayName: 'Vertical Bar Chart',
	},
	'maps/map-flyover': {
		category: 'maps',
		displayName: 'A-to-B Map Flyover',
	},
	'maps/watercolor-map': {
		category: 'maps',
		displayName: 'Watercolor Map',
	},
	'overlays/location-lower-third': {
		category: 'overlays',
		displayName: 'Location Lower Third',
	},
	'overlays/name-lower-third': {
		category: 'overlays',
		displayName: 'Name Lower Third',
	},
	'text/news-article-highlight': {
		category: 'storytelling',
		displayName: 'News Article Highlight',
	},
	'text/circle-marker': {
		category: 'text',
		displayName: 'Circle Marker',
	},
	'text/crossed-off': {
		category: 'text',
		displayName: 'Crossed Off',
	},
	'text/spinning-text-wheel': {
		category: 'text',
		displayName: 'Spinning Text Wheel',
	},
	'text/strike-through': {
		category: 'text',
		displayName: 'Strike Through',
	},
	'text/text-marker': {
		category: 'text',
		displayName: 'Text Marker',
	},
	'youtube/youtube-end-card': {
		category: 'youtube',
		displayName: 'YouTube End Card',
	},
	'youtube/youtube-subscribe-nudge': {
		category: 'youtube',
		displayName: 'YouTube Subscribe Nudge',
	},
} as const satisfies Record<
	string,
	{readonly category: ElementCategory; readonly displayName: string}
>;

export type ElementSlug = keyof typeof elementRegistry;
