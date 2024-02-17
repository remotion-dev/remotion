import type {AnyRemotionOption} from './option';

export const numberOfGifLoopsOption = {
	name: 'Number of GIF loops',
	cliFlag: 'number-of-gif-loops' as const,
	description: () => {
		return (
			<>
				Allows you to set the number of loops as follows:
				<ul>
					<li>
						<code>null</code> (or omitting in the CLI) plays the GIF
						indefinitely.
					</li>
					<li>
						<code>0</code> disables looping
					</li>
					<li>
						<code>1</code> loops the GIF once (plays twice in total)
					</li>
					<li>
						<code>2</code> loops the GIF twice (plays three times in total) and
						so on.
					</li>
				</ul>
			</>
		);
	},
	ssrName: 'numberOfGifLoops' as const,
	docLink:
		'https://www.remotion.dev/docs/render-as-gif#changing-the-number-of-loops',
	type: 0 as number | null,
} satisfies AnyRemotionOption<number | null>;
