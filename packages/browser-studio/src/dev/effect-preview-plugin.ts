import type {BunPlugin} from 'bun';

export const effectPreviewPlugin: BunPlugin = {
	name: 'effect-preview',
	setup(builder) {
		builder.onResolve(
			{filter: /^@remotion\/effects\/.+\?studio-preview$/},
			(args) => ({
				path: `${Bun.resolveSync(args.path.replace(/\?studio-preview$/, ''), args.resolveDir)}?studio-preview`,
			}),
		);
		builder.onLoad({filter: /\?studio-preview$/}, async (args) => ({
			contents: await Bun.file(
				args.path.replace(/\?studio-preview$/, ''),
			).text(),
			loader: 'js',
		}));
	},
};
