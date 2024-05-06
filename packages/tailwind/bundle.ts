import {build, revision} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

if (!revision.startsWith('07ce')) {
	// eslint-disable-next-line no-console
	console.warn('warn: Remotion currently uses a fork of Bun to bundle.');
	// eslint-disable-next-line no-console
	console.log(
		'You dont currently run the fork, this could lead to duplicate key warnings in React.',
	);
}

const output = await build({
	entrypoints: ['src/enable.ts'],
	naming: '[name].mjs',
	target: 'node',
	external: [
		'@csstools/postcss-unset-value',
		'@csstools/postcss-trigonometric-functions',
		'@csstools/postcss-text-decoration-shorthand',
		'@csstools/postcss-stepped-value-functions',
		'@csstools/postcss-scope-pseudo-class',
		'postcss-color-rebeccapurple',
		'css-prefers-color-scheme',
		'postcss-place',
		'postcss-replace-overflow-wrap',
		'postcss-overflow-shorthand',
		'postcss-opacity-percentage',
		'@csstools/postcss-oklab-function',
		'postcss-selector-not',
		'postcss-nesting',
		'@csstools/postcss-nested-calc',
		'@csstools/postcss-media-minmax',
		'@csstools/postcss-media-queries-aspect-ratio-number-values',
		'@csstools/postcss-logical-viewport-units',
		'@csstools/postcss-logical-resize',
		'postcss-logical',
		'postcss-lab-function',
		'@csstools/postcss-is-pseudo-class',
		'postcss-image-set-function',
		'@csstools/postcss-ic-unit',
		'@csstools/postcss-hwb-function',
		'postcss-color-hex-alpha',
		'css-has-pseudo',
		'@csstools/postcss-gradients-interpolation-method',
		'postcss-gap-properties',
		'postcss-font-variant',
		'@csstools/postcss-font-format-keywords',
		'postcss-focus-within',
		'postcss-focus-visible',
		'@csstools/postcss-logical-float-and-clear',
		'postcss-double-position-gradients',
		'@csstools/postcss-normalize-display-values',
		'postcss-dir-pseudo-class',
		'postcss-custom-selectors',
		'postcss-custom-properties',
		'postcss-custom-media',
		'@csstools/postcss-color-mix-function',
		'postcss-color-functional-notation',
		'@csstools/postcss-color-function',
		'postcss-clamp',
		'postcss-attribute-case-insensitive',
		'@csstools/postcss-cascade-layers',
		'postcss-page-break',
		'cssdb',
		'@csstools/postcss-progressive-custom-properties',
		'browserslist',
		'postcss-initial',
		'postcss-pseudo-class-any-link',
		'css-blank-pseudo',
		'postcss-pseudo-class-any-link',
		'style-loader',
		'tailwindcss',
		'css-loader',
		'autoprefixer',
		'postcss-loader',
		'postcss-preset-env',
	],
});

const [file] = output.outputs;
const text = await file.text();

await Bun.write('dist/esm/index.mjs', text);

export {};
